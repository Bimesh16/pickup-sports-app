-- Create venues table
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description VARCHAR(1000),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    rating DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT chk_venues_latitude 
        CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT chk_venues_longitude 
        CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT chk_venues_rating 
        CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

-- Create venue amenities table
CREATE TABLE venue_amenities (
    venue_id BIGINT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_venue_amenities_venue 
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    CONSTRAINT pk_venue_amenities 
        PRIMARY KEY (venue_id, amenity)
);

-- Create venue photos table
CREATE TABLE venue_photos (
    venue_id BIGINT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    
    CONSTRAINT fk_venue_photos_venue 
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_venues_location ON venues(latitude, longitude);
CREATE INDEX idx_venues_rating ON venues(rating);
CREATE INDEX idx_venues_is_active ON venues(is_active);
CREATE INDEX idx_venues_name ON venues(name);

-- Create spatial index for location-based queries (if PostGIS is available)
-- CREATE INDEX idx_venues_geom ON venues USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
