-- Migration V1070: Cricket Features and International Payments
-- Author: Pickup Sports App Team
-- Description: Add cricket-specific entities and international payment support

-- =============================================
-- Cricket Match Management Tables
-- =============================================

-- Game Templates Table
CREATE TABLE IF NOT EXISTS game_templates (
    id                              BIGSERIAL PRIMARY KEY,
    name                           VARCHAR(100) NOT NULL,
    sport                          VARCHAR(50) NOT NULL,
    format                         VARCHAR(20) NOT NULL,
    players_per_team               INTEGER NOT NULL CHECK (players_per_team >= 1 AND players_per_team <= 50),
    total_teams                    INTEGER NOT NULL DEFAULT 2 CHECK (total_teams >= 2 AND total_teams <= 10),
    min_players                    INTEGER NOT NULL CHECK (min_players >= 2 AND min_players <= 100),
    max_players                    INTEGER NOT NULL CHECK (max_players >= 2 AND max_players <= 100),
    substitute_slots               INTEGER DEFAULT 0 CHECK (substitute_slots >= 0 AND substitute_slots <= 20),
    duration_minutes               INTEGER NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 480),
    default_rules                  TEXT,
    required_equipment             TEXT,
    skill_balancing_required       BOOLEAN DEFAULT TRUE,
    captain_assignment_required    BOOLEAN DEFAULT FALSE,
    position_assignment_required   BOOLEAN DEFAULT FALSE,
    is_active                      BOOLEAN DEFAULT TRUE,
    popularity                     INTEGER DEFAULT 0 CHECK (popularity >= 0),
    created_at                     TIMESTAMPTZ DEFAULT NOW(),
    updated_at                     TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id                    BIGSERIAL PRIMARY KEY,
    game_id               BIGINT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    team_name             VARCHAR(50) NOT NULL,
    team_color            VARCHAR(7), -- HEX color code
    team_number           INTEGER NOT NULL CHECK (team_number >= 1 AND team_number <= 10),
    captain_id            BIGINT REFERENCES app_user(id),
    average_skill_level   DECIMAL(3,2) CHECK (average_skill_level >= 0.0 AND average_skill_level <= 5.0),
    total_experience      INTEGER DEFAULT 0 CHECK (total_experience >= 0),
    formed_at             TIMESTAMPTZ DEFAULT NOW(),
    is_balanced           BOOLEAN DEFAULT FALSE,
    formation_strategy    VARCHAR(20) DEFAULT 'SKILL_BALANCED'
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id                    BIGSERIAL PRIMARY KEY,
    team_id               BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id               BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    preferred_position    VARCHAR(20),
    is_substitute         BOOLEAN DEFAULT FALSE,
    jersey_number         INTEGER CHECK (jersey_number >= 1 AND jersey_number <= 99),
    member_role           VARCHAR(15) DEFAULT 'PLAYER',
    checked_in            BOOLEAN DEFAULT FALSE,
    checked_in_at         TIMESTAMPTZ,
    joined_team_at        TIMESTAMPTZ DEFAULT NOW(),
    performance_rating    INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    member_notes          VARCHAR(500),
    attended              BOOLEAN,
    minutes_played        INTEGER CHECK (minutes_played >= 0),
    
    UNIQUE(team_id, user_id)
);

-- Cricket Matches Table
CREATE TABLE IF NOT EXISTS cricket_matches (
    id                      BIGSERIAL PRIMARY KEY,
    game_id                 BIGINT NOT NULL UNIQUE REFERENCES game(id) ON DELETE CASCADE,
    match_format            VARCHAR(20) NOT NULL,
    match_status            VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    toss_winning_team_id    BIGINT REFERENCES teams(id),
    toss_decision           VARCHAR(20),
    current_innings         INTEGER CHECK (current_innings >= 0 AND current_innings <= 4),
    batting_team_id         BIGINT REFERENCES teams(id),
    bowling_team_id         BIGINT REFERENCES teams(id),
    max_overs_per_innings   INTEGER CHECK (max_overs_per_innings >= 1 AND max_overs_per_innings <= 50),
    innings_per_team        INTEGER DEFAULT 1 CHECK (innings_per_team >= 1 AND innings_per_team <= 2),
    match_start_time        TIMESTAMPTZ,
    match_end_time          TIMESTAMPTZ,
    weather_conditions      VARCHAR(200),
    pitch_conditions        VARCHAR(200),
    umpire_id               BIGINT REFERENCES app_user(id),
    scorer_id               BIGINT REFERENCES app_user(id),
    dls_applicable          BOOLEAN DEFAULT FALSE,
    dls_target              INTEGER CHECK (dls_target >= 0),
    dls_overs               INTEGER CHECK (dls_overs >= 0),
    match_result            VARCHAR(500),
    winning_team_id         BIGINT REFERENCES teams(id),
    victory_margin          VARCHAR(100),
    man_of_match_id         BIGINT REFERENCES app_user(id),
    match_highlights        TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Cricket Innings Table
CREATE TABLE IF NOT EXISTS cricket_innings (
    id                      BIGSERIAL PRIMARY KEY,
    cricket_match_id        BIGINT NOT NULL REFERENCES cricket_matches(id) ON DELETE CASCADE,
    innings_number          INTEGER NOT NULL CHECK (innings_number >= 1 AND innings_number <= 4),
    batting_team_id         BIGINT NOT NULL REFERENCES teams(id),
    bowling_team_id         BIGINT NOT NULL REFERENCES teams(id),
    innings_status          VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    total_runs              INTEGER DEFAULT 0 CHECK (total_runs >= 0),
    total_wickets           INTEGER DEFAULT 0 CHECK (total_wickets >= 0 AND total_wickets <= 10),
    overs_completed         INTEGER DEFAULT 0 CHECK (overs_completed >= 0),
    balls_in_current_over   INTEGER DEFAULT 0 CHECK (balls_in_current_over >= 0 AND balls_in_current_over <= 7),
    target_score            INTEGER CHECK (target_score >= 0),
    required_run_rate       DECIMAL(5,2) CHECK (required_run_rate >= 0.0),
    current_run_rate        DECIMAL(5,2) CHECK (current_run_rate >= 0.0),
    total_extras            INTEGER DEFAULT 0 CHECK (total_extras >= 0),
    byes                    INTEGER DEFAULT 0 CHECK (byes >= 0),
    leg_byes                INTEGER DEFAULT 0 CHECK (leg_byes >= 0),
    wides                   INTEGER DEFAULT 0 CHECK (wides >= 0),
    no_balls                INTEGER DEFAULT 0 CHECK (no_balls >= 0),
    penalty_runs            INTEGER DEFAULT 0 CHECK (penalty_runs >= 0),
    innings_start_time      TIMESTAMPTZ,
    innings_end_time        TIMESTAMPTZ,
    innings_conclusion      VARCHAR(20),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Cricket Player Performance Table
CREATE TABLE IF NOT EXISTS cricket_player_performance (
    id                      BIGSERIAL PRIMARY KEY,
    innings_id              BIGINT NOT NULL REFERENCES cricket_innings(id) ON DELETE CASCADE,
    player_id               BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    player_role             VARCHAR(20) NOT NULL,
    
    -- Batting Statistics
    runs_scored             INTEGER DEFAULT 0 CHECK (runs_scored >= 0),
    balls_faced             INTEGER DEFAULT 0 CHECK (balls_faced >= 0),
    fours_hit               INTEGER DEFAULT 0 CHECK (fours_hit >= 0),
    sixes_hit               INTEGER DEFAULT 0 CHECK (sixes_hit >= 0),
    dismissal_type          VARCHAR(25),
    dismissed_by_bowler_id  BIGINT REFERENCES app_user(id),
    dismissed_by_fielder_id BIGINT REFERENCES app_user(id),
    is_not_out              BOOLEAN DEFAULT TRUE,
    
    -- Bowling Statistics
    overs_bowled            DECIMAL(4,1) DEFAULT 0.0 CHECK (overs_bowled >= 0.0 AND overs_bowled <= 50.0),
    maiden_overs            INTEGER DEFAULT 0 CHECK (maiden_overs >= 0),
    runs_conceded           INTEGER DEFAULT 0 CHECK (runs_conceded >= 0),
    wickets_taken           INTEGER DEFAULT 0 CHECK (wickets_taken >= 0 AND wickets_taken <= 10),
    wides_bowled            INTEGER DEFAULT 0 CHECK (wides_bowled >= 0),
    no_balls_bowled         INTEGER DEFAULT 0 CHECK (no_balls_bowled >= 0),
    
    -- Fielding Statistics
    catches_taken           INTEGER DEFAULT 0 CHECK (catches_taken >= 0),
    run_outs                INTEGER DEFAULT 0 CHECK (run_outs >= 0),
    stumpings               INTEGER DEFAULT 0 CHECK (stumpings >= 0),
    dropped_catches         INTEGER DEFAULT 0 CHECK (dropped_catches >= 0),
    
    -- Calculated Statistics
    strike_rate             DECIMAL(6,2) CHECK (strike_rate >= 0.0),
    economy_rate            DECIMAL(5,2) CHECK (economy_rate >= 0.0),
    performance_rating      INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
    impact_score            DECIMAL(5,2) CHECK (impact_score >= 0.0),
    
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(innings_id, player_id)
);

-- Cricket Ball-by-Ball Table
CREATE TABLE IF NOT EXISTS cricket_balls (
    id                      BIGSERIAL PRIMARY KEY,
    innings_id              BIGINT NOT NULL REFERENCES cricket_innings(id) ON DELETE CASCADE,
    over_number             INTEGER NOT NULL CHECK (over_number >= 1),
    ball_number             INTEGER NOT NULL CHECK (ball_number >= 1 AND ball_number <= 8),
    bowler_id               BIGINT NOT NULL REFERENCES app_user(id),
    batsman_on_strike_id    BIGINT NOT NULL REFERENCES app_user(id),
    batsman_non_strike_id   BIGINT REFERENCES app_user(id),
    runs_off_ball           INTEGER DEFAULT 0 CHECK (runs_off_ball >= 0 AND runs_off_ball <= 6),
    ball_outcome            VARCHAR(20) NOT NULL,
    is_wicket               BOOLEAN DEFAULT FALSE,
    wicket_type             VARCHAR(25),
    fielder_id              BIGINT REFERENCES app_user(id),
    is_extra                BOOLEAN DEFAULT FALSE,
    extra_type              VARCHAR(20),
    shot_type               VARCHAR(50),
    shot_direction          VARCHAR(50),
    ball_speed_kmph         DECIMAL(5,2) CHECK (ball_speed_kmph >= 0.0 AND ball_speed_kmph <= 200.0),
    commentary              VARCHAR(500),
    ball_time               TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- International Payment Tables
-- =============================================

-- Payment Records Table
CREATE TABLE IF NOT EXISTS payment_records (
    id                      BIGSERIAL PRIMARY KEY,
    payment_intent_id       VARCHAR(255) NOT NULL UNIQUE,
    game_id                 BIGINT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    user_id                 BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    amount                  DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency                VARCHAR(3) NOT NULL,
    original_amount         DECIMAL(10,2),
    original_currency       VARCHAR(3),
    exchange_rate           DECIMAL(10,6),
    gateway                 VARCHAR(20) NOT NULL,
    gateway_transaction_id  VARCHAR(255),
    country                 VARCHAR(2) NOT NULL,
    payment_method_id       VARCHAR(100),
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    gateway_response        JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    completed_at            TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ
);

-- Exchange Rates Table (for currency conversion)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id              BIGSERIAL PRIMARY KEY,
    from_currency   VARCHAR(3) NOT NULL,
    to_currency     VARCHAR(3) NOT NULL,
    rate            DECIMAL(15,8) NOT NULL CHECK (rate > 0),
    provider        VARCHAR(50) NOT NULL,
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    is_active       BOOLEAN DEFAULT TRUE,
    
    UNIQUE(from_currency, to_currency, provider)
);

-- Country Regions Table (for location-based discovery)
CREATE TABLE IF NOT EXISTS country_regions (
    id              BIGSERIAL PRIMARY KEY,
    country_code    VARCHAR(2) NOT NULL,
    region_code     VARCHAR(10) NOT NULL,
    region_name     VARCHAR(100) NOT NULL,
    min_lat         DECIMAL(10,7) NOT NULL,
    max_lat         DECIMAL(10,7) NOT NULL,
    min_lon         DECIMAL(11,7) NOT NULL,
    max_lon         DECIMAL(11,7) NOT NULL,
    timezone        VARCHAR(50),
    major_cities    JSONB, -- Array of major cities
    is_active       BOOLEAN DEFAULT TRUE,
    
    UNIQUE(country_code, region_code)
);

-- User Location Preferences Table
CREATE TABLE IF NOT EXISTS user_location_preferences (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    primary_country         VARCHAR(2),
    primary_region          VARCHAR(10),
    favorite_countries      JSONB, -- Array of country codes
    favorite_regions        JSONB, -- Array of region codes  
    last_known_lat          DECIMAL(10,7),
    last_known_lon          DECIMAL(11,7),
    last_location_update    TIMESTAMPTZ,
    location_sharing_enabled BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Game Templates Indexes
CREATE INDEX IF NOT EXISTS idx_game_templates_sport ON game_templates(sport);
CREATE INDEX IF NOT EXISTS idx_game_templates_format ON game_templates(format);
CREATE INDEX IF NOT EXISTS idx_game_templates_active ON game_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_game_templates_popularity ON game_templates(popularity);

-- Teams Indexes
CREATE INDEX IF NOT EXISTS idx_teams_game_id ON teams(game_id);
CREATE INDEX IF NOT EXISTS idx_teams_captain ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_teams_number ON teams(team_number);

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_position ON team_members(preferred_position);

-- Cricket Matches Indexes
CREATE INDEX IF NOT EXISTS idx_cricket_match_game ON cricket_matches(game_id);
CREATE INDEX IF NOT EXISTS idx_cricket_match_format ON cricket_matches(match_format);
CREATE INDEX IF NOT EXISTS idx_cricket_match_status ON cricket_matches(match_status);
CREATE INDEX IF NOT EXISTS idx_cricket_match_start_time ON cricket_matches(match_start_time);

-- Cricket Innings Indexes
CREATE INDEX IF NOT EXISTS idx_cricket_innings_match ON cricket_innings(cricket_match_id);
CREATE INDEX IF NOT EXISTS idx_cricket_innings_team ON cricket_innings(batting_team_id);
CREATE INDEX IF NOT EXISTS idx_cricket_innings_number ON cricket_innings(innings_number);

-- Cricket Player Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cricket_perf_innings ON cricket_player_performance(innings_id);
CREATE INDEX IF NOT EXISTS idx_cricket_perf_player ON cricket_player_performance(player_id);

-- Cricket Balls Indexes  
CREATE INDEX IF NOT EXISTS idx_cricket_balls_innings ON cricket_balls(innings_id);
CREATE INDEX IF NOT EXISTS idx_cricket_balls_over_ball ON cricket_balls(over_number, ball_number);
CREATE INDEX IF NOT EXISTS idx_cricket_balls_bowler ON cricket_balls(bowler_id);

-- Payment Records Indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_game ON payment_records(game_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_country ON payment_records(country);
CREATE INDEX IF NOT EXISTS idx_payment_records_gateway ON payment_records(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_records_created ON payment_records(created_at);

-- Exchange Rates Indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_timestamp ON exchange_rates(timestamp);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active ON exchange_rates(is_active);

-- Country Regions Indexes
CREATE INDEX IF NOT EXISTS idx_country_regions_country ON country_regions(country_code);
CREATE INDEX IF NOT EXISTS idx_country_regions_bounds ON country_regions(min_lat, max_lat, min_lon, max_lon);

-- User Location Preferences Indexes  
CREATE INDEX IF NOT EXISTS idx_user_location_prefs_user ON user_location_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_prefs_country ON user_location_preferences(primary_country);

-- =============================================
-- Enhanced Game Table Updates
-- =============================================

-- Add columns to existing game table for enhanced features
ALTER TABLE game ADD COLUMN IF NOT EXISTS game_template_id BIGINT REFERENCES game_templates(id);
ALTER TABLE game ADD COLUMN IF NOT EXISTS team_formation_strategy VARCHAR(20) DEFAULT 'SKILL_BALANCED';
ALTER TABLE game ADD COLUMN IF NOT EXISTS auto_start_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE game ADD COLUMN IF NOT EXISTS skill_balancing_enabled BOOLEAN DEFAULT TRUE;

-- Enhanced game participants table
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS team_id BIGINT REFERENCES teams(id);
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS preferred_position VARCHAR(20);
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS is_substitute BOOLEAN DEFAULT FALSE;
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS participation_status VARCHAR(20) DEFAULT 'REGISTERED';
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS amount_owed DECIMAL(10,2);
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

-- Add indexes for new game participant columns
CREATE INDEX IF NOT EXISTS idx_game_participants_team ON game_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_status ON game_participants(participation_status);
CREATE INDEX IF NOT EXISTS idx_game_participants_payment ON game_participants(payment_status);

-- =============================================
-- Enhanced User Table Updates  
-- =============================================

-- Add international and cricket-specific user fields
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS region_code VARCHAR(10);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS primary_sport VARCHAR(50);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS preferred_positions JSONB; -- JSON array of positions
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS skill_assessment JSONB; -- JSON with skills per sport
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS games_completed INTEGER DEFAULT 0;
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS payment_method_id VARCHAR(255);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';

-- Add indexes for new user columns
CREATE INDEX IF NOT EXISTS idx_app_user_country ON app_user(country_code);
CREATE INDEX IF NOT EXISTS idx_app_user_region ON app_user(region_code);
CREATE INDEX IF NOT EXISTS idx_app_user_sport ON app_user(primary_sport);

-- =============================================
-- Initial Data Seeding
-- =============================================

-- Insert cricket game templates
INSERT INTO game_templates (name, sport, format, players_per_team, total_teams, min_players, max_players, substitute_slots, duration_minutes, default_rules, required_equipment, skill_balancing_required, captain_assignment_required) VALUES
('T20 Cricket', 'Cricket', 'T20', 11, 2, 16, 22, 0, 180, 'Standard T20 rules - 20 overs per side, powerplay overs, strategic timeout', 'Cricket bat, ball, stumps, pads, gloves, helmet', TRUE, TRUE),
('T10 Cricket', 'Cricket', 'T10', 11, 2, 16, 22, 0, 90, 'T10 format - 10 overs per side, fast-paced cricket', 'Cricket bat, ball, stumps, basic protective gear', TRUE, TRUE),
('Street Cricket', 'Cricket', 'Street', 6, 2, 8, 16, 4, 60, 'Street cricket - tennis ball, flexible rules, all players bat and bowl', 'Tennis ball, bat, makeshift stumps or wall', FALSE, FALSE),
('ODI Cricket', 'Cricket', 'ODI', 11, 2, 18, 22, 0, 480, '50-over cricket, field restrictions, powerplay overs', 'Cricket bat, ball, stumps, full protective gear', TRUE, TRUE);

-- Insert country regions
INSERT INTO country_regions (country_code, region_code, region_name, min_lat, max_lat, min_lon, max_lon, timezone, major_cities) VALUES
-- United States
('US', 'CA', 'California', 32.534, 42.009, -124.482, -114.131, 'America/Los_Angeles', '["Los Angeles", "San Francisco", "San Diego", "Sacramento"]'),
('US', 'NY', 'New York', 40.477, 45.015, -79.763, -71.752, 'America/New_York', '["New York City", "Buffalo", "Rochester", "Syracuse"]'),
('US', 'TX', 'Texas', 25.837, 36.501, -106.646, -93.508, 'America/Chicago', '["Houston", "Dallas", "Austin", "San Antonio"]'),
('US', 'FL', 'Florida', 24.396, 31.001, -87.635, -79.975, 'America/New_York', '["Miami", "Tampa", "Orlando", "Jacksonville"]'),

-- Canada
('CA', 'ON', 'Ontario', 41.681, 56.931, -95.156, -74.321, 'America/Toronto', '["Toronto", "Ottawa", "Hamilton", "London"]'),
('CA', 'BC', 'British Columbia', 48.225, 60.000, -139.040, -114.033, 'America/Vancouver', '["Vancouver", "Victoria", "Surrey", "Burnaby"]'),
('CA', 'QC', 'Quebec', 44.991, 62.583, -79.763, -57.103, 'America/Montreal', '["Montreal", "Quebec City", "Laval", "Gatineau"]'),

-- Mexico  
('MX', 'CDMX', 'Mexico City', 19.048, 19.593, -99.365, -98.941, 'America/Mexico_City', '["Mexico City", "Ecatepec", "Guadalajara"]'),
('MX', 'JAL', 'Jalisco', 18.926, 22.750, -105.470, -101.508, 'America/Mexico_City', '["Guadalajara", "Zapopan", "Tlaquepaque"]'),

-- India
('IN', 'MH', 'Maharashtra', 15.602, 22.027, 72.659, 80.891, 'Asia/Kolkata', '["Mumbai", "Pune", "Nagpur", "Nashik"]'),
('IN', 'KA', 'Karnataka', 11.595, 18.457, 74.043, 78.569, 'Asia/Kolkata', '["Bangalore", "Mysore", "Mangalore", "Hubli"]'),
('IN', 'DL', 'Delhi', 28.409, 28.883, 76.839, 77.347, 'Asia/Kolkata', '["New Delhi", "Delhi", "Gurgaon", "Noida"]'),
('IN', 'TN', 'Tamil Nadu', 8.068, 13.493, 76.760, 80.348, 'Asia/Kolkata', '["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"]'),

-- Nepal
('NP', 'CENTRAL', 'Central Development Region', 27.300, 28.300, 84.000, 86.500, 'Asia/Kathmandu', '["Kathmandu", "Lalitpur", "Bhaktapur", "Hetauda"]'),
('NP', 'WESTERN', 'Western Development Region', 28.000, 30.000, 80.000, 84.000, 'Asia/Kathmandu', '["Pokhara", "Butwal", "Nepalgunj", "Dhangadhi"]');

-- Insert current exchange rates (sample data - should be updated via external API)
INSERT INTO exchange_rates (from_currency, to_currency, rate, provider) VALUES
('USD', 'CAD', 1.35, 'xe.com'),
('USD', 'MXN', 17.50, 'xe.com'),
('USD', 'INR', 83.25, 'xe.com'),
('USD', 'NPR', 133.20, 'xe.com'),
('CAD', 'USD', 0.74, 'xe.com'),
('MXN', 'USD', 0.057, 'xe.com'),
('INR', 'USD', 0.012, 'xe.com'),
('NPR', 'USD', 0.0075, 'xe.com'),
('INR', 'NPR', 1.60, 'xe.com'),
('NPR', 'INR', 0.625, 'xe.com')
ON CONFLICT (from_currency, to_currency, provider) DO UPDATE SET
rate = EXCLUDED.rate,
timestamp = NOW();

-- =============================================
-- Sample Cricket Data
-- =============================================

-- Insert sample cricket games (if venues exist)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, status, game_type, description, min_players, max_players, capacity, price_per_player, total_cost, duration_minutes, rules, equipment_required, created_at, updated_at)
SELECT 
    'Cricket', 
    'Cricket Ground Central Park', 
    (CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '14 hours')::timestamptz,
    'Intermediate',
    40.7829, 
    -73.9654,
    u.id,
    'PUBLISHED',
    'PICKUP',
    'T20 cricket match at Central Park. All skill levels welcome! Proper pitch and equipment provided.',
    16,
    22,
    22,
    25.00,
    550.00,
    180,
    'T20 cricket rules, 20 overs per side, powerplay restrictions apply',
    'Cricket whites or colored clothing, own bat preferred, all other equipment provided'
FROM (SELECT id FROM app_user LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM app_user);

INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, status, game_type, description, min_players, max_players, capacity, price_per_player, total_cost, duration_minutes, rules, equipment_required, created_at, updated_at)
SELECT 
    'Cricket', 
    'Local Cricket Club', 
    (CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '10 hours')::timestamptz,
    'Advanced',
    28.6139, 
    77.2090,
    u.id,
    'PUBLISHED', 
    'COMPETITIVE',
    'Competitive ODI-style cricket match. Advanced players only. Professional setup with scorer and umpire.',
    18,
    22,
    22,
    15.00,
    330.00,
    300,
    'ODI format cricket, 30 overs per side due to time constraints, competitive play',
    'Cricket whites, own bat and gloves, all protective gear provided'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 1 LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM app_user);

-- =============================================
-- Functions and Triggers
-- =============================================

-- Function to update exchange rates timestamp
CREATE OR REPLACE FUNCTION update_exchange_rate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.timestamp = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for exchange rates
DROP TRIGGER IF EXISTS trigger_exchange_rates_timestamp ON exchange_rates;
CREATE TRIGGER trigger_exchange_rates_timestamp
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_exchange_rate_timestamp();

-- Function to calculate team average skill level
CREATE OR REPLACE FUNCTION calculate_team_average_skill()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE teams SET 
        average_skill_level = (
            SELECT AVG(CASE 
                WHEN u.skill_level = 'Pro' THEN 4.0
                WHEN u.skill_level = 'Advanced' THEN 3.0  
                WHEN u.skill_level = 'Intermediate' THEN 2.0
                WHEN u.skill_level = 'Beginner' THEN 1.0
                ELSE 1.0
            END)
            FROM team_members tm
            JOIN app_user u ON tm.user_id = u.id
            WHERE tm.team_id = NEW.team_id
        )
    WHERE id = NEW.team_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for team member changes
DROP TRIGGER IF EXISTS trigger_update_team_skill_average ON team_members;
CREATE TRIGGER trigger_update_team_skill_average
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION calculate_team_average_skill();

-- Function to update cricket innings totals
CREATE OR REPLACE FUNCTION update_innings_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cricket_innings SET
        total_runs = COALESCE((
            SELECT SUM(runs_off_ball) 
            FROM cricket_balls 
            WHERE innings_id = NEW.innings_id
        ), 0),
        total_wickets = COALESCE((
            SELECT COUNT(*) 
            FROM cricket_balls 
            WHERE innings_id = NEW.innings_id AND is_wicket = TRUE
        ), 0),
        total_extras = COALESCE((
            SELECT SUM(runs_off_ball) 
            FROM cricket_balls 
            WHERE innings_id = NEW.innings_id AND is_extra = TRUE
        ), 0),
        updated_at = NOW()
    WHERE id = NEW.innings_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cricket ball updates
DROP TRIGGER IF EXISTS trigger_update_innings_totals ON cricket_balls;
CREATE TRIGGER trigger_update_innings_totals
    AFTER INSERT OR UPDATE ON cricket_balls
    FOR EACH ROW
    EXECUTE FUNCTION update_innings_totals();

-- =============================================
-- Views for Common Queries
-- =============================================

-- View for cricket match summaries
CREATE OR REPLACE VIEW cricket_match_summary AS
SELECT 
    cm.id as match_id,
    g.id as game_id,
    g.sport,
    g.location,
    cm.match_format,
    cm.match_status,
    t1.team_name as team1_name,
    t2.team_name as team2_name,
    cm.match_start_time,
    cm.match_end_time,
    cm.match_result,
    winner.team_name as winning_team,
    mom.username as man_of_match,
    -- Current innings summary
    ci.total_runs as current_runs,
    ci.total_wickets as current_wickets,
    ci.overs_completed || '.' || ci.balls_in_current_over as current_overs
FROM cricket_matches cm
JOIN game g ON cm.game_id = g.id
LEFT JOIN teams t1 ON cm.batting_team_id = t1.id
LEFT JOIN teams t2 ON cm.bowling_team_id = t2.id  
LEFT JOIN teams winner ON cm.winning_team_id = winner.id
LEFT JOIN app_user mom ON cm.man_of_match_id = mom.id
LEFT JOIN cricket_innings ci ON cm.id = ci.cricket_match_id AND ci.innings_status = 'IN_PROGRESS';

-- View for payment analytics by country
CREATE OR REPLACE VIEW payment_country_analytics AS
SELECT 
    country,
    COUNT(*) as total_transactions,
    SUM(amount) as total_revenue,
    AVG(amount) as average_transaction,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::DECIMAL / COUNT(*) * 100 as success_rate,
    gateway,
    currency
FROM payment_records
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY country, gateway, currency
ORDER BY total_revenue DESC;

-- =============================================
-- Constraints and Validations
-- =============================================

-- Ensure team formation makes sense
ALTER TABLE teams ADD CONSTRAINT chk_team_number_per_game 
    CHECK (team_number >= 1);

-- Ensure cricket match has valid format
ALTER TABLE cricket_matches ADD CONSTRAINT chk_cricket_format 
    CHECK (match_format IN ('T20', 'T10', 'ODI', 'TEST', 'HUNDRED', 'STREET'));

-- Ensure innings number is valid
ALTER TABLE cricket_innings ADD CONSTRAINT chk_innings_number 
    CHECK (innings_number >= 1 AND innings_number <= 4);

-- Ensure payment amounts are positive
ALTER TABLE payment_records ADD CONSTRAINT chk_payment_amount 
    CHECK (amount > 0);

-- Ensure supported currencies
ALTER TABLE payment_records ADD CONSTRAINT chk_payment_currency 
    CHECK (currency IN ('USD', 'CAD', 'MXN', 'INR', 'NPR'));

-- Ensure supported countries
ALTER TABLE payment_records ADD CONSTRAINT chk_payment_country 
    CHECK (country IN ('US', 'CA', 'MX', 'IN', 'NP'));

COMMIT;