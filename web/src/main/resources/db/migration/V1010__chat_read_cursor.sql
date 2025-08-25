CREATE TABLE IF NOT EXISTS chat_read_cursor (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    game_id BIGINT NOT NULL,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01 00:00:00+00',
    last_read_message_id BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_crc_user ON chat_read_cursor(user_id);
CREATE INDEX IF NOT EXISTS idx_crc_game ON chat_read_cursor(game_id);
