CREATE TABLE IF NOT EXISTS mfa_recovery_code (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    code_hash VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consumed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_mfa_recovery_user ON mfa_recovery_code(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_consumed ON mfa_recovery_code(consumed_at);

CREATE TABLE IF NOT EXISTS trusted_device (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    device_id VARCHAR(64) NOT NULL,
    trusted_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id)
);
