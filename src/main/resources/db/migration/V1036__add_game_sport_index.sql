-- Index for faster sport-based lookups
CREATE INDEX IF NOT EXISTS idx_game_sport ON game (sport);
