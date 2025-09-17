-- Add comprehensive profile fields to app_user table for frontend compatibility
-- Migration: V1090__add_profile_fields.sql

-- Add basic profile fields
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS email VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add identity fields
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
    ADD COLUMN IF NOT EXISTS nationality VARCHAR(2);

-- Add XP and Level System
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS rank VARCHAR(20) NOT NULL DEFAULT 'LEARNER';

-- Add verification status
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Add JSON fields for complex data
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS preferred_sports TEXT, -- JSON array
    ADD COLUMN IF NOT EXISTS privacy_settings TEXT, -- JSON object
    ADD COLUMN IF NOT EXISTS security_settings TEXT; -- JSON object

-- Add constraints
ALTER TABLE app_user
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_gender 
        CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'NONBINARY', 'PREFER_NOT_TO_SAY')),
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_rank 
        CHECK (rank IN ('LEARNER', 'COMPETENT', 'ADVANCED', 'PRO')),
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_xp 
        CHECK (xp >= 0),
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_level 
        CHECK (level >= 1),
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_nationality 
        CHECK (nationality IS NULL OR nationality ~ '^[A-Z]{2}$');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user(email);
CREATE INDEX IF NOT EXISTS idx_app_user_display_name ON app_user(display_name);
CREATE INDEX IF NOT EXISTS idx_app_user_gender ON app_user(gender);
CREATE INDEX IF NOT EXISTS idx_app_user_nationality ON app_user(nationality);
CREATE INDEX IF NOT EXISTS idx_app_user_rank ON app_user(rank);
CREATE INDEX IF NOT EXISTS idx_app_user_level ON app_user(level);
CREATE INDEX IF NOT EXISTS idx_app_user_xp ON app_user(xp);

-- Update existing users with default values
UPDATE app_user 
SET 
    first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, ''),
    email = COALESCE(email, ''),
    display_name = COALESCE(display_name, CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))),
    phone = COALESCE(phone, ''),
    gender = COALESCE(gender, 'PREFER_NOT_TO_SAY'),
    nationality = COALESCE(nationality, 'US'),
    xp = COALESCE(xp, 0),
    level = COALESCE(level, 1),
    rank = COALESCE(rank, 'LEARNER'),
    is_email_verified = COALESCE(is_email_verified, FALSE),
    is_phone_verified = COALESCE(is_phone_verified, FALSE),
    preferred_sports = COALESCE(preferred_sports, '[]'),
    privacy_settings = COALESCE(privacy_settings, '{"showPublicly": true, "publicFields": ["bio", "stats", "badges"], "privateFields": ["email", "phone"]}'),
    security_settings = COALESCE(security_settings, '{"has2FA": false, "activeSessions": [], "lastPasswordChange": "2024-01-01"}')
WHERE 
    first_name = '' OR last_name = '' OR email = '' OR 
    display_name IS NULL OR phone = '' OR gender IS NULL OR 
    nationality IS NULL OR xp = 0 OR level = 1 OR rank = 'LEARNER' OR
    is_email_verified = FALSE OR is_phone_verified = FALSE OR
    preferred_sports IS NULL OR privacy_settings IS NULL OR security_settings IS NULL;

-- Add unique constraint for email
ALTER TABLE app_user
    ADD CONSTRAINT IF NOT EXISTS uk_app_user_email UNIQUE (email);

-- Add check constraints for required fields
ALTER TABLE app_user
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_first_name_not_empty 
        CHECK (LENGTH(TRIM(first_name)) > 0),
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_last_name_not_empty 
        CHECK (LENGTH(TRIM(last_name)) > 0),
    ADD CONSTRAINT IF NOT EXISTS chk_app_user_email_not_empty 
        CHECK (LENGTH(TRIM(email)) > 0);

-- Add comments for documentation
COMMENT ON COLUMN app_user.first_name IS 'User first name';
COMMENT ON COLUMN app_user.last_name IS 'User last name';
COMMENT ON COLUMN app_user.email IS 'User email address';
COMMENT ON COLUMN app_user.display_name IS 'User display name for public profiles';
COMMENT ON COLUMN app_user.phone IS 'User phone number';
COMMENT ON COLUMN app_user.gender IS 'User gender identity';
COMMENT ON COLUMN app_user.nationality IS 'User nationality (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN app_user.xp IS 'User experience points';
COMMENT ON COLUMN app_user.level IS 'User level based on XP';
COMMENT ON COLUMN app_user.rank IS 'User rank (Learner, Competent, Advanced, Pro)';
COMMENT ON COLUMN app_user.is_email_verified IS 'Email verification status';
COMMENT ON COLUMN app_user.is_phone_verified IS 'Phone verification status';
COMMENT ON COLUMN app_user.preferred_sports IS 'JSON array of preferred sports';
COMMENT ON COLUMN app_user.privacy_settings IS 'JSON object with privacy preferences';
COMMENT ON COLUMN app_user.security_settings IS 'JSON object with security preferences';
