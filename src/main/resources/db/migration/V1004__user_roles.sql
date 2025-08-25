CREATE TABLE IF NOT EXISTS app_user_roles (
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- Seed all existing users with USER role
INSERT INTO app_user_roles (user_id, role)
SELECT id, 'USER' FROM app_user
ON CONFLICT DO NOTHING;

-- Add MFA columns
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(64);
