-- Add user preferences tables for Account Settings
-- Migration: V7__add_user_preferences_tables.sql

-- Create user_payment_settings table
CREATE TABLE user_payment_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    country VARCHAR(50) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    preferred_payment_method VARCHAR(50),
    auto_currency_conversion BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_user_payment_settings_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create user_payment_methods table (for payment methods collection)
CREATE TABLE user_payment_methods (
    user_payment_settings_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    CONSTRAINT fk_user_payment_methods_settings FOREIGN KEY (user_payment_settings_id) REFERENCES user_payment_settings(id) ON DELETE CASCADE
);

-- Create user_sports_preferences table
CREATE TABLE user_sports_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    default_cricket_format VARCHAR(20),
    travel_radius_km INTEGER,
    availability_days TEXT,
    preferred_time_slots TEXT,
    open_to_invites BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_user_sports_preferences_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create user_sport_skill_levels table (for sport skill levels map)
CREATE TABLE user_sport_skill_levels (
    user_sports_preferences_id BIGINT NOT NULL,
    sport VARCHAR(50) NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    CONSTRAINT fk_user_sport_skill_levels_preferences FOREIGN KEY (user_sports_preferences_id) REFERENCES user_sports_preferences(id) ON DELETE CASCADE,
    PRIMARY KEY (user_sports_preferences_id, sport)
);

-- Add new notification preference columns to existing user_notification_prefs table
ALTER TABLE user_notification_prefs ADD COLUMN game_invites BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_notification_prefs ADD COLUMN game_updates BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_notification_prefs ADD COLUMN achievements BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_notification_prefs ADD COLUMN social_activity BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_notification_prefs ADD COLUMN marketing BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_notification_prefs ADD COLUMN push_notifications BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_notification_prefs ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for better query performance
CREATE INDEX idx_user_payment_settings_user_id ON user_payment_settings(user_id);
CREATE INDEX idx_user_payment_settings_country ON user_payment_settings(country);
CREATE INDEX idx_user_sports_preferences_user_id ON user_sports_preferences(user_id);
CREATE INDEX idx_user_sport_skill_levels_preferences_id ON user_sport_skill_levels(user_sports_preferences_id);
