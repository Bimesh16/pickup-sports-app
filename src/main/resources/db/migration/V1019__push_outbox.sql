CREATE TABLE IF NOT EXISTS push_outbox (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    title VARCHAR(200) NOT NULL,
    body VARCHAR(2000) NOT NULL,
    link VARCHAR(1000),
    status VARCHAR(16) NOT NULL,
    error VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_outbox_status ON push_outbox(status);
CREATE INDEX IF NOT EXISTS idx_push_outbox_created_at ON push_outbox(created_at);
