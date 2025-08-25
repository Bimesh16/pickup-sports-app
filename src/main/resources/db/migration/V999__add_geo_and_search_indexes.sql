-- Geo/search performance indexes
-- Safe to re-run: IF NOT EXISTS guards (PostgreSQL 9.5+)

-- Index on game time for explore ordering
CREATE INDEX IF NOT EXISTS idx_game_time ON game (time);

-- Composite index for sport + time filters
CREATE INDEX IF NOT EXISTS idx_game_sport_time ON game (sport, time);

-- Latitude/Longitude indexes for bounding-box prefilter
CREATE INDEX IF NOT EXISTS idx_game_latitude ON game (latitude);
CREATE INDEX IF NOT EXISTS idx_game_longitude ON game (longitude);

-- Skill level filter (optional)
CREATE INDEX IF NOT EXISTS idx_game_skill_level ON game (skill_level);
