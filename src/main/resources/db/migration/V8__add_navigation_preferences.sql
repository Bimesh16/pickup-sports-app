-- Create user_navigation_prefs table
CREATE TABLE user_navigation_prefs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    preferred_layout VARCHAR(20) NOT NULL DEFAULT 'AUTO',
    show_tab_labels BOOLEAN NOT NULL DEFAULT true,
    tab_animation_speed INTEGER NOT NULL DEFAULT 300,
    enable_haptic_feedback BOOLEAN NOT NULL DEFAULT true,
    enable_rtl BOOLEAN NOT NULL DEFAULT false,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    theme_preference VARCHAR(20) NOT NULL DEFAULT 'SYSTEM',
    high_contrast BOOLEAN NOT NULL DEFAULT false,
    reduced_motion BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_navigation_prefs_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT chk_navigation_layout 
        CHECK (preferred_layout IN ('AUTO', 'PILL_TABS', 'BENTO_MENU')),
    
    CONSTRAINT chk_theme_preference 
        CHECK (theme_preference IN ('SYSTEM', 'LIGHT', 'DARK')),
    
    CONSTRAINT chk_animation_speed 
        CHECK (tab_animation_speed >= 100 AND tab_animation_speed <= 1000),
    
    CONSTRAINT chk_language_code 
        CHECK (preferred_language IN ('en', 'ne', 'ar', 'es', 'fr', 'de', 'hi', 'zh', 'ja', 'ko'))
);

-- Create index for faster lookups
CREATE INDEX idx_navigation_prefs_user_id ON user_navigation_prefs(user_id);
CREATE INDEX idx_navigation_prefs_username ON user_navigation_prefs(user_id);

-- Add comments for documentation
COMMENT ON TABLE user_navigation_prefs IS 'User navigation and UI preferences';
COMMENT ON COLUMN user_navigation_prefs.preferred_layout IS 'Preferred navigation layout: AUTO, PILL_TABS, or BENTO_MENU';
COMMENT ON COLUMN user_navigation_prefs.show_tab_labels IS 'Whether to show tab labels in navigation';
COMMENT ON COLUMN user_navigation_prefs.tab_animation_speed IS 'Animation speed in milliseconds (100-1000)';
COMMENT ON COLUMN user_navigation_prefs.enable_haptic_feedback IS 'Enable haptic feedback on mobile devices';
COMMENT ON COLUMN user_navigation_prefs.enable_rtl IS 'Enable right-to-left layout support';
COMMENT ON COLUMN user_navigation_prefs.preferred_language IS 'User preferred language code';
COMMENT ON COLUMN user_navigation_prefs.theme_preference IS 'Theme preference: SYSTEM, LIGHT, or DARK';
COMMENT ON COLUMN user_navigation_prefs.high_contrast IS 'Enable high contrast mode for accessibility';
COMMENT ON COLUMN user_navigation_prefs.reduced_motion IS 'Enable reduced motion for accessibility';
