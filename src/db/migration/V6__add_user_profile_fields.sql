-- Add new user profile fields for Account Settings
-- Migration: V6__add_user_profile_fields.sql

-- Add email field (required, unique)
ALTER TABLE app_user ADD COLUMN email VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE app_user ADD CONSTRAINT uk_user_email UNIQUE (email);

-- Add first_name and last_name fields (required)
ALTER TABLE app_user ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE app_user ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '';

-- Add optional profile fields
ALTER TABLE app_user ADD COLUMN gender VARCHAR(20);
ALTER TABLE app_user ADD COLUMN nationality VARCHAR(50);
ALTER TABLE app_user ADD COLUMN birth_date DATE;
ALTER TABLE app_user ADD COLUMN country VARCHAR(50);
ALTER TABLE app_user ADD COLUMN city VARCHAR(50);
ALTER TABLE app_user ADD COLUMN default_cricket_format VARCHAR(20);

-- Update existing users with default values
UPDATE app_user SET 
    email = username || '@example.com',
    first_name = username,
    last_name = 'User'
WHERE email = '';

-- Now make email field NOT NULL (after setting default values)
-- Note: This might need to be done in a separate migration depending on your database
-- ALTER TABLE app_user ALTER COLUMN email SET NOT NULL;

-- Add indexes for better query performance
CREATE INDEX idx_user_email ON app_user(email);
CREATE INDEX idx_user_country ON app_user(country);
CREATE INDEX idx_user_city ON app_user(city);
CREATE INDEX idx_user_nationality ON app_user(nationality);
