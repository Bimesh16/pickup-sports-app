-- Migration: Add performance indexes for better query performance
-- Version: V1047
-- Description: Adds database indexes to improve query performance for common operations

-- Game table performance indexes
CREATE INDEX IF NOT EXISTS idx_game_sport_time ON game(sport, time);
CREATE INDEX IF NOT EXISTS idx_game_location_coordinates ON game(location, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_game_status_time ON game(status, time);
CREATE INDEX IF NOT EXISTS idx_game_user_time ON game(user_id, time);
CREATE INDEX IF NOT EXISTS idx_game_venue_time ON game(venue_id, time);
CREATE INDEX IF NOT EXISTS idx_game_capacity_status ON game(capacity, status);
CREATE INDEX IF NOT EXISTS idx_game_price_range ON game(price_per_player, status);

-- User table performance indexes
CREATE INDEX IF NOT EXISTS idx_user_username ON app_user(username);
CREATE INDEX IF NOT EXISTS idx_user_location_coordinates ON app_user(location, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_preferred_sport ON app_user(preferred_sport);
CREATE INDEX IF NOT EXISTS idx_user_skill_level ON app_user(skill_level);
CREATE INDEX IF NOT EXISTS idx_user_rating ON app_user(rating_average, rating_count);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON app_user(created_at);

-- Venue table performance indexes
CREATE INDEX IF NOT EXISTS idx_venue_name_city ON venues(name, city);
CREATE INDEX IF NOT EXISTS idx_venue_location_coordinates ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venue_type_status ON venues(venue_type, status);
CREATE INDEX IF NOT EXISTS idx_venue_capacity_price ON venues(max_capacity, base_price_per_hour);
CREATE INDEX IF NOT EXISTS idx_venue_owner_status ON venues(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_venue_city_state ON venues(city, state, country);

-- Venue booking performance indexes
CREATE INDEX IF NOT EXISTS idx_venue_booking_venue_time ON venue_bookings(venue_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_venue_booking_user_time ON venue_bookings(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_venue_booking_status_time ON venue_bookings(status, start_time);
CREATE INDEX IF NOT EXISTS idx_venue_booking_payment_status ON venue_bookings(payment_status, created_at);

-- Game participants performance indexes
CREATE INDEX IF NOT EXISTS idx_game_participants_game_user ON game_participants(game_id, user_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_user_time ON game_participants(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_game_participants_status ON game_participants(status, created_at);

-- Game waitlist performance indexes
CREATE INDEX IF NOT EXISTS idx_game_waitlist_game_user ON game_waitlist(game_id, user_id);
CREATE INDEX IF NOT EXISTS idx_game_waitlist_user_time ON game_waitlist(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_game_waitlist_priority ON game_waitlist(game_id, created_at);

-- Chat messages performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_time ON chat_messages(game_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_time ON chat_messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type_time ON chat_messages(message_type, created_at);

-- Notification performance indexes
CREATE INDEX IF NOT EXISTS idx_notification_user_type ON notification(user_id, type, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_status_time ON notification(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_read_status ON notification(user_id, read, created_at);

-- User ratings performance indexes
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user ON user_ratings(rated_user_id, rating_type);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_user ON user_ratings(rater_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating_value ON user_ratings(rating_value, created_at);

-- Search and discovery performance indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_sport ON saved_searches(user_id, sport);
CREATE INDEX IF NOT EXISTS idx_saved_searches_location ON saved_searches(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_saved_searches_frequency ON saved_searches(user_id, search_frequency);

-- Analytics and tracking performance indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type ON analytics_events(user_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_time ON analytics_events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_location ON analytics_events(latitude, longitude, created_at);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint_time ON performance_metrics(endpoint, created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time ON performance_metrics(response_time, created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_status_code ON performance_metrics(status_code, created_at);

-- Business intelligence indexes
CREATE INDEX IF NOT EXISTS idx_business_intelligence_metric_date ON business_intelligence(metric_name, date);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_category ON business_intelligence(category, date);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_value_range ON business_intelligence(metric_value, date);

-- Predictive analytics indexes
CREATE INDEX IF NOT EXISTS idx_predictive_analytics_model_type ON predictive_analytics(model_type, created_at);
CREATE INDEX IF NOT EXISTS idx_predictive_analytics_accuracy ON predictive_analytics(accuracy_score, created_at);
CREATE INDEX IF NOT EXISTS idx_predictive_analytics_prediction_type ON predictive_analytics(prediction_type, created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_game_advanced_search ON game(sport, status, time, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venue_advanced_search ON venues(venue_type, status, city, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_advanced_search ON app_user(preferred_sport, skill_level, location, rating_average);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_game_active_sport_time ON game(sport, time) WHERE status IN ('PUBLISHED', 'FULL');
CREATE INDEX IF NOT EXISTS idx_venue_active_location ON venues(latitude, longitude) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_user_active_sport ON app_user(preferred_sport, skill_level) WHERE rating_average >= 3.0;

-- Add comments for documentation
COMMENT ON INDEX idx_game_sport_time IS 'Index for filtering games by sport and time';
COMMENT ON INDEX idx_game_location_coordinates IS 'Index for geographic game searches';
COMMENT ON INDEX idx_venue_name_city IS 'Index for venue name and city searches';
COMMENT ON INDEX idx_venue_location_coordinates IS 'Index for geographic venue searches';
COMMENT ON INDEX idx_user_username IS 'Index for user authentication lookups';
COMMENT ON INDEX idx_game_advanced_search IS 'Composite index for complex game search queries';
COMMENT ON INDEX idx_venue_advanced_search IS 'Composite index for complex venue search queries';
COMMENT ON INDEX idx_user_advanced_search IS 'Composite index for complex user search queries';
