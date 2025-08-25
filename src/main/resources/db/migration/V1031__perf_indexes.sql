-- Safe (idempotent) performance indexes for common queries

-- Games ordering and filters
CREATE INDEX IF NOT EXISTS idx_game_time ON game ("time");
CREATE INDEX IF NOT EXISTS idx_game_sport_time ON game (sport, "time");
CREATE INDEX IF NOT EXISTS idx_game_location ON game (location);
CREATE INDEX IF NOT EXISTS idx_game_user_time ON game (user_id, "time");

-- Geo prefilters (if not already present)
CREATE INDEX IF NOT EXISTS idx_game_latitude ON game (latitude);
CREATE INDEX IF NOT EXISTS idx_game_longitude ON game (longitude);

-- Participants and waitlist
CREATE INDEX IF NOT EXISTS idx_game_participants_game ON game_participants (game_id);
CREATE INDEX IF NOT EXISTS idx_game_waitlist_game ON game_waitlist (game_id);

-- Chat history
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_sentat_desc ON chat_messages (game_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages (sent_at);

-- Users
CREATE INDEX IF NOT EXISTS idx_app_user_username ON app_user (username);
