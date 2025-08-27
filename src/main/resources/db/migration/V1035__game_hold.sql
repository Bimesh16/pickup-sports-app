-- V1035: Hold reservations for two-phase join (confirm within TTL)
CREATE TABLE IF NOT EXISTS game_hold (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Prevent multiple concurrent holds per user per game
CREATE UNIQUE INDEX IF NOT EXISTS ux_game_hold_game_user ON game_hold(game_id, user_id);

-- Cleanup helpers
CREATE INDEX IF NOT EXISTS idx_game_hold_expires_at ON game_hold(expires_at);
CREATE INDEX IF NOT EXISTS idx_game_hold_game ON game_hold(game_id);
