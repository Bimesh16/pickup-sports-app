-- Migration: Game Templates and Team Formation System
-- Version: V1051
-- Description: Creates game templates, teams, and team members tables for dynamic team formation

-- Create game_templates table
CREATE TABLE IF NOT EXISTS game_templates (
    id BIGSERIAL PRIMARY KEY,
    
    -- Template Configuration
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    format VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    
    -- Team Structure
    players_per_team INTEGER NOT NULL CHECK (players_per_team >= 1 AND players_per_team <= 15),
    total_teams INTEGER NOT NULL DEFAULT 2 CHECK (total_teams >= 2 AND total_teams <= 4),
    min_players INTEGER NOT NULL CHECK (min_players >= 2 AND min_players <= 60),
    max_players INTEGER NOT NULL CHECK (max_players >= 2 AND max_players <= 100),
    substitute_slots INTEGER DEFAULT 0 CHECK (substitute_slots >= 0 AND substitute_slots <= 10),
    
    -- Game Settings
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 480),
    default_rules TEXT,
    required_equipment VARCHAR(500),
    positions TEXT, -- JSON array of positions
    
    -- Business Rules
    skill_balancing_required BOOLEAN DEFAULT true,
    captain_assignment_required BOOLEAN DEFAULT true,
    position_assignment_required BOOLEAN DEFAULT false,
    requires_even_teams BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    popularity INTEGER DEFAULT 0 CHECK (popularity >= 0),
    created_by VARCHAR(100),
    
    -- Constraints
    CONSTRAINT chk_min_max_players CHECK (max_players >= min_players),
    CONSTRAINT chk_team_capacity CHECK (max_players >= (total_teams * players_per_team))
);

-- Create indexes for game_templates
CREATE INDEX idx_game_template_sport ON game_templates(sport);
CREATE INDEX idx_game_template_format ON game_templates(format);  
CREATE INDEX idx_game_template_active ON game_templates(is_active);
CREATE INDEX idx_game_template_popularity ON game_templates(popularity DESC);
CREATE INDEX idx_game_template_sport_format ON game_templates(sport, format);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core Relationships
    game_id BIGINT NOT NULL,
    
    -- Team Identity
    team_name VARCHAR(50) NOT NULL,
    team_color VARCHAR(7), -- HEX color code
    team_number INTEGER NOT NULL CHECK (team_number >= 1 AND team_number <= 4),
    
    -- Team Leadership
    captain_id BIGINT,
    co_captain_id BIGINT,
    
    -- Team Statistics
    average_skill_level DECIMAL(3,2) CHECK (average_skill_level >= 0.0 AND average_skill_level <= 5.0),
    total_experience INTEGER DEFAULT 0 CHECK (total_experience >= 0),
    active_players_count INTEGER DEFAULT 0 CHECK (active_players_count >= 0),
    substitute_players_count INTEGER DEFAULT 0 CHECK (substitute_players_count >= 0),
    
    -- Team Formation Metadata
    is_balanced BOOLEAN DEFAULT false,
    formation_strategy VARCHAR(20) DEFAULT 'SKILL_BALANCED' CHECK (
        formation_strategy IN ('SKILL_BALANCED', 'RANDOM', 'MANUAL', 'DRAFT', 'FRIEND_GROUPS')
    ),
    formed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    formation_notes VARCHAR(500),
    
    -- Team Status
    status VARCHAR(20) NOT NULL DEFAULT 'FORMING' CHECK (
        status IN ('FORMING', 'READY', 'PLAYING', 'COMPLETED', 'DISBANDED')
    ),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_teams_game FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
    CONSTRAINT fk_teams_captain FOREIGN KEY (captain_id) REFERENCES app_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_teams_co_captain FOREIGN KEY (co_captain_id) REFERENCES app_user(id) ON DELETE SET NULL,
    
    -- Unique Constraints
    CONSTRAINT uk_team_number_per_game UNIQUE (game_id, team_number)
);

-- Create indexes for teams
CREATE INDEX idx_team_game ON teams(game_id);
CREATE INDEX idx_team_captain ON teams(captain_id);
CREATE INDEX idx_team_number ON teams(game_id, team_number);
CREATE INDEX idx_team_status ON teams(status);
CREATE INDEX idx_team_formation_strategy ON teams(formation_strategy);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core Relationships
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Team Role & Position
    member_type VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (
        member_type IN ('ACTIVE', 'SUBSTITUTE', 'CAPTAIN', 'CO_CAPTAIN')
    ),
    preferred_position VARCHAR(20),
    assigned_position VARCHAR(20),
    is_substitute BOOLEAN DEFAULT false,
    jersey_number INTEGER CHECK (jersey_number >= 1 AND jersey_number <= 99),
    
    -- Payment & Financial Tracking
    amount_owed DECIMAL(8,2) DEFAULT 0.00 CHECK (amount_owed >= 0),
    amount_paid DECIMAL(8,2) DEFAULT 0.00 CHECK (amount_paid >= 0),
    payment_intent_id VARCHAR(100),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'WAIVED', 'PARTIAL')
    ),
    
    -- Game Day Experience
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_in_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Post-Game Tracking
    attended BOOLEAN DEFAULT false,
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    feedback VARCHAR(500),
    
    -- Team Formation Context
    assignment_reason VARCHAR(100),
    manual_assignment BOOLEAN DEFAULT false,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_team_member UNIQUE (team_id, user_id),
    CONSTRAINT uk_team_jersey UNIQUE (team_id, jersey_number)
);

-- Create indexes for team_members
CREATE INDEX idx_team_member_team ON team_members(team_id);
CREATE INDEX idx_team_member_user ON team_members(user_id);
CREATE INDEX idx_team_member_game_user ON team_members(team_id, user_id);
CREATE INDEX idx_team_member_position ON team_members(preferred_position);
CREATE INDEX idx_team_member_payment ON team_members(payment_status);
CREATE INDEX idx_team_member_attendance ON team_members(attended);

-- Add game_template_id to existing game table
ALTER TABLE game ADD COLUMN IF NOT EXISTS game_template_id BIGINT;
ALTER TABLE game ADD CONSTRAINT IF NOT EXISTS fk_game_template 
    FOREIGN KEY (game_template_id) REFERENCES game_templates(id) ON DELETE SET NULL;

-- Create index for game template relationship
CREATE INDEX IF NOT EXISTS idx_game_template ON game(game_template_id);

-- Create trigger to auto-update team statistics when members change
CREATE OR REPLACE FUNCTION update_team_statistics() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update player counts
    UPDATE teams SET 
        active_players_count = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = NEW.team_id AND is_substitute = false
        ),
        substitute_players_count = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = NEW.team_id AND is_substitute = true
        )
    WHERE id = NEW.team_id;
    
    -- Update average skill level (placeholder - would need User skill level mapping)
    UPDATE teams SET 
        average_skill_level = 2.0, -- Placeholder calculation
        total_experience = (
            SELECT COUNT(*) FROM team_members WHERE team_id = NEW.team_id
        ) * 5 -- Placeholder experience calculation
    WHERE id = NEW.team_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_statistics
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_statistics();

-- Create trigger to auto-update game template popularity
CREATE OR REPLACE FUNCTION update_template_popularity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.game_template_id IS NOT NULL THEN
        UPDATE game_templates SET 
            popularity = popularity + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.game_template_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_popularity
    AFTER INSERT ON game
    FOR EACH ROW EXECUTE FUNCTION update_template_popularity();