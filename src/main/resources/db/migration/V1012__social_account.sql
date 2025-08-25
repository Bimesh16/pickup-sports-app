CREATE TABLE IF NOT EXISTS social_account (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    email VARCHAR(320),
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, subject)
);
CREATE INDEX IF NOT EXISTS idx_social_account_provider ON social_account(provider);
CREATE INDEX IF NOT EXISTS idx_social_account_email ON social_account(email);
