-- Add capacity, waitlist, and RSVP cutoff to games
ALTER TABLE game
    ADD COLUMN IF NOT EXISTS capacity INTEGER,
    ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS rsvp_cutoff TIMESTAMPTZ;

-- Waitlist table for games
CREATE TABLE IF NOT EXISTS game_waitlist (
    game_id BIGINT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_game_waitlist_game ON game_waitlist(game_id);
CREATE INDEX IF NOT EXISTS idx_game_waitlist_user ON game_waitlist(user_id);
