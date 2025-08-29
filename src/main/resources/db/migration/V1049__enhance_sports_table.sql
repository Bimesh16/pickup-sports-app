-- Migration: V1049__enhance_sports_table.sql
-- Description: Enhance sports table with comprehensive sport features and characteristics

-- Drop existing sports table if it exists (for clean migration)
DROP TABLE IF EXISTS sports CASCADE;

-- Create enhanced sports table
CREATE TABLE sports (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    team_size_min INTEGER NOT NULL,
    team_size_max INTEGER NOT NULL,
    total_players_min INTEGER NOT NULL,
    total_players_max INTEGER NOT NULL,
    duration_minutes_min INTEGER NOT NULL,
    duration_minutes_max INTEGER NOT NULL,
    skill_levels TEXT, -- JSON array of skill levels
    equipment_required TEXT, -- JSON array of equipment
    equipment_provided TEXT, -- JSON array of equipment
    venue_types TEXT, -- JSON array of venue types
    rules TEXT,
    popularity_score DECIMAL(3,2) CHECK (popularity_score >= 0.00 AND popularity_score <= 10.00),
    difficulty_level VARCHAR(20) NOT NULL,
    is_team_sport BOOLEAN NOT NULL DEFAULT false,
    is_indoor BOOLEAN NOT NULL DEFAULT false,
    is_outdoor BOOLEAN NOT NULL DEFAULT false,
    is_weather_dependent BOOLEAN NOT NULL DEFAULT false,
    icon_url VARCHAR(500),
    banner_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sports_category ON sports(category);
CREATE INDEX idx_sports_difficulty_level ON sports(difficulty_level);
CREATE INDEX idx_sports_is_team_sport ON sports(is_team_sport);
CREATE INDEX idx_sports_is_indoor ON sports(is_indoor);
CREATE INDEX idx_sports_is_outdoor ON sports(is_outdoor);
CREATE INDEX idx_sports_is_weather_dependent ON sports(is_weather_dependent);
CREATE INDEX idx_sports_popularity_score ON sports(popularity_score);
CREATE INDEX idx_sports_is_active ON sports(is_active);
CREATE INDEX idx_sports_team_size_min ON sports(team_size_min);
CREATE INDEX idx_sports_team_size_max ON sports(team_size_max);
CREATE INDEX idx_sports_total_players_min ON sports(total_players_min);
CREATE INDEX idx_sports_total_players_max ON sports(total_players_max);
CREATE INDEX idx_sports_duration_minutes_min ON sports(duration_minutes_min);
CREATE INDEX idx_sports_duration_minutes_max ON sports(duration_minutes_max);

-- Create composite indexes for common queries
CREATE INDEX idx_sports_category_active ON sports(category, is_active);
CREATE INDEX idx_sports_difficulty_active ON sports(difficulty_level, is_active);
CREATE INDEX idx_sports_team_active ON sports(is_team_sport, is_active);
CREATE INDEX idx_sports_indoor_active ON sports(is_indoor, is_active);
CREATE INDEX idx_sports_outdoor_active ON sports(is_outdoor, is_active);
CREATE INDEX idx_sports_weather_active ON sports(is_weather_dependent, is_active);
CREATE INDEX idx_sports_popularity_active ON sports(popularity_score, is_active);

-- Create full-text search index for name and description
CREATE INDEX idx_sports_search ON sports USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Add comments for documentation
COMMENT ON TABLE sports IS 'Comprehensive sports information with detailed characteristics and features';
COMMENT ON COLUMN sports.name IS 'Unique identifier for the sport (lowercase, no spaces)';
COMMENT ON COLUMN sports.display_name IS 'Human-readable name for the sport';
COMMENT ON COLUMN sports.category IS 'Sport category (BALL_SPORTS, RACKET_SPORTS, MIND_SPORTS, etc.)';
COMMENT ON COLUMN sports.team_size_min IS 'Minimum players required per team';
COMMENT ON COLUMN sports.team_size_max IS 'Maximum players allowed per team';
COMMENT ON COLUMN sports.total_players_min IS 'Minimum total players required for the sport';
COMMENT ON COLUMN sports.total_players_max IS 'Maximum total players allowed for the sport';
COMMENT ON COLUMN sports.duration_minutes_min IS 'Minimum duration in minutes';
COMMENT ON COLUMN sports.duration_minutes_max IS 'Maximum duration in minutes';
COMMENT ON COLUMN sports.skill_levels IS 'JSON array of supported skill levels';
COMMENT ON COLUMN sports.equipment_required IS 'JSON array of equipment players must bring';
COMMENT ON COLUMN sports.equipment_provided IS 'JSON array of equipment provided by venue/organizer';
COMMENT ON COLUMN sports.venue_types IS 'JSON array of supported venue types';
COMMENT ON COLUMN sports.rules IS 'Brief description of key rules';
COMMENT ON COLUMN sports.popularity_score IS 'Popularity score from 0.00 to 10.00';
COMMENT ON COLUMN sports.difficulty_level IS 'Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)';
COMMENT ON COLUMN sports.is_team_sport IS 'Whether this is a team sport';
COMMENT ON COLUMN sports.is_indoor IS 'Whether this sport can be played indoors';
COMMENT ON COLUMN sports.is_outdoor IS 'Whether this sport can be played outdoors';
COMMENT ON COLUMN sports.is_weather_dependent IS 'Whether this sport depends on weather conditions';
COMMENT ON COLUMN sports.icon_url IS 'URL to sport icon image';
COMMENT ON COLUMN sports.banner_url IS 'URL to sport banner image';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sports_updated_at
    BEFORE UPDATE ON sports
    FOR EACH ROW
    EXECUTE FUNCTION update_sports_updated_at();

-- Insert initial data for the 10 popular sports
INSERT INTO sports (
    name, display_name, description, category, team_size_min, team_size_max, 
    total_players_min, total_players_max, duration_minutes_min, duration_minutes_max,
    skill_levels, equipment_required, equipment_provided, venue_types, rules,
    popularity_score, difficulty_level, is_team_sport, is_indoor, is_outdoor, 
    is_weather_dependent, icon_url, banner_url, is_active, created_at, updated_at
) VALUES 
-- Soccer/Football
('soccer', 'Soccer/Football', 'The world''s most popular sport, played with 11 players per team on a rectangular field. The objective is to score goals by getting the ball into the opponent''s net using any part of the body except hands and arms.', 
 'BALL_SPORTS', 11, 11, 22, 22, 90, 120,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"]', '["Cleats", "Shin Guards", "Soccer Ball"]', '["Goals", "Corner Flags", "Referee Equipment"]', '["OUTDOOR_FIELD", "INDOOR_FIELD"]',
 'Standard FIFA rules apply. No hands except for goalkeepers. Offside rule enforced. Fouls result in free kicks or penalties.',
 9.8, 'INTERMEDIATE', true, false, true, true, '/images/sports/soccer-icon.png', '/images/sports/soccer-banner.jpg', true, NOW(), NOW()),

-- Cricket
('cricket', 'Cricket', 'A bat-and-ball game played between two teams of 11 players. The game is played on a circular field with a rectangular pitch in the center. Teams take turns batting and bowling.',
 'TRADITIONAL', 11, 11, 22, 22, 180, 480,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Cricket Bat", "Cricket Ball", "Protective Gear"]', '["Wickets", "Boundary Ropes", "Scoreboard"]', '["OUTDOOR_FIELD", "INDOOR_FIELD"]',
 'Teams bat in innings. Bowlers try to dismiss batsmen. Batsmen score runs by hitting the ball and running between wickets. Various formats: Test, ODI, T20.',
 9.5, 'ADVANCED', true, false, true, true, '/images/sports/cricket-icon.png', '/images/sports/cricket-banner.jpg', true, NOW(), NOW()),

-- Volleyball
('volleyball', 'Volleyball', 'A team sport in which two teams of six players are separated by a net. Each team tries to score points by grounding a ball on the other team''s court under organized rules.',
 'BALL_SPORTS', 6, 6, 12, 12, 60, 90,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"]', '["Volleyball", "Knee Pads", "Athletic Shoes"]', '["Net", "Antennas", "Scoreboard"]', '["INDOOR_COURT", "OUTDOOR_COURT", "BEACH"]',
 'Teams serve, pass, set, and spike the ball over the net. Maximum 3 touches per side. Ball must not touch the ground. Rally scoring system.',
 8.2, 'INTERMEDIATE', true, true, true, false, '/images/sports/volleyball-icon.png', '/images/sports/volleyball-banner.jpg', true, NOW(), NOW()),

-- Badminton
('badminton', 'Badminton', 'A racquet sport played using racquets to hit a shuttlecock across a net. It can be played as singles or doubles. The game is known for its fast-paced action and strategic play.',
 'RACKET_SPORTS', 1, 2, 2, 4, 30, 90,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Badminton Racket", "Shuttlecocks", "Court Shoes"]', '["Net", "Court Lines", "Scoreboard"]', '["INDOOR_COURT", "OUTDOOR_COURT"]',
 'Serve diagonally. Shuttlecock must not touch the ground. Points scored when opponent fails to return. Best of 3 games to 21 points.',
 8.8, 'INTERMEDIATE', false, true, true, true, '/images/sports/badminton-icon.png', '/images/sports/badminton-banner.jpg', true, NOW(), NOW()),

-- Chess
('chess', 'Chess', 'A strategic board game played between two players on a checkered board with 64 squares arranged in an 8×8 grid. Each player begins with 16 pieces: one king, one queen, two rooks, two bishops, two knights, and eight pawns.',
 'MIND_SPORTS', 1, 1, 2, 2, 15, 300,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Chess Set", "Chess Clock"]', '["Chess Board", "Tables", "Chairs"]', '["INDOOR_COURT", "MULTI_PURPOSE"]',
 'Players take turns moving pieces. Objective is to checkmate the opponent''s king. Each piece has specific movement patterns. Various time controls available.',
 7.5, 'EXPERT', false, true, false, false, '/images/sports/chess-icon.png', '/images/sports/chess-banner.jpg', true, NOW(), NOW()),

-- Basketball
('basketball', 'Basketball', 'A team sport in which two teams of five players score points by throwing a ball through a hoop elevated 10 feet above the ground. The game is played on a rectangular court.',
 'BALL_SPORTS', 5, 5, 10, 10, 48, 60,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"]', '["Basketball", "Basketball Shoes", "Athletic Wear"]', '["Baskets", "Backboards", "Scoreboard"]', '["INDOOR_COURT", "OUTDOOR_COURT"]',
 'Dribble the ball while moving. Score by shooting through the hoop. Fouls result in free throws. Shot clock limits possession time.',
 9.0, 'INTERMEDIATE', true, true, true, false, '/images/sports/basketball-icon.png', '/images/sports/basketball-banner.jpg', true, NOW(), NOW()),

-- Table Tennis
('table_tennis', 'Table Tennis', 'A sport in which two or four players hit a lightweight ball back and forth across a table using small rackets. The game takes place on a hard table divided by a net.',
 'RACKET_SPORTS', 1, 2, 2, 4, 20, 60,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Table Tennis Racket", "Table Tennis Balls"]', '["Table", "Net", "Scoreboard"]', '["INDOOR_COURT", "MULTI_PURPOSE"]',
 'Serve diagonally. Ball must bounce once on each side. Points scored when opponent fails to return. Best of 5 or 7 games to 11 points.',
 8.5, 'INTERMEDIATE', false, true, false, false, '/images/sports/table-tennis-icon.png', '/images/sports/table-tennis-banner.jpg', true, NOW(), NOW()),

-- Tennis
('tennis', 'Tennis', 'A racket sport that can be played individually against a single opponent or between two teams of two players. Players use a tennis racket to hit a hollow rubber ball covered with felt over or around a net.',
 'RACKET_SPORTS', 1, 2, 2, 4, 60, 180,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Tennis Racket", "Tennis Balls", "Tennis Shoes"]', '["Net", "Court Lines", "Scoreboard"]', '["INDOOR_COURT", "OUTDOOR_COURT"]',
 'Serve diagonally. Ball must bounce once on each side. Points scored when opponent fails to return. Games, sets, and matches scoring system.',
 8.7, 'ADVANCED', false, true, true, true, '/images/sports/tennis-icon.png', '/images/sports/tennis-banner.jpg', true, NOW(), NOW()),

-- Swimming
('swimming', 'Swimming', 'A sport that involves moving through water using the arms and legs. It can be recreational or competitive, with various strokes including freestyle, breaststroke, backstroke, and butterfly.',
 'WATER_SPORTS', 1, 1, 1, 50, 30, 120,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Swimsuit", "Goggles", "Swim Cap"]', '["Lanes", "Starting Blocks", "Timing System"]', '["POOL", "INDOOR_POOL", "OUTDOOR_POOL"]',
 'Various stroke techniques. Lane discipline. Turn techniques at walls. Different distances and styles: freestyle, breaststroke, backstroke, butterfly.',
 7.8, 'INTERMEDIATE', false, true, true, false, '/images/sports/swimming-icon.png', '/images/sports/swimming-banner.jpg', true, NOW(), NOW()),

-- Athletics/Track & Field
('athletics', 'Athletics/Track & Field', 'A collection of sporting events that involve competitive running, jumping, throwing, and walking. It is one of the oldest forms of organized sports and includes events like sprints, long jump, and shot put.',
 'TRACK_SPORTS', 1, 4, 1, 100, 10, 180,
 '["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]', '["Running Shoes", "Athletic Wear", "Spikes"]', '["Track", "Jumping Pits", "Throwing Circles", "Timing System"]', '["TRACK", "INDOOR_TRACK", "OUTDOOR_TRACK"]',
 'Various event-specific rules. False starts result in disqualification. Proper technique required for field events. Relay baton exchanges must be within zones.',
 7.2, 'ADVANCED', false, true, true, true, '/images/sports/athletics-icon.png', '/images/sports/athletics-banner.jpg', true, NOW(), NOW());

-- Create view for popular sports (popularity score >= 8.0)
CREATE VIEW popular_sports AS
SELECT * FROM sports 
WHERE popularity_score >= 8.0 AND is_active = true
ORDER BY popularity_score DESC;

-- Create view for team sports
CREATE VIEW team_sports AS
SELECT * FROM sports 
WHERE is_team_sport = true AND is_active = true
ORDER BY popularity_score DESC;

-- Create view for individual sports
CREATE VIEW individual_sports AS
SELECT * FROM sports 
WHERE is_team_sport = false AND is_active = true
ORDER BY popularity_score DESC;

-- Create view for indoor sports
CREATE VIEW indoor_sports AS
SELECT * FROM sports 
WHERE is_indoor = true AND is_active = true
ORDER BY popularity_score DESC;

-- Create view for outdoor sports
CREATE VIEW outdoor_sports AS
SELECT * FROM sports 
WHERE is_outdoor = true AND is_active = true
ORDER BY popularity_score DESC;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sports TO postgres;
GRANT SELECT ON popular_sports TO postgres;
GRANT SELECT ON team_sports TO postgres;
GRANT SELECT ON individual_sports TO postgres;
GRANT SELECT ON indoor_sports TO postgres;
GRANT SELECT ON outdoor_sports TO postgres;
