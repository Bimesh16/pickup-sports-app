-- Additional indexes for new search filters
CREATE INDEX IF NOT EXISTS idx_game_time_skill ON game (time, skill_level);
