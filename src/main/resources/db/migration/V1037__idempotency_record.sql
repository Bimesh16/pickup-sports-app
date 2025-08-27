CREATE TABLE IF NOT EXISTS idempotency_record (
    key VARCHAR(200) PRIMARY KEY,
    status INTEGER NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_record(created_at);
