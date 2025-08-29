-- Migration: V1048__create_user_analytics_tables.sql
-- Description: Create comprehensive user analytics and social features tables
-- Author: Pickup Sports App Team
-- Date: 2024-01-01

SET search_path TO public;

-- =====================================================
-- USER STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    total_games_played INTEGER NOT NULL DEFAULT 0,
    total_games_created INTEGER NOT NULL DEFAULT 0,
    total_games_won INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_play_time_hours DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    average_rating DECIMAL(3,2),
    total_ratings_received INTEGER NOT NULL DEFAULT 0,
    skill_level_progression VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',
    total_friends INTEGER NOT NULL DEFAULT 0,
    total_teams_joined INTEGER NOT NULL DEFAULT 0,
    social_score INTEGER NOT NULL DEFAULT 0,
    last_game_date TIMESTAMP,
    most_active_sport VARCHAR(100),
    preferred_time_slot VARCHAR(50),
    preferred_venue_type VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_stats_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_stats_games_played CHECK (total_games_played >= 0),
    CONSTRAINT chk_user_stats_games_created CHECK (total_games_created >= 0),
    CONSTRAINT chk_user_stats_games_won CHECK (total_games_won >= 0),
    CONSTRAINT chk_user_stats_streak CHECK (current_streak >= 0),
    CONSTRAINT chk_user_stats_longest_streak CHECK (longest_streak >= 0),
    CONSTRAINT chk_user_stats_play_time CHECK (total_play_time_hours >= 0.0),
    CONSTRAINT chk_user_stats_rating CHECK (average_rating IS NULL OR (average_rating >= 0.0 AND average_rating <= 5.0)),
    CONSTRAINT chk_user_stats_ratings_received CHECK (total_ratings_received >= 0),
    CONSTRAINT chk_user_stats_friends CHECK (total_friends >= 0),
    CONSTRAINT chk_user_stats_teams CHECK (total_teams_joined >= 0),
    CONSTRAINT chk_user_stats_social_score CHECK (social_score >= 0)
);

-- =====================================================
-- ACHIEVEMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS achievement (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    requirement_metric VARCHAR(100) NOT NULL,
    max_levels INTEGER NOT NULL DEFAULT 1,
    base_points INTEGER NOT NULL,
    points_per_level INTEGER,
    badge_icon VARCHAR(255),
    badge_color VARCHAR(50),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_achievement_requirement_value CHECK (requirement_value > 0),
    CONSTRAINT chk_achievement_max_levels CHECK (max_levels > 0),
    CONSTRAINT chk_achievement_base_points CHECK (base_points >= 0),
    CONSTRAINT chk_achievement_points_per_level CHECK (points_per_level IS NULL OR points_per_level >= 0)
);

-- =====================================================
-- USER ACHIEVEMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievement (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress_percentage INTEGER NOT NULL DEFAULT 100,
    current_level INTEGER NOT NULL DEFAULT 1,
    max_level INTEGER NOT NULL DEFAULT 1,
    points_earned INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER,
    shared_at TIMESTAMP,
    share_count INTEGER NOT NULL DEFAULT 0,
    metadata TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_achievement_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_achievement_achievement FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_achievement_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_user_achievement_level CHECK (current_level > 0 AND current_level <= max_level),
    CONSTRAINT chk_user_achievement_max_level CHECK (max_level > 0),
    CONSTRAINT chk_user_achievement_points CHECK (points_earned >= 0),
    CONSTRAINT chk_user_achievement_share_count CHECK (share_count >= 0),
    CONSTRAINT uk_user_achievement_unique UNIQUE (user_id, achievement_id)
);

-- =====================================================
-- GAME PARTICIPATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS game_participation (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    participation_type VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    was_present BOOLEAN NOT NULL DEFAULT FALSE,
    performance_rating DECIMAL(3,2),
    team_score INTEGER,
    individual_contribution TEXT,
    sportsmanship_rating DECIMAL(3,2),
    feedback_received TEXT,
    feedback_given TEXT,
    recommendation_score INTEGER,
    game_result VARCHAR(20),
    enjoyment_level INTEGER,
    would_play_again BOOLEAN,
    new_connections_made INTEGER,
    team_chemistry_rating DECIMAL(3,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_game_participation_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_participation_game FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
    CONSTRAINT chk_game_participation_performance_rating CHECK (performance_rating IS NULL OR (performance_rating >= 0.0 AND performance_rating <= 5.0)),
    CONSTRAINT chk_game_participation_team_score CHECK (team_score IS NULL OR team_score >= 0),
    CONSTRAINT chk_game_participation_sportsmanship_rating CHECK (sportsmanship_rating IS NULL OR (sportsmanship_rating >= 0.0 AND sportsmanship_rating <= 5.0)),
    CONSTRAINT chk_game_participation_recommendation_score CHECK (recommendation_score IS NULL OR (recommendation_score >= 1 AND recommendation_score <= 5)),
    CONSTRAINT chk_game_participation_enjoyment_level CHECK (enjoyment_level IS NULL OR (enjoyment_level >= 1 AND enjoyment_level <= 10)),
    CONSTRAINT chk_game_participation_new_connections CHECK (new_connections_made IS NULL OR new_connections_made >= 0),
    CONSTRAINT chk_game_participation_team_chemistry CHECK (team_chemistry_rating IS NULL OR (team_chemistry_rating >= 0.0 AND team_chemistry_rating <= 5.0)),
    CONSTRAINT uk_game_participation_unique UNIQUE (user_id, game_id)
);

-- =====================================================
-- SOCIAL CONNECTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS social_connection (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    connected_user_id BIGINT NOT NULL,
    connection_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    strength INTEGER NOT NULL DEFAULT 1,
    games_played_together INTEGER NOT NULL DEFAULT 0,
    total_play_time_hours DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    last_interaction_date TIMESTAMP,
    interaction_frequency DECIMAL(3,2),
    skill_compatibility DECIMAL(3,2),
    sport_preference_match DECIMAL(3,2),
    time_preference_match DECIMAL(3,2),
    venue_preference_match DECIMAL(3,2),
    communication_score DECIMAL(3,2),
    teamwork_score DECIMAL(3,2),
    sportsmanship_score DECIMAL(3,2),
    connected_at TIMESTAMP,
    connection_source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_social_connection_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_social_connection_connected_user FOREIGN KEY (connected_user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT chk_social_connection_strength CHECK (strength >= 1 AND strength <= 10),
    CONSTRAINT chk_social_connection_games_together CHECK (games_played_together >= 0),
    CONSTRAINT chk_social_connection_play_time CHECK (total_play_time_hours >= 0.0),
    CONSTRAINT chk_social_connection_frequency CHECK (interaction_frequency IS NULL OR (interaction_frequency >= 0.0 AND interaction_frequency <= 1.0)),
    CONSTRAINT chk_social_connection_scores CHECK (
        (skill_compatibility IS NULL OR (skill_compatibility >= 0.0 AND skill_compatibility <= 1.0)) AND
        (sport_preference_match IS NULL OR (sport_preference_match >= 0.0 AND sport_preference_match <= 1.0)) AND
        (time_preference_match IS NULL OR (time_preference_match >= 0.0 AND time_preference_match <= 1.0)) AND
        (venue_preference_match IS NULL OR (venue_preference_match >= 0.0 AND venue_preference_match <= 1.0)) AND
        (communication_score IS NULL OR (communication_score >= 0.0 AND communication_score <= 5.0)) AND
        (teamwork_score IS NULL OR (teamwork_score >= 0.0 AND teamwork_score <= 5.0)) AND
        (sportsmanship_score IS NULL OR (sportsmanship_score >= 0.0 AND sportsmanship_score <= 5.0))
    ),
    CONSTRAINT uk_social_connection_unique UNIQUE (user_id, connected_user_id),
    CONSTRAINT chk_social_connection_users_different CHECK (user_id != connected_user_id)
);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- =====================================================
-- USER PREFERRED SPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferred_sports (
    user_preferences_id BIGINT NOT NULL,
    sport_name VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_user_preferred_sports_preferences FOREIGN KEY (user_preferences_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_preferred_sports_unique UNIQUE (user_preferences_id, sport_name)
);

-- =====================================================
-- USER SPORT SKILL LEVELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sport_skill_levels (
    user_preferences_id BIGINT NOT NULL,
    sport_name VARCHAR(100) NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    
    CONSTRAINT fk_user_sport_skill_levels_preferences FOREIGN KEY (user_preferences_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_sport_skill_levels_unique UNIQUE (user_preferences_id, sport_name)
);

-- =====================================================
-- USER PREFERRED TIME SLOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferred_time_slots (
    user_preferences_id BIGINT NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    
    CONSTRAINT fk_user_preferred_time_slots_preferences FOREIGN KEY (user_preferences_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_preferred_time_slots_unique UNIQUE (user_preferences_id, time_slot)
);

-- =====================================================
-- USER PREFERRED DAYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferred_days (
    user_preferences_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    
    CONSTRAINT fk_user_preferred_days_preferences FOREIGN KEY (user_preferences_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_preferred_days_unique UNIQUE (user_preferences_id, day_of_week)
);

-- =====================================================
-- USER PREFERRED VENUE TYPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferred_venue_types (
    user_preferences_id BIGINT NOT NULL,
    venue_type VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_user_preferred_venue_types_preferences FOREIGN KEY (user_preferences_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_preferred_venue_types_unique UNIQUE (user_preferences_id, venue_type)
);

-- =====================================================
-- ADDITIONAL USER PREFERENCES COLUMNS
-- =====================================================
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS earliest_start_time TIME;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS latest_end_time TIME;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferred_game_duration_hours DOUBLE PRECISION;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS max_travel_distance_km DOUBLE PRECISION;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferred_venue_features TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS max_price_per_hour DECIMAL(10,2);
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferred_group_size_min INTEGER;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferred_group_size_max INTEGER;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS prefer_competitive_games BOOLEAN;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS prefer_casual_games BOOLEAN;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS open_to_new_players BOOLEAN;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS prefer_same_skill_level BOOLEAN;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS notification_preferences TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS communication_style VARCHAR(20);
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10);
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20);
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS allow_friend_requests BOOLEAN;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS show_game_history BOOLEAN;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User Stats indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_games_played ON user_stats(total_games_played);
CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON user_stats(current_streak);
CREATE INDEX IF NOT EXISTS idx_user_stats_longest_streak ON user_stats(longest_streak);
CREATE INDEX IF NOT EXISTS idx_user_stats_average_rating ON user_stats(average_rating);
CREATE INDEX IF NOT EXISTS idx_user_stats_social_score ON user_stats(social_score);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_game_date ON user_stats(last_game_date);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_achievement_category ON achievement(category);
CREATE INDEX IF NOT EXISTS idx_achievement_type ON achievement(type);
CREATE INDEX IF NOT EXISTS idx_achievement_is_active ON achievement(is_active);
CREATE INDEX IF NOT EXISTS idx_achievement_is_featured ON achievement(is_featured);
CREATE INDEX IF NOT EXISTS idx_achievement_base_points ON achievement(base_points);

-- User Achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievement_user_id ON user_achievement(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievement_achievement_id ON user_achievement(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievement_status ON user_achievement(status);
CREATE INDEX IF NOT EXISTS idx_user_achievement_earned_at ON user_achievement(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_achievement_points_earned ON user_achievement(points_earned);

-- Game Participation indexes
CREATE INDEX IF NOT EXISTS idx_game_participation_user_id ON game_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_game_participation_game_id ON game_participation(game_id);
CREATE INDEX IF NOT EXISTS idx_game_participation_type ON game_participation(participation_type);
CREATE INDEX IF NOT EXISTS idx_game_participation_joined_at ON game_participation(joined_at);
CREATE INDEX IF NOT EXISTS idx_game_participation_was_present ON game_participation(was_present);
CREATE INDEX IF NOT EXISTS idx_game_participation_performance_rating ON game_participation(performance_rating);

-- Social Connection indexes
CREATE INDEX IF NOT EXISTS idx_social_connection_user_id ON social_connection(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connection_connected_user_id ON social_connection(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_social_connection_type ON social_connection(connection_type);
CREATE INDEX IF NOT EXISTS idx_social_connection_status ON social_connection(status);
CREATE INDEX IF NOT EXISTS idx_social_connection_strength ON social_connection(strength);
CREATE INDEX IF NOT EXISTS idx_social_connection_games_together ON social_connection(games_played_together);

-- User Preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_earliest_start_time ON user_preferences(earliest_start_time);
CREATE INDEX IF NOT EXISTS idx_user_preferences_latest_end_time ON user_preferences(latest_end_time);
CREATE INDEX IF NOT EXISTS idx_user_preferences_max_travel_distance ON user_preferences(max_travel_distance_km);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert some default achievements
INSERT INTO achievement (name, description, category, type, requirement_value, requirement_metric, base_points, is_featured) VALUES
('First Game', 'Play your first pickup game', 'MILESTONE', 'SINGLE', 1, 'games_played', 50, true),
('Game Creator', 'Create your first game', 'MILESTONE', 'SINGLE', 1, 'games_created', 100, true),
('Streak Master', 'Maintain a 5-game winning streak', 'GAMEPLAY', 'SINGLE', 5, 'streak_days', 200, true),
('Social Butterfly', 'Make 10 new friends', 'SOCIAL', 'SINGLE', 10, 'friends_count', 150, true),
('Regular Player', 'Play 25 games', 'GAMEPLAY', 'PROGRESSIVE', 25, 'games_played', 300, true),
('Venue Explorer', 'Play at 5 different venues', 'GAMEPLAY', 'SINGLE', 5, 'venues_visited', 250, true),
('Team Player', 'Join 10 different teams', 'SOCIAL', 'PROGRESSIVE', 10, 'teams_joined', 200, true),
('Rating Champion', 'Achieve a 4.5+ average rating', 'SKILL', 'SINGLE', 45, 'rating', 500, true),
('Time Devotee', 'Log 100 hours of play time', 'GAMEPLAY', 'PROGRESSIVE', 100, 'total_play_time', 400, true),
('Sports Enthusiast', 'Play 5 different sports', 'GAMEPLAY', 'SINGLE', 5, 'sports_played', 300, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE user_stats IS 'Comprehensive user statistics and analytics for the pickup sports app';
COMMENT ON TABLE achievement IS 'Achievement definitions and rules for the gamification system';
COMMENT ON TABLE user_achievement IS 'User achievement progress and earned badges';
COMMENT ON TABLE game_participation IS 'Detailed records of user participation in games';
COMMENT ON TABLE social_connection IS 'Social connections and player interaction patterns';
COMMENT ON TABLE user_preferences IS 'User preferences for sports, venues, times, and social settings';

COMMENT ON COLUMN user_stats.social_score IS 'Overall social engagement score based on achievements, connections, and participation';
COMMENT ON COLUMN user_stats.skill_level_progression IS 'Current skill level: BEGINNER, INTERMEDIATE, ADVANCED, PRO';
COMMENT ON COLUMN achievement.requirement_metric IS 'Metric to track for achievement: games_played, games_created, streak_days, etc.';
COMMENT ON COLUMN user_achievement.status IS 'Achievement status: ACTIVE, HIDDEN, DISABLED, EXPIRED';
COMMENT ON COLUMN game_participation.participation_type IS 'Type of participation: CREATOR, PARTICIPANT, SPECTATOR, SUBSTITUTE';
COMMENT ON COLUMN social_connection.connection_type IS 'Type of connection: FRIEND, TEAMMATE, RIVAL, MENTOR, STUDENT, ACQUAINTANCE';
COMMENT ON COLUMN social_connection.strength IS 'Connection strength from 1-10, based on interactions and compatibility';
COMMENT ON COLUMN user_preferences.profile_visibility IS 'Profile visibility setting: PUBLIC, FRIENDS_ONLY, PRIVATE';
