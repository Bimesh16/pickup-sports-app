-- V1033: Create revoked_token table (idempotent)
-- Purpose: persist revoked JWT IDs (jti) to enforce token revocation checks
-- Compatible with PostgreSQL

CREATE TABLE IF NOT EXISTS revoked_token (
    jti         VARCHAR(255) PRIMARY KEY,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason      VARCHAR(255) NULL
);

-- Optional: comment for documentation
COMMENT ON TABLE revoked_token IS 'JWT revocation list keyed by JTI';
COMMENT ON COLUMN revoked_token.jti IS 'JWT ID (JTI) of the revoked token';
COMMENT ON COLUMN revoked_token.revoked_at IS 'Timestamp when the token was revoked';
COMMENT ON COLUMN revoked_token.reason IS 'Optional reason for revocation';
