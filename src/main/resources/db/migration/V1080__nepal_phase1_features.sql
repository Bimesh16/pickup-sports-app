-- Migration: V1080__nepal_phase1_features.sql
-- Description: Add Nepal-specific Phase 1 features including Futsal, City Hosts, and Payment Integration

SET search_path TO public;

-- =============================================
-- 1. Add Futsal Sport (Nepal's Most Popular Indoor Sport)
-- =============================================

-- Insert futsal sport with Nepal-specific configuration
INSERT INTO sport (
    name, display_name, description, category,
    team_size_min, team_size_max, total_players_min, total_players_max,
    duration_minutes_min, duration_minutes_max,
    skill_levels, equipment_required, equipment_provided, venue_types, rules,
    popularity_score, difficulty_level, is_team_sport, is_indoor, is_outdoor, is_weather_dependent,
    icon_url, banner_url, is_active, created_at, updated_at
)
VALUES (
    'futsal', 'Futsal',
    'Indoor soccer variant played on a smaller court with 5 players per team. Fast-paced game with emphasis on skill, technique, and quick thinking. Popular in Nepal for year-round play.',
    'BALL_SPORTS',
    5, 5, 10, 10, 40, 60,
    '["BEGINNER","INTERMEDIATE","ADVANCED","PRO"]',
    '["Indoor Soccer Shoes","Shin Guards","Futsal Ball"]',
    '["Goals","Court Markings","Referee Equipment"]',
    '["INDOOR_COURT","FUTSAL_CENTER"]',
    'FIFA Futsal rules. 5 players per team, smaller ball, no offside, unlimited substitutions, 20-minute halves with running clock.',
    9.2, 'INTERMEDIATE', TRUE, TRUE, FALSE, FALSE,
    '/images/sports/futsal-icon.png', '/images/sports/futsal-banner.jpg',
    TRUE, NOW(), NOW()
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    popularity_score = EXCLUDED.popularity_score,
    updated_at = NOW();

-- =============================================
-- 2. City Host Management System
-- =============================================

-- City hosts table for Nepal expansion strategy
CREATE TABLE IF NOT EXISTS city_hosts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    province VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    commission_rate DECIMAL(5,2) DEFAULT 0.10,
    performance_score DECIMAL(3,1) DEFAULT 0.0,
    total_games_managed INTEGER DEFAULT 0,
    total_revenue_generated DECIMAL(12,2) DEFAULT 0.00,
    monthly_bonus DECIMAL(10,2) DEFAULT 0.00,
    free_games_remaining INTEGER DEFAULT 2,
    host_level INTEGER DEFAULT 1,
    verification_documents TEXT,
    training_completed BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_city_host_user UNIQUE (user_id),
    CONSTRAINT chk_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 1),
    CONSTRAINT chk_performance_score CHECK (performance_score >= 0 AND performance_score <= 5),
    CONSTRAINT chk_host_level CHECK (host_level >= 1 AND host_level <= 5),
    CONSTRAINT chk_host_status CHECK (status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'TRAINING'))
);

-- Host activities table for tracking performance
CREATE TABLE IF NOT EXISTS host_activities (
    id BIGSERIAL PRIMARY KEY,
    city_host_id BIGINT NOT NULL REFERENCES city_hosts(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    game_id BIGINT REFERENCES game(id) ON DELETE SET NULL,
    venue_id BIGINT REFERENCES venues(id) ON DELETE SET NULL,
    revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    commission_earned DECIMAL(8,2) DEFAULT 0.00,
    players_managed INTEGER,
    rating_received DECIMAL(3,1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_activity_type CHECK (activity_type IN ('GAME_CREATED', 'GAME_MANAGED', 'VENUE_PARTNERSHIP', 'PLAYER_ACQUISITION', 'REVENUE_GENERATED', 'TRAINING_COMPLETED', 'PERFORMANCE_REVIEW'))
);

-- Host venue partnerships table
CREATE TABLE IF NOT EXISTS host_venue_partnerships (
    id BIGSERIAL PRIMARY KEY,
    city_host_id BIGINT NOT NULL REFERENCES city_hosts(id) ON DELETE CASCADE,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    commission_rate DECIMAL(5,2) DEFAULT 0.10,
    partnership_start_date TIMESTAMPTZ,
    partnership_end_date TIMESTAMPTZ,
    total_games_managed INTEGER DEFAULT 0,
    total_revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    host_commission_earned DECIMAL(8,2) DEFAULT 0.00,
    venue_rating DECIMAL(2,1),
    host_rating DECIMAL(2,1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_host_venue_partnership UNIQUE (city_host_id, venue_id),
    CONSTRAINT chk_partnership_status CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'))
);

-- =============================================
-- 3. Nepal Payment Integration Tables
-- =============================================

-- Payment providers table for multi-gateway support
CREATE TABLE IF NOT EXISTS payment_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    provider_type VARCHAR(20) NOT NULL,
    api_endpoint VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_provider_type CHECK (provider_type IN ('WALLET', 'BANK', 'CARD', 'CRYPTO', 'CASH'))
);

-- Payment transactions table for audit
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    game_id BIGINT REFERENCES game(id) ON DELETE SET NULL,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NPR',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_data JSONB,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_payment_external_id UNIQUE (external_id, provider_name),
    CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'))
);

-- =============================================
-- 4. Insert Nepal Payment Providers
-- =============================================

INSERT INTO payment_providers (name, display_name, country_code, provider_type, api_endpoint, configuration)
VALUES 
('esewa', 'eSewa', 'NPR', 'WALLET', 'https://esewa.com.np/epay/main', '{"merchant_id": "", "success_url": "/payment/success", "failure_url": "/payment/failure"}'),
('khalti', 'Khalti', 'NPR', 'WALLET', 'https://khalti.com/api/v2', '{"public_key": "", "secret_key": "", "return_url": "/payment/return"}'),
('ime_pay', 'IME Pay', 'NPR', 'WALLET', 'https://www.imepay.com.np', '{"merchant_code": "", "callback_url": "/payment/callback"}'),
('nic_asia_bank', 'NIC Asia Bank', 'NPR', 'BANK', 'https://ebanking.nicasiabank.com', '{"merchant_id": "", "secure_key": ""}'),
('nabil_bank', 'Nabil Bank', 'NPR', 'BANK', 'https://www.nabilbank.com', '{"api_key": "", "secret": ""}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    api_endpoint = EXCLUDED.api_endpoint,
    updated_at = NOW();

-- =============================================
-- 5. Nepal Areas and Locations
-- =============================================

-- Nepal areas table for location-based services
CREATE TABLE IF NOT EXISTS nepal_areas (
    id BIGSERIAL PRIMARY KEY,
    area_code VARCHAR(20) NOT NULL UNIQUE,
    english_name VARCHAR(100) NOT NULL,
    nepali_name VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    area_type VARCHAR(20) NOT NULL DEFAULT 'CITY',
    population INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_area_type CHECK (area_type IN ('CITY', 'SUBURB', 'TOWN', 'VILLAGE', 'DISTRICT_HQ'))
);

-- Insert popular Kathmandu Valley areas
INSERT INTO nepal_areas (area_code, english_name, nepali_name, district, province, latitude, longitude, area_type, population, description)
VALUES 
-- Kathmandu District
('KTM_BANESHWOR', 'Baneshwor', 'बनेश्वर', 'Kathmandu', 'Bagmati', 27.7172, 85.3240, 'CITY', 50000, 'Popular area for futsal and sports activities'),
('KTM_KOTESHWOR', 'Koteshwor', 'कोटेश्वर', 'Kathmandu', 'Bagmati', 27.6783, 85.3555, 'CITY', 45000, 'Young professional area with many sports facilities'),
('KTM_THAPATHALI', 'Thapathali', 'थापाथली', 'Kathmandu', 'Bagmati', 27.6894, 85.3206, 'CITY', 35000, 'Central location with good sports infrastructure'),
('KTM_KUPONDOLE', 'Kupondole', 'कुपण्डोल', 'Kathmandu', 'Bagmati', 27.6783, 85.3100, 'CITY', 30000, 'Affluent area with premium sports facilities'),
('KTM_PULCHOWK', 'Pulchowk', 'पुल्चोक', 'Lalitpur', 'Bagmati', 27.6792, 85.3206, 'CITY', 25000, 'University area with active sports community'),
('KTM_SATDOBATO', 'Satdobato', 'सातदोबाटो', 'Lalitpur', 'Bagmati', 27.6656, 85.3350, 'SUBURB', 20000, 'Growing suburb with new sports venues'),

-- Major Cities Outside Valley
('PKR_LAKESIDE', 'Lakeside', 'लेकसाइड', 'Kaski', 'Gandaki', 28.2096, 83.9598, 'CITY', 15000, 'Tourist area in Pokhara with sports facilities'),
('BTR_MAIN', 'Biratnagar', 'विराटनगर', 'Morang', 'Province 1', 26.4525, 87.2718, 'CITY', 200000, 'Eastern Nepal commercial center'),
('NTL_BIRGUNJ', 'Birgunj', 'वीरगन्ज', 'Parsa', 'Madhesh', 27.0173, 84.8804, 'CITY', 130000, 'Border city with growing sports scene'),
('WTN_NEPALGUNJ', 'Nepalgunj', 'नेपालगन्ज', 'Banke', 'Lumbini', 28.0505, 81.6105, 'CITY', 100000, 'Western Nepal regional center')
ON CONFLICT (area_code) DO UPDATE SET
    english_name = EXCLUDED.english_name,
    nepali_name = EXCLUDED.nepali_name,
    population = EXCLUDED.population;

-- =============================================
-- 6. Create Indexes for Performance
-- =============================================

-- City hosts indexes
CREATE INDEX IF NOT EXISTS idx_city_hosts_user_id ON city_hosts(user_id);
CREATE INDEX IF NOT EXISTS idx_city_hosts_city ON city_hosts(city);
CREATE INDEX IF NOT EXISTS idx_city_hosts_status ON city_hosts(status);
CREATE INDEX IF NOT EXISTS idx_city_hosts_level ON city_hosts(host_level);
CREATE INDEX IF NOT EXISTS idx_city_hosts_created_at ON city_hosts(created_at);

-- Host activities indexes
CREATE INDEX IF NOT EXISTS idx_host_activities_host ON host_activities(city_host_id);
CREATE INDEX IF NOT EXISTS idx_host_activities_type ON host_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_host_activities_created_at ON host_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_host_activities_game ON host_activities(game_id);

-- Host venue partnerships indexes
CREATE INDEX IF NOT EXISTS idx_host_venue_partnerships_host ON host_venue_partnerships(city_host_id);
CREATE INDEX IF NOT EXISTS idx_host_venue_partnerships_venue ON host_venue_partnerships(venue_id);
CREATE INDEX IF NOT EXISTS idx_host_venue_partnerships_status ON host_venue_partnerships(status);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_id ON payment_transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_game_id ON payment_transactions(game_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Nepal areas indexes
CREATE INDEX IF NOT EXISTS idx_nepal_areas_district ON nepal_areas(district);
CREATE INDEX IF NOT EXISTS idx_nepal_areas_province ON nepal_areas(province);
CREATE INDEX IF NOT EXISTS idx_nepal_areas_type ON nepal_areas(area_type);
CREATE INDEX IF NOT EXISTS idx_nepal_areas_location ON nepal_areas(latitude, longitude);

-- =============================================
-- 7. Sample Nepal Data
-- =============================================

-- Insert sample futsal games in Kathmandu (if users exist)
INSERT INTO game (
    sport, location, time, skill_level, latitude, longitude, user_id, status, game_type, 
    description, min_players, max_players, capacity, price_per_player, total_cost, 
    duration_minutes, rules, equipment_required, created_at, updated_at
)
SELECT 
    'futsal', 
    'Baneshwor Futsal Center', 
    (CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours')::timestamptz,
    'Intermediate',
    27.7172, 
    85.3240,
    u.id,
    'PUBLISHED',
    'PICKUP',
    'Evening futsal session at Baneshwor. Join us for a competitive 5v5 match. Great way to stay fit and meet new players!',
    10,
    10,
    10,
    300.00,
    3000.00,
    120,
    'FIFA Futsal rules. 20-minute halves with running clock. Unlimited substitutions allowed.',
    'Indoor soccer shoes required. Shin guards recommended. Ball and bibs provided.'
FROM (SELECT id FROM app_user LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM app_user)
ON CONFLICT DO NOTHING;

INSERT INTO game (
    sport, location, time, skill_level, latitude, longitude, user_id, status, game_type, 
    description, min_players, max_players, capacity, price_per_player, total_cost, 
    duration_minutes, rules, equipment_required, created_at, updated_at
)
SELECT 
    'futsal', 
    'Koteshwor Sports Complex', 
    (CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '7 hours')::timestamptz,
    'Beginner',
    27.6783, 
    85.3555,
    u.id,
    'PUBLISHED',
    'PICKUP',
    'Morning futsal for beginners in Koteshwor. Perfect for those new to the sport. Coaching tips included!',
    8,
    12,
    12,
    250.00,
    2500.00,
    90,
    'Modified futsal rules for beginners. Focus on fun and learning. No aggressive play.',
    'Any sports shoes acceptable. All equipment provided including training cones.'
FROM (SELECT id FROM app_user LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM app_user)
ON CONFLICT DO NOTHING;

-- =============================================
-- 8. Functions and Triggers
-- =============================================

-- Function to update city_hosts updated_at
CREATE OR REPLACE FUNCTION update_city_hosts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for city_hosts
DROP TRIGGER IF EXISTS trigger_update_city_hosts_updated_at ON city_hosts;
CREATE TRIGGER trigger_update_city_hosts_updated_at
    BEFORE UPDATE ON city_hosts
    FOR EACH ROW
    EXECUTE FUNCTION update_city_hosts_updated_at();

-- Function to update host_venue_partnerships updated_at
CREATE OR REPLACE FUNCTION update_host_venue_partnerships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for host_venue_partnerships
DROP TRIGGER IF EXISTS trigger_update_host_venue_partnerships_updated_at ON host_venue_partnerships;
CREATE TRIGGER trigger_update_host_venue_partnerships_updated_at
    BEFORE UPDATE ON host_venue_partnerships
    FOR EACH ROW
    EXECUTE FUNCTION update_host_venue_partnerships_updated_at();

-- =============================================
-- 9. Comments and Documentation
-- =============================================

COMMENT ON TABLE city_hosts IS 'City Champions (Hosts) who manage local sports activities in different cities across Nepal';
COMMENT ON TABLE host_activities IS 'Activity log for tracking host performance and calculating commissions';
COMMENT ON TABLE host_venue_partnerships IS 'Partnerships between City Champions and venue owners for revenue sharing';
COMMENT ON TABLE payment_providers IS 'Payment gateway providers for different countries (focusing on Nepal)';
COMMENT ON TABLE payment_transactions IS 'Transaction audit log for all payment activities';
COMMENT ON TABLE nepal_areas IS 'Geographic areas in Nepal with local names and coordinates';

COMMENT ON COLUMN city_hosts.host_level IS 'Host level: 1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Diamond';
COMMENT ON COLUMN city_hosts.commission_rate IS 'Commission rate as decimal (0.10 = 10%)';
COMMENT ON COLUMN city_hosts.free_games_remaining IS 'Number of free games the host can play';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Nepal Phase 1 features migration completed successfully!';
    RAISE NOTICE 'Added: Futsal sport, City Host system, Payment providers, Nepal areas';
END $$;