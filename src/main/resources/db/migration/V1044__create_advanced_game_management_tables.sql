-- Migration: Create Advanced Game Management tables
-- Version: V1044
-- Description: Creates tables for tournaments, equipment, weather conditions, and user ratings

SET search_path TO public;

-- Sports table
CREATE TABLE sports (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(50),
    min_players INTEGER,
    max_players INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    icon_url VARCHAR(255),
    rules_summary VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    sport_id BIGINT NOT NULL,
    venue_id BIGINT,
    organizer_id BIGINT NOT NULL,
    tournament_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    max_teams INTEGER NOT NULL,
    min_teams INTEGER NOT NULL,
    team_size INTEGER NOT NULL,
    entry_fee DECIMAL(10,2),
    prize_pool DECIMAL(10,2),
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    rules VARCHAR(2000),
    bracket_structure VARCHAR(100),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    max_spectators INTEGER,
    spectator_fee DECIMAL(10,2),
    weather_dependent BOOLEAN NOT NULL DEFAULT FALSE,
    weather_policy VARCHAR(500),
    cancellation_policy VARCHAR(500),
    equipment_provided VARCHAR(500),
    equipment_required VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tournaments_sport FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    CONSTRAINT fk_tournaments_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
    CONSTRAINT fk_tournaments_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_tournaments_type CHECK (tournament_type IN ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS_SYSTEM', 'CUSTOM')),
    CONSTRAINT chk_tournaments_status CHECK (status IN ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_tournaments_dates CHECK (start_date < end_date AND registration_deadline < start_date)
);

-- Tournament teams table
CREATE TABLE tournament_teams (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    team_description VARCHAR(500),
    captain_id BIGINT NOT NULL,
    max_members INTEGER NOT NULL,
    current_members INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    entry_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
    entry_fee_amount DECIMAL(10,2),
    payment_intent_id VARCHAR(100),
    seed_position INTEGER,
    final_rank INTEGER,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    ties INTEGER NOT NULL DEFAULT 0,
    points_for INTEGER,
    points_against INTEGER,
    registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tournament_teams_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_tournament_teams_captain FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_tournament_teams_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'ELIMINATED', 'WITHDRAWN')),
    CONSTRAINT chk_tournament_teams_members CHECK (current_members <= max_members AND current_members >= 0)
);

-- Tournament team members junction table
CREATE TABLE tournament_team_members (
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (team_id, user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES tournament_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament games table
CREATE TABLE tournament_games (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    game_number INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    bracket_position VARCHAR(50),
    home_team_id BIGINT,
    away_team_id BIGINT,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    home_team_score INTEGER,
    away_team_score INTEGER,
    home_team_points INTEGER,
    away_team_points INTEGER,
    duration_minutes INTEGER,
    venue_name VARCHAR(100),
    field_number VARCHAR(20),
    referee_name VARCHAR(100),
    weather_conditions VARCHAR(100),
    notes VARCHAR(1000),
    winner_id BIGINT,
    loser_id BIGINT,
    is_tie BOOLEAN NOT NULL DEFAULT FALSE,
    overtime_played BOOLEAN NOT NULL DEFAULT FALSE,
    overtime_minutes INTEGER,
    penalty_shootout BOOLEAN NOT NULL DEFAULT FALSE,
    home_team_penalties INTEGER,
    away_team_penalties INTEGER,
    attendance INTEGER,
    ticket_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tournament_games_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_tournament_games_home_team FOREIGN KEY (home_team_id) REFERENCES tournament_teams(id) ON DELETE SET NULL,
    CONSTRAINT fk_tournament_games_away_team FOREIGN KEY (away_team_id) REFERENCES tournament_teams(id) ON DELETE SET NULL,
    CONSTRAINT chk_tournament_games_status CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'FORFEITED')),
    CONSTRAINT chk_tournament_games_teams CHECK (home_team_id != away_team_id OR home_team_id IS NULL OR away_team_id IS NULL)
);

-- Equipment table
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    condition_rating DECIMAL(3,2),
    purchase_date TIMESTAMP WITH TIME ZONE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    rental_price_per_day DECIMAL(10,2),
    rental_price_per_hour DECIMAL(10,2),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_rentable BOOLEAN NOT NULL DEFAULT FALSE,
    is_for_sale BOOLEAN NOT NULL DEFAULT FALSE,
    quantity_available INTEGER NOT NULL DEFAULT 1,
    total_quantity INTEGER NOT NULL DEFAULT 1,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    venue_id BIGINT,
    storage_location VARCHAR(100),
    maintenance_notes VARCHAR(1000),
    last_maintenance_date TIMESTAMP WITH TIME ZONE,
    next_maintenance_date TIMESTAMP WITH TIME ZONE,
    warranty_expiry_date TIMESTAMP WITH TIME ZONE,
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    qr_code VARCHAR(100),
    image_url VARCHAR(255),
    specifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_equipment_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
    CONSTRAINT chk_equipment_category CHECK (category IN ('BALLS', 'NETS', 'GOALS', 'PADS', 'PROTECTIVE_GEAR', 'TRAINING_EQUIPMENT', 'SCORING_EQUIPMENT', 'TIMING_EQUIPMENT', 'MEASUREMENT_EQUIPMENT', 'ACCESSORIES', 'OTHER')),
    CONSTRAINT chk_equipment_type CHECK (type IN ('SOCCER_BALL', 'BASKETBALL', 'TENNIS_RACKET', 'VOLLEYBALL_NET', 'SOCCER_GOAL', 'BASKETBALL_HOOP', 'TENNIS_NET', 'PADDING', 'HELMET', 'SHIN_GUARDS', 'TRAINING_CONES', 'SCOREBOARD', 'STOPWATCH', 'MEASURING_TAPE', 'WATER_COOLER', 'OTHER')),
    CONSTRAINT chk_equipment_condition CHECK (condition_rating >= 1.00 AND condition_rating <= 5.00),
    CONSTRAINT chk_equipment_quantity CHECK (quantity_available >= 0 AND quantity_available <= total_quantity AND total_quantity >= minimum_quantity)
);

-- Weather conditions table
CREATE TABLE weather_conditions (
    id BIGSERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    forecast_date TIMESTAMP WITH TIME ZONE NOT NULL,
    forecast_time TIMESTAMP WITH TIME ZONE NOT NULL,
    weather_type VARCHAR(50) NOT NULL,
    temperature_celsius DECIMAL(5,2),
    temperature_fahrenheit DECIMAL(5,2),
    feels_like_celsius DECIMAL(5,2),
    feels_like_fahrenheit DECIMAL(5,2),
    humidity_percentage DECIMAL(5,2),
    wind_speed_kmh DECIMAL(6,2),
    wind_speed_mph DECIMAL(6,2),
    wind_direction_degrees INTEGER,
    wind_direction_cardinal VARCHAR(10),
    precipitation_probability DECIMAL(5,2),
    precipitation_amount_mm DECIMAL(6,2),
    precipitation_amount_inches DECIMAL(6,2),
    visibility_km DECIMAL(6,2),
    visibility_miles DECIMAL(6,2),
    uv_index DECIMAL(4,2),
    air_quality_index INTEGER,
    pressure_hpa DECIMAL(7,2),
    pressure_inhg DECIMAL(5,2),
    dew_point_celsius DECIMAL(5,2),
    dew_point_fahrenheit DECIMAL(5,2),
    cloud_cover_percentage INTEGER,
    sunrise_time TIMESTAMP WITH TIME ZONE,
    sunset_time TIMESTAMP WITH TIME ZONE,
    moon_phase VARCHAR(50),
    weather_description VARCHAR(200),
    weather_icon VARCHAR(100),
    data_source VARCHAR(100),
    confidence_level DECIMAL(3,2),
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_weather_type CHECK (weather_type IN ('CLEAR', 'CLOUDY', 'PARTLY_CLOUDY', 'RAIN', 'SNOW', 'SLEET', 'HAIL', 'FOG', 'MIST', 'THUNDERSTORM', 'DRIZZLE', 'SHOWER', 'BLIZZARD', 'DUST', 'SMOKE', 'HAZE', 'TORNADO', 'HURRICANE', 'TROPICAL_STORM', 'WINDY', 'CALM', 'LIGHT_BREEZE', 'MODERATE_BREEZE', 'FRESH_BREEZE', 'STRONG_BREEZE', 'HIGH_WIND', 'GALE', 'STORM', 'VIOLENT_STORM', 'HURRICANE_FORCE')),
    CONSTRAINT chk_weather_coordinates CHECK (latitude >= -90 AND latitude <= 90 AND longitude >= -180 AND longitude <= 180),
    CONSTRAINT chk_weather_confidence CHECK (confidence_level >= 0.00 AND confidence_level <= 1.00)
);

-- User ratings table
CREATE TABLE user_ratings (
    id BIGSERIAL PRIMARY KEY,
    rated_user_id BIGINT NOT NULL,
    rater_user_id BIGINT NOT NULL,
    rating DECIMAL(3,2) NOT NULL,
    sport VARCHAR(50),
    rating_category VARCHAR(50) NOT NULL,
    comment VARCHAR(1000),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    game_id BIGINT,
    tournament_id BIGINT,
    venue_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    moderation_notes VARCHAR(500),
    moderated_by BIGINT,
    moderated_at TIMESTAMP WITH TIME ZONE,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    response_comment VARCHAR(1000),
    response_date TIMESTAMP WITH TIME ZONE,
    rating_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_user_ratings_rated_user FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_ratings_rater_user FOREIGN KEY (rater_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_ratings_moderated_by FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_user_ratings_rating CHECK (rating >= 1.00 AND rating <= 5.00),
    CONSTRAINT chk_user_ratings_category CHECK (rating_category IN ('OVERALL', 'SKILL_LEVEL', 'SPORTSMANSHIP', 'RELIABILITY', 'TEAMWORK', 'COMMUNICATION', 'PUNCTUALITY', 'EQUIPMENT_SHARING', 'COACHING_ABILITY', 'REFEREE_QUALITY', 'VENUE_QUALITY', 'ORGANIZATION', 'VALUE_FOR_MONEY', 'SAFETY', 'CLEANLINESS', 'OTHER')),
    CONSTRAINT chk_user_ratings_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DELETED')),
    CONSTRAINT chk_user_ratings_different_users CHECK (rated_user_id != rater_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_sport ON tournaments(sport_id);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX idx_tournaments_public ON tournaments(is_public, status);

CREATE INDEX idx_tournament_teams_tournament ON tournament_teams(tournament_id);
CREATE INDEX idx_tournament_teams_captain ON tournament_teams(captain_id);
CREATE INDEX idx_tournament_teams_status ON tournament_teams(status);
CREATE INDEX idx_tournament_teams_rank ON tournament_teams(final_rank);

CREATE INDEX idx_tournament_games_tournament ON tournament_games(tournament_id);
CREATE INDEX idx_tournament_games_round ON tournament_games(round_number);
CREATE INDEX idx_tournament_games_status ON tournament_games(status);
CREATE INDEX idx_tournament_games_scheduled ON tournament_games(scheduled_time);

CREATE INDEX idx_equipment_venue ON equipment(venue_id);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_available ON equipment(is_available, is_rentable);

CREATE INDEX idx_weather_conditions_location ON weather_conditions(location);
CREATE INDEX idx_weather_conditions_forecast ON weather_conditions(forecast_date, forecast_time);
CREATE INDEX idx_weather_conditions_coordinates ON weather_conditions(latitude, longitude);

CREATE INDEX idx_user_ratings_rated_user ON user_ratings(rated_user_id);
CREATE INDEX idx_user_ratings_rater_user ON user_ratings(rater_user_id);
CREATE INDEX idx_user_ratings_sport ON user_ratings(sport);
CREATE INDEX idx_user_ratings_category ON user_ratings(rating_category);
CREATE INDEX idx_user_ratings_status ON user_ratings(status);
CREATE INDEX idx_user_ratings_rating ON user_ratings(rating);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON sports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_teams_updated_at BEFORE UPDATE ON tournament_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_games_updated_at BEFORE UPDATE ON tournament_games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_conditions_updated_at BEFORE UPDATE ON weather_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE sports IS 'Available sports in the system';
COMMENT ON TABLE tournaments IS 'Tournament competitions and events';
COMMENT ON TABLE tournament_teams IS 'Teams participating in tournaments';
COMMENT ON TABLE tournament_team_members IS 'Junction table for team members';
COMMENT ON TABLE tournament_games IS 'Individual games within tournaments';
COMMENT ON TABLE equipment IS 'Sports equipment and gear management';
COMMENT ON TABLE weather_conditions IS 'Weather data for location-based scheduling';
COMMENT ON TABLE user_ratings IS 'User ratings and social feedback system';

-- Insert some default sports
INSERT INTO sports (name, display_name, description, category, min_players, max_players, is_active) VALUES
('soccer', 'Soccer', 'Association football - the beautiful game', 'Team Sports', 6, 22, true),
('basketball', 'Basketball', 'Fast-paced indoor/outdoor basketball', 'Team Sports', 2, 10, true),
('tennis', 'Tennis', 'Individual or doubles tennis', 'Racket Sports', 2, 4, true),
('volleyball', 'Volleyball', 'Indoor or beach volleyball', 'Team Sports', 4, 12, true),
('baseball', 'Baseball', 'America''s pastime', 'Team Sports', 9, 18, true),
('ultimate-frisbee', 'Ultimate Frisbee', 'Non-contact team sport with flying disc', 'Team Sports', 7, 14, true),
('pickleball', 'Pickleball', 'Fast-growing paddle sport', 'Racket Sports', 2, 4, true),
('flag-football', 'Flag Football', 'Non-contact version of American football', 'Team Sports', 5, 10, true);
