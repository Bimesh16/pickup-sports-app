-- V1042: Create venue management tables
-- This migration adds comprehensive venue management capabilities

-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    venue_type VARCHAR(50) NOT NULL,
    max_capacity INTEGER,
    min_capacity INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    base_price_per_hour DECIMAL(10,2),
    base_price_per_player DECIMAL(10,2),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    owner_id BIGINT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create venue amenities table
CREATE TABLE IF NOT EXISTS venue_amenities (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create venue business hours table
CREATE TABLE IF NOT EXISTS venue_business_hours (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create venue images table
CREATE TABLE IF NOT EXISTS venue_images (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    image_url VARCHAR(1000) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create venue_sports junction table
CREATE TABLE IF NOT EXISTS venue_sports (
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    sport_id BIGINT NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
    PRIMARY KEY (venue_id, sport_id)
);

-- Create venue_bookings table
CREATE TABLE IF NOT EXISTS venue_bookings (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    game_id BIGINT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    booked_by BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    cost_per_player DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_intent_id VARCHAR(255),
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by BIGINT REFERENCES app_user(id),
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_verified ON venues(is_verified);

CREATE INDEX IF NOT EXISTS idx_venue_amenities_venue ON venue_amenities(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_amenities_name ON venue_amenities(name);

CREATE INDEX IF NOT EXISTS idx_venue_business_hours_venue ON venue_business_hours(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_business_hours_day ON venue_business_hours(day_of_week);

CREATE INDEX IF NOT EXISTS idx_venue_images_venue ON venue_images(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_images_primary ON venue_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_venue_sports_venue ON venue_sports(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_sports_sport ON venue_sports(sport_id);

CREATE INDEX IF NOT EXISTS idx_venue_bookings_venue ON venue_bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_game ON venue_bookings(game_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_time ON venue_bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_status ON venue_bookings(status);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_payment ON venue_bookings(payment_status);

-- Add constraints
ALTER TABLE venues ADD CONSTRAINT chk_venue_capacity CHECK (max_capacity IS NULL OR max_capacity > 0);
ALTER TABLE venues ADD CONSTRAINT chk_venue_capacity_range CHECK (min_capacity IS NULL OR max_capacity IS NULL OR min_capacity <= max_capacity);
ALTER TABLE venues ADD CONSTRAINT chk_venue_prices CHECK (base_price_per_hour IS NULL OR base_price_per_hour > 0);
ALTER TABLE venues ADD CONSTRAINT chk_venue_prices_player CHECK (base_price_per_player IS NULL OR base_price_per_player >= 0);

ALTER TABLE venue_business_hours ADD CONSTRAINT chk_business_hours_time CHECK (close_time > open_time);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_venue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venue_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_venue_updated_at();

CREATE TRIGGER trg_venue_amenities_updated_at
    BEFORE UPDATE ON venue_amenities
    FOR EACH ROW
    EXECUTE FUNCTION update_venue_updated_at();

CREATE TRIGGER trg_venue_business_hours_updated_at
    BEFORE UPDATE ON venue_business_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_venue_updated_at();

CREATE TRIGGER trg_venue_images_updated_at
    BEFORE UPDATE ON venue_images
    FOR EACH ROW
    EXECUTE FUNCTION update_venue_updated_at();

CREATE TRIGGER trg_venue_bookings_updated_at
    BEFORE UPDATE ON venue_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_venue_updated_at();

-- Add venue_id column to existing game table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'venue_id') THEN
        ALTER TABLE game ADD COLUMN venue_id BIGINT REFERENCES venues(id);
        CREATE INDEX IF NOT EXISTS idx_game_venue ON game(venue_id);
    END IF;
END $$;

-- Add new columns to existing game table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'status') THEN
        ALTER TABLE game ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'game_type') THEN
        ALTER TABLE game ADD COLUMN game_type VARCHAR(50) NOT NULL DEFAULT 'PICKUP';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'description') THEN
        ALTER TABLE game ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'min_players') THEN
        ALTER TABLE game ADD COLUMN min_players INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'max_players') THEN
        ALTER TABLE game ADD COLUMN max_players INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'price_per_player') THEN
        ALTER TABLE game ADD COLUMN price_per_player DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'total_cost') THEN
        ALTER TABLE game ADD COLUMN total_cost DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'duration_minutes') THEN
        ALTER TABLE game ADD COLUMN duration_minutes INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'is_private') THEN
        ALTER TABLE game ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'requires_approval') THEN
        ALTER TABLE game ADD COLUMN requires_approval BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'weather_dependent') THEN
        ALTER TABLE game ADD COLUMN weather_dependent BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'cancellation_policy') THEN
        ALTER TABLE game ADD COLUMN cancellation_policy TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'rules') THEN
        ALTER TABLE game ADD COLUMN rules TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'equipment_provided') THEN
        ALTER TABLE game ADD COLUMN equipment_provided TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game' AND column_name = 'equipment_required') THEN
        ALTER TABLE game ADD COLUMN equipment_required TEXT;
    END IF;
END $$;

-- Create indexes for new game columns
CREATE INDEX IF NOT EXISTS idx_game_status ON game(status);
CREATE INDEX IF NOT EXISTS idx_game_type ON game(game_type);
CREATE INDEX IF NOT EXISTS idx_game_private ON game(is_private);
CREATE INDEX IF NOT EXISTS idx_game_approval ON game(requires_approval);
