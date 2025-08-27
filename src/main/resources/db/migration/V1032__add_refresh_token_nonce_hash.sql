-- Add nonce_hash column to refresh_token to match entity model
ALTER TABLE refresh_token
    ADD COLUMN IF NOT EXISTS nonce_hash VARCHAR(128);
-- Add nonce_hash column to refresh_token to match entity model
ALTER TABLE refresh_token
    ADD COLUMN IF NOT EXISTS nonce_hash VARCHAR(128);

-- Backfill any existing rows to a safe default
UPDATE refresh_token
SET nonce_hash = ''
WHERE nonce_hash IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE refresh_token
    ALTER COLUMN nonce_hash SET NOT NULL;
-- Backfill any existing rows to a safe default
UPDATE refresh_token
SET nonce_hash = ''
WHERE nonce_hash IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE refresh_token
    ALTER COLUMN nonce_hash SET NOT NULL;
