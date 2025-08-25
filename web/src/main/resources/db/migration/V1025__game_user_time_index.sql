-- Index to speed up queries filtering by user and time
CREATE INDEX IF NOT EXISTS idx_game_user_time ON game (user_id, "time");
