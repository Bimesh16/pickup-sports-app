-- Migration: V1049__enhance_sports_table.sql
-- Description: Enhance existing public.sport table with comprehensive features to match application entity

SET search_path TO public;

-- Add missing columns to sport (idempotent)
ALTER TABLE sport
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS category VARCHAR(50),
    ADD COLUMN IF NOT EXISTS team_size_min INTEGER,
    ADD COLUMN IF NOT EXISTS team_size_max INTEGER,
    ADD COLUMN IF NOT EXISTS total_players_min INTEGER,
    ADD COLUMN IF NOT EXISTS total_players_max INTEGER,
    ADD COLUMN IF NOT EXISTS duration_minutes_min INTEGER,
    ADD COLUMN IF NOT EXISTS duration_minutes_max INTEGER,
    ADD COLUMN IF NOT EXISTS skill_levels TEXT,
    ADD COLUMN IF NOT EXISTS equipment_required TEXT,
    ADD COLUMN IF NOT EXISTS equipment_provided TEXT,
    ADD COLUMN IF NOT EXISTS venue_types TEXT,
    ADD COLUMN IF NOT EXISTS rules TEXT,
    ADD COLUMN IF NOT EXISTS popularity_score DECIMAL(3,2),
    ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20),
    ADD COLUMN IF NOT EXISTS is_team_sport BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_indoor BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_outdoor BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_weather_dependent BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure created_at exists (already present in earlier migrations, but guard anyway)
ALTER TABLE sport
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_sport_category ON sport(category);
CREATE INDEX IF NOT EXISTS idx_sport_difficulty_level ON sport(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_sport_is_team_sport ON sport(is_team_sport);
CREATE INDEX IF NOT EXISTS idx_sport_is_indoor ON sport(is_indoor);
CREATE INDEX IF NOT EXISTS idx_sport_is_outdoor ON sport(is_outdoor);
CREATE INDEX IF NOT EXISTS idx_sport_is_weather_dependent ON sport(is_weather_dependent);
CREATE INDEX IF NOT EXISTS idx_sport_popularity_score ON sport(popularity_score);
CREATE INDEX IF NOT EXISTS idx_sport_is_active ON sport(is_active);
CREATE INDEX IF NOT EXISTS idx_sport_team_size_min ON sport(team_size_min);
CREATE INDEX IF NOT EXISTS idx_sport_team_size_max ON sport(team_size_max);
CREATE INDEX IF NOT EXISTS idx_sport_total_players_min ON sport(total_players_min);
CREATE INDEX IF NOT EXISTS idx_sport_total_players_max ON sport(total_players_max);
CREATE INDEX IF NOT EXISTS idx_sport_duration_minutes_min ON sport(duration_minutes_min);
CREATE INDEX IF NOT EXISTS idx_sport_duration_minutes_max ON sport(duration_minutes_max);

-- Composite indexes commonly used
CREATE INDEX IF NOT EXISTS idx_sport_category_active ON sport(category, is_active);
CREATE INDEX IF NOT EXISTS idx_sport_difficulty_active ON sport(difficulty_level, is_active);
CREATE INDEX IF NOT EXISTS idx_sport_team_active ON sport(is_team_sport, is_active);
CREATE INDEX IF NOT EXISTS idx_sport_indoor_active ON sport(is_indoor, is_active);
CREATE INDEX IF NOT EXISTS idx_sport_outdoor_active ON sport(is_outdoor, is_active);
CREATE INDEX IF NOT EXISTS idx_sport_weather_active ON sport(is_weather_dependent, is_active);
CREATE INDEX IF NOT EXISTS idx_sport_popularity_active ON sport(popularity_score, is_active);

-- Full-text search index for name + description (requires extension but safe to attempt)
DO $$
BEGIN
    BEGIN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sport_search ON sport USING gin(to_tsvector(''english'', name || '' '' || COALESCE(description, '''')))';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipping full-text index on sport: %', SQLERRM;
    END;
END $$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_sport_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sport_updated_at ON sport;
CREATE TRIGGER trigger_update_sport_updated_at
    BEFORE UPDATE ON sport
    FOR EACH ROW
    EXECUTE FUNCTION update_sport_updated_at();

-- Seed or upsert data for 10 popular sports (keeps existing IDs via name uniqueness)
INSERT INTO sport (
    name, display_name, description, category,
    team_size_min, team_size_max, total_players_min, total_players_max,
    duration_minutes_min, duration_minutes_max,
    skill_levels, equipment_required, equipment_provided, venue_types, rules,
    popularity_score, difficulty_level, is_team_sport, is_indoor, is_outdoor, is_weather_dependent,
    icon_url, banner_url, is_active, created_at, updated_at
)
VALUES
('soccer', 'Soccer/Football',
 'The world''s most popular sport, played with 11 players per team on a rectangular field.',
 'BALL_SPORTS', 11, 11, 22, 22, 90, 120,
 '["BEGINNER","INTERMEDIATE","ADVANCED","PRO"]',
 '["Cleats","Shin Guards","Soccer Ball"]',
 '["Goals","Corner Flags","Referee Equipment"]',
 '["OUTDOOR_FIELD","INDOOR_FIELD"]',
 'Standard FIFA rules apply. No hands except for goalkeepers.',
 9.8, 'INTERMEDIATE', TRUE, FALSE, TRUE, TRUE,
 '/images/sports/soccer-icon.png','/images/sports/soccer-banner.jpg', TRUE, NOW(), NOW()),

('cricket','Cricket',
 'Bat-and-ball game between two teams of 11 players.',
 'TRADITIONAL', 11, 11, 22, 22, 180, 480,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Cricket Bat","Cricket Ball","Protective Gear"]',
 '["Wickets","Boundary Ropes","Scoreboard"]',
 '["OUTDOOR_FIELD","INDOOR_FIELD"]',
 'Teams bat in innings; multiple formats (Test, ODI, T20).',
 9.5,'ADVANCED', TRUE, FALSE, TRUE, TRUE,
 '/images/sports/cricket-icon.png','/images/sports/cricket-banner.jpg', TRUE, NOW(), NOW()),

('volleyball','Volleyball',
 'Two teams of six players separated by a net.',
 'BALL_SPORTS', 6, 6, 12, 12, 60, 90,
 '["BEGINNER","INTERMEDIATE","ADVANCED","PRO"]',
 '["Volleyball","Knee Pads","Athletic Shoes"]',
 '["Net","Antennas","Scoreboard"]',
 '["INDOOR_COURT","OUTDOOR_COURT","BEACH"]',
 'Max 3 touches per side; rally scoring.',
 8.2,'INTERMEDIATE', TRUE, TRUE, TRUE, FALSE,
 '/images/sports/volleyball-icon.png','/images/sports/volleyball-banner.jpg', TRUE, NOW(), NOW()),

('badminton','Badminton',
 'Racquet sport using a shuttlecock across a net.',
 'RACKET_SPORTS', 1, 2, 2, 4, 30, 90,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Badminton Racket","Shuttlecocks","Court Shoes"]',
 '["Net","Court Lines","Scoreboard"]',
 '["INDOOR_COURT","OUTDOOR_COURT"]',
 'Best of 3 to 21 points, rally scoring.',
 8.8,'INTERMEDIATE', FALSE, TRUE, TRUE, TRUE,
 '/images/sports/badminton-icon.png','/images/sports/badminton-banner.jpg', TRUE, NOW(), NOW()),

('chess','Chess',
 'Strategic board game on an 8×8 grid.',
 'MIND_SPORTS', 1, 1, 2, 2, 15, 300,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Chess Set","Chess Clock"]',
 '["Chess Board","Tables","Chairs"]',
 '["INDOOR_COURT","MULTI_PURPOSE"]',
 'Objective is to checkmate the opponent''s king.',
 7.5,'EXPERT', FALSE, TRUE, FALSE, FALSE,
 '/images/sports/chess-icon.png','/images/sports/chess-banner.jpg', TRUE, NOW(), NOW()),

('basketball','Basketball',
 'Two teams of five score by throwing a ball through a hoop.',
 'BALL_SPORTS', 5, 5, 10, 10, 48, 60,
 '["BEGINNER","INTERMEDIATE","ADVANCED","PRO"]',
 '["Basketball","Basketball Shoes","Athletic Wear"]',
 '["Baskets","Backboards","Scoreboard"]',
 '["INDOOR_COURT","OUTDOOR_COURT"]',
 'Dribbling, shooting, fouls lead to free throws.',
 9.0,'INTERMEDIATE', TRUE, TRUE, TRUE, FALSE,
 '/images/sports/basketball-icon.png','/images/sports/basketball-banner.jpg', TRUE, NOW(), NOW()),

('table_tennis','Table Tennis',
 'Players hit a lightweight ball across a table.',
 'RACKET_SPORTS', 1, 2, 2, 4, 20, 60,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Table Tennis Racket","Balls"]',
 '["Table","Net","Scoreboard"]',
 '["INDOOR_COURT","MULTI_PURPOSE"]',
 'Best of 5/7 games to 11; alternate serves.',
 8.5,'INTERMEDIATE', FALSE, TRUE, FALSE, FALSE,
 '/images/sports/table-tennis-icon.png','/images/sports/table-tennis-banner.jpg', TRUE, NOW(), NOW()),

('tennis','Tennis',
 'Singles or doubles hitting a ball over a net.',
 'RACKET_SPORTS', 1, 2, 2, 4, 60, 180,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Tennis Racket","Tennis Balls","Tennis Shoes"]',
 '["Net","Court Lines","Scoreboard"]',
 '["INDOOR_COURT","OUTDOOR_COURT"]',
 'Games/sets/matches scoring; serve diagonally.',
 8.7,'ADVANCED', FALSE, TRUE, TRUE, TRUE,
 '/images/sports/tennis-icon.png','/images/sports/tennis-banner.jpg', TRUE, NOW(), NOW()),

('swimming','Swimming',
 'Sport involving moving through water using arms and legs.',
 'WATER_SPORTS', 1, 1, 1, 50, 30, 120,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Swimsuit","Goggles","Swim Cap"]',
 '["Lanes","Starting Blocks","Timing System"]',
 '["POOL","INDOOR_POOL","OUTDOOR_POOL"]',
 'Various strokes and distances; lane discipline.',
 7.8,'INTERMEDIATE', FALSE, TRUE, TRUE, FALSE,
 '/images/sports/swimming-icon.png','/images/sports/swimming-banner.jpg', TRUE, NOW(), NOW()),

('athletics','Athletics/Track & Field',
 'Running, jumping, throwing, and walking events.',
 'TRACK_SPORTS', 1, 4, 1, 100, 10, 180,
 '["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]',
 '["Running Shoes","Athletic Wear","Spikes"]',
 '["Track","Jumping Pits","Throwing Circles","Timing System"]',
 '["TRACK","INDOOR_TRACK","OUTDOOR_TRACK"]',
 'Event-specific rules; relay baton exchange zones.',
 7.2,'ADVANCED', FALSE, TRUE, TRUE, TRUE,
 '/images/sports/athletics-icon.png','/images/sports/athletics-banner.jpg', TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    team_size_min = EXCLUDED.team_size_min,
    team_size_max = EXCLUDED.team_size_max,
    total_players_min = EXCLUDED.total_players_min,
    total_players_max = EXCLUDED.total_players_max,
    duration_minutes_min = EXCLUDED.duration_minutes_min,
    duration_minutes_max = EXCLUDED.duration_minutes_max,
    skill_levels = EXCLUDED.skill_levels,
    equipment_required = EXCLUDED.equipment_required,
    equipment_provided = EXCLUDED.equipment_provided,
    venue_types = EXCLUDED.venue_types,
    rules = EXCLUDED.rules,
    popularity_score = EXCLUDED.popularity_score,
    difficulty_level = EXCLUDED.difficulty_level,
    is_team_sport = EXCLUDED.is_team_sport,
    is_indoor = EXCLUDED.is_indoor,
    is_outdoor = EXCLUDED.is_outdoor,
    is_weather_dependent = EXCLUDED.is_weather_dependent,
    icon_url = EXCLUDED.icon_url,
    banner_url = EXCLUDED.banner_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Comments
COMMENT ON TABLE sport IS 'Comprehensive sports catalog (singular) used by application entities';
COMMENT ON COLUMN sport.name IS 'Unique identifier for the sport (lowercase, no spaces)';
COMMENT ON COLUMN sport.display_name IS 'Human-readable name for the sport';
COMMENT ON COLUMN sport.category IS 'Sport category (BALL_SPORTS, RACKET_SPORTS, MIND_SPORTS, etc.)';
COMMENT ON COLUMN sport.team_size_min IS 'Minimum players per team';
COMMENT ON COLUMN sport.team_size_max IS 'Maximum players per team';
COMMENT ON COLUMN sport.total_players_min IS 'Minimum total players';
COMMENT ON COLUMN sport.total_players_max IS 'Maximum total players';
COMMENT ON COLUMN sport.duration_minutes_min IS 'Minimum duration in minutes';
COMMENT ON COLUMN sport.duration_minutes_max IS 'Maximum duration in minutes';
COMMENT ON COLUMN sport.skill_levels IS 'JSON array of supported skill levels';
COMMENT ON COLUMN sport.equipment_required IS 'JSON array of equipment players must bring';
COMMENT ON COLUMN sport.equipment_provided IS 'JSON array of equipment provided';
COMMENT ON COLUMN sport.venue_types IS 'JSON array of supported venue types';
COMMENT ON COLUMN sport.rules IS 'Brief description of key rules';
COMMENT ON COLUMN sport.popularity_score IS 'Popularity score from 0.00 to 10.00';
COMMENT ON COLUMN sport.difficulty_level IS 'Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)';
COMMENT ON COLUMN sport.is_team_sport IS 'Whether this is a team sport';
COMMENT ON COLUMN sport.is_indoor IS 'Whether this sport can be played indoors';
COMMENT ON COLUMN sport.is_outdoor IS 'Whether this sport can be played outdoors';
COMMENT ON COLUMN sport.is_weather_dependent IS 'Whether this sport depends on weather conditions';
COMMENT ON COLUMN sport.icon_url IS 'URL to sport icon image';
COMMENT ON COLUMN sport.banner_url IS 'URL to sport banner image';
