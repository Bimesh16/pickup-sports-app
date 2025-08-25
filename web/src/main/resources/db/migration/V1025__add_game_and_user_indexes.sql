-- Add indexes on high-cardinality columns for query performance
-- This migration is idempotent via IF NOT EXISTS

CREATE INDEX IF NOT EXISTS idx_game_time ON game ("time");
CREATE INDEX IF NOT EXISTS idx_game_location ON game (location);
CREATE INDEX IF NOT EXISTS idx_app_user_username ON app_user (username);
