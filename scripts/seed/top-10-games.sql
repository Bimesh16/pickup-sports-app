-- Top 10 Sample Games for Pickup Sports App
-- This script creates diverse, realistic sample games across different sports and formats
-- Run this after setting up initial users and venues

-- Ensure we have some sample venues (these should already exist from your venue setup)
-- If not, uncomment and modify the INSERT statements below:

/*
INSERT INTO venues (name, address, city, state, latitude, longitude, hourly_rate, capacity, sport_types, amenities, created_at, updated_at) VALUES
('Central Park Soccer Fields', '1 Central Park South', 'New York', 'NY', 40.7829, -73.9654, 50.00, 30, '["Soccer", "Football"]', '["Goals", "Changing Rooms", "Parking"]', NOW(), NOW()),
('Downtown Basketball Courts', '123 Main St', 'Los Angeles', 'CA', 34.0522, -118.2437, 35.00, 20, '["Basketball"]', '["Indoor Court", "Scoreboard", "Lockers"]', NOW(), NOW()),
('Riverside Sports Complex', '456 River Rd', 'Chicago', 'IL', 41.8781, -87.6298, 45.00, 40, '["Soccer", "Basketball", "Volleyball"]', '["Multiple Fields", "Parking", "Concessions"]', NOW(), NOW());
*/

-- Sample Game Templates (insert if not exists)
INSERT INTO game_templates (name, sport, format, players_per_team, total_teams, min_players, max_players, substitute_slots, duration_minutes, default_rules, required_equipment, skill_balancing_required, captain_assignment_required, is_active, created_at, updated_at) VALUES
('5v5 Soccer', 'Soccer', '5v5', 5, 2, 8, 12, 2, 90, 'No slide tackling, fair play encouraged', 'Cleats, shin guards, water bottle', true, true, true, NOW(), NOW()),
('7v7 Soccer', 'Soccer', '7v7', 7, 2, 12, 16, 2, 90, 'Standard FIFA rules apply, friendly competition', 'Cleats, shin guards, appropriate attire', true, true, true, NOW(), NOW()),
('3v3 Basketball', 'Basketball', '3v3', 3, 2, 4, 8, 2, 60, 'Half court, winner stays on', 'Basketball shoes, water bottle', true, false, true, NOW(), NOW()),
('5v5 Basketball', 'Basketball', '5v5', 5, 2, 8, 12, 2, 80, 'Full court, standard NBA rules', 'Basketball shoes, athletic wear', true, true, true, NOW(), NOW()),
('4v4 Volleyball', 'Volleyball', '4v4', 4, 2, 6, 10, 2, 75, 'Beach volleyball rules, rally scoring', 'Appropriate footwear, sunscreen', false, false, true, NOW(), NOW()),
('Tennis Doubles', 'Tennis', 'Doubles', 2, 2, 4, 4, 0, 120, 'Standard tennis rules, best of 3 sets', 'Tennis racket, tennis shoes, balls provided', false, false, true, NOW(), NOW());

-- Top 10 Sample Games
-- Note: These use existing user_id=1 as creator (adjust based on your user setup)
-- Times are set for upcoming dates - adjust as needed

-- Game 1: 5v5 Soccer - Central Park (Popular evening slot)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT 
    'Soccer', 
    'Central Park Soccer Fields', 
    (CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '18 hours')::timestamptz,  -- 3 days from now at 6 PM
    'Intermediate',
    40.7829, 
    -73.9654,
    u.id,
    v.id,
    'PUBLISHED',
    'PICKUP',
    '5v5 pickup soccer game at Central Park. All skill levels welcome! Even teams guaranteed.',
    8,
    12,
    15.00,
    180.00,
    90,
    (CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '16 hours')::timestamptz,  -- 2 hours before game
    12,
    true,
    false,
    false,
    true,
    '24 hours notice for cancellation required',
    'No slide tackling, friendly competition, fair play expected',
    'Goals, corner flags, first aid kit',
    'Cleats, shin guards, water bottle, athletic wear'
FROM (SELECT id FROM app_user LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Central Park%' OR name LIKE '%Soccer%' LIMIT 1) v;

-- Game 2: 7v7 Soccer - Riverside Complex (Weekend morning)  
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Soccer',
    'Riverside Sports Complex',
    (CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '10 hours')::timestamptz,  -- 5 days from now at 10 AM  
    'Advanced',
    41.8781,
    -87.6298, 
    u.id,
    v.id,
    'PUBLISHED',
    'COMPETITIVE',
    'Competitive 7v7 soccer match. Advanced players only. Well-organized teams with captains.',
    12,
    16,
    12.00,
    192.00,
    90,
    (CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '8 hours')::timestamptz,
    16,
    true,
    false,
    true,  -- Requires approval for skill verification
    true,
    '48 hours notice required, weather cancellation possible',
    'FIFA rules, competitive play, respect for officials',
    'Goals, nets, corner flags, basic first aid',
    'Cleats, shin guards, team pinnies provided'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 1 LIMIT 1) u  -- Different user
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Riverside%' OR name LIKE '%Complex%' LIMIT 1) v;

-- Game 3: 3v3 Basketball - Downtown Courts (Lunch break game)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Basketball',
    'Downtown Basketball Courts', 
    (CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '12 hours')::timestamptz,  -- 2 days from now at noon
    'Intermediate',
    34.0522,
    -118.2437,
    u.id,
    v.id,
    'PUBLISHED',
    'PICKUP', 
    'Quick lunchtime 3v3 basketball. Perfect for office workers. Games to 21 points.',
    4,
    8,
    8.00,
    64.00,
    60,
    (CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '11 hours')::timestamptz,
    8,
    true,
    false,
    false,
    false,  -- Indoor court
    'Same day cancellation allowed',
    'Half court, winners stay on, call your own fouls',
    'Basketball, scoreboard access',
    'Basketball shoes, athletic wear'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 2 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE sport_types LIKE '%Basketball%' LIMIT 1) v;

-- Game 4: 5v5 Basketball - Evening Competitive
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Basketball',
    'Sports Arena Downtown',
    (CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '19 hours')::timestamptz,  -- 4 days from now at 7 PM
    'Advanced',
    34.0522,
    -118.2437,
    u.id,
    v.id,
    'PUBLISHED',
    'COMPETITIVE',
    'Competitive 5v5 basketball league game. Advanced players seeking serious competition.',
    8,
    12,
    10.00,
    120.00,
    80,
    (CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '17 hours')::timestamptz,
    12,
    true,
    false,
    true,
    false,
    '24 hours notice required',
    'Full court, referees provided, FIBA rules',
    'Basketball, referee, scoreboard, first aid',
    'Basketball shoes, team jersey (provided), water'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 3 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE sport_types LIKE '%Basketball%' LIMIT 1) v;

-- Game 5: Beach Volleyball 4v4 (Weekend social)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Volleyball',
    'Santa Monica Beach Courts',
    (CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '15 hours')::timestamptz,  -- 6 days from now at 3 PM
    'Beginner',
    34.0195,
    -118.4912,
    u.id,
    v.id,
    'PUBLISHED',
    'SOCIAL',
    'Fun beach volleyball session! Beginners welcome. Great way to meet new people and enjoy the beach.',
    6,
    10,
    20.00,
    200.00,
    75,
    (CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '13 hours')::timestamptz,
    10,
    true,
    false,
    false,
    true,  -- Weather dependent (beach)
    '2 hours notice for weather cancellation',
    'Rally scoring, recreational play, rotate teams every game',
    'Volleyball, net setup, court maintenance',
    'Sunscreen, water, athletic wear, optional knee pads'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 4 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Beach%' OR sport_types LIKE '%Volleyball%' LIMIT 1) v;

-- Game 6: Tennis Doubles Tournament
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Tennis', 
    'City Tennis Club',
    (CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '9 hours')::timestamptz,   -- 7 days from now at 9 AM
    'Intermediate',
    40.7505,
    -73.9934,
    u.id,
    v.id,
    'PUBLISHED',
    'TOURNAMENT',
    'Singles elimination tennis doubles tournament. Intermediate level players. Trophies for winners!',
    8,
    16,
    25.00,
    400.00,
    180,  -- 3 hours for tournament
    (CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '18 hours')::timestamptz,
    16,
    false,  -- No waitlist for tournament
    false,
    true,   -- Tournament requires approval
    true,
    '48 hours notice, no refunds 24 hours before start',
    'Standard tennis rules, best 2 of 3 sets, tie-break at 6-6',
    'Tennis balls, court booking, trophy ceremony',
    'Tennis racket, tennis shoes, athletic wear'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 5 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Tennis%' OR sport_types LIKE '%Tennis%' LIMIT 1) v;

-- Game 7: Flag Football 7v7 (Weekend afternoon)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Football',
    'University Recreation Field',
    (CURRENT_TIMESTAMP + INTERVAL '8 days' + INTERVAL '14 hours')::timestamptz,  -- 8 days from now at 2 PM
    'Beginner', 
    40.7282,
    -73.9942,
    u.id,
    v.id,
    'PUBLISHED',
    'PICKUP',
    '7v7 flag football game. No contact, all skill levels welcome. Great cardio workout and team fun!',
    10,
    16,
    15.00,
    240.00,
    75,
    (CURRENT_TIMESTAMP + INTERVAL '8 days' + INTERVAL '12 hours')::timestamptz,
    16,
    true,
    false,
    false,
    true,   -- Weather dependent
    '3 hours notice for weather cancellation',
    'Flag football rules, no contact, 4 downs to advance, 6 points per TD',
    'Flags, football, cones, first aid kit',
    'Athletic shoes (no cleats), comfortable clothing'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 6 LIMIT 1) u  
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Field%' OR name LIKE '%Recreation%' LIMIT 1) v;

-- Game 8: Indoor Volleyball 6v6 (Weeknight league)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Volleyball',
    'Community Center Gym',
    (CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '19 hours 30 minutes')::timestamptz,  -- Tomorrow at 7:30 PM  
    'Intermediate',
    41.8819,
    -87.6278,
    u.id,
    v.id,
    'PUBLISHED', 
    'LEAGUE',
    'Weekly volleyball league game. Consistent players preferred for team chemistry. Indoor court with great lighting.',
    10,
    14,
    18.00,
    252.00,
    90,
    (CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '16 hours')::timestamptz,
    14,
    true,
    false,
    false,
    false,  -- Indoor
    '24 hours notice required',
    '6v6 indoor volleyball, rally scoring to 25 points',
    'Volleyball, net setup, gym access',
    'Indoor athletic shoes, knee pads recommended'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 7 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Gym%' OR name LIKE '%Community%' LIMIT 1) v;

-- Game 9: Ultimate Frisbee 7v7 (College campus)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)
SELECT
    'Ultimate Frisbee',
    'College Campus Field',
    (CURRENT_TIMESTAMP + INTERVAL '9 days' + INTERVAL '16 hours')::timestamptz,  -- 9 days from now at 4 PM
    'Beginner',
    42.3601,
    -71.0589,
    u.id,
    v.id,
    'PUBLISHED',
    'SOCIAL',
    'Beginner-friendly Ultimate Frisbee! Learn the sport in a welcoming environment. Spirit of the game emphasized.',
    10,
    16,
    5.00,
    80.00,
    105,  -- 1 hour 45 minutes
    (CURRENT_TIMESTAMP + INTERVAL '9 days' + INTERVAL '14 hours')::timestamptz,
    16,
    true,
    false,
    false,
    true,
    '4 hours notice for cancellation', 
    'Spirit of the game, self-officiating, inclusive play',
    'Discs, cones for end zones, basic instruction',
    'Cleats or athletic shoes, comfortable clothing'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 8 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Campus%' OR name LIKE '%Field%' LIMIT 1) v;

-- Game 10: Badminton Doubles (Indoor evening)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, rsvp_cutoff, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, cancellation_policy, rules, equipment_provided, equipment_required, created_at, updated_at)  
SELECT
    'Badminton',
    'Sports Center Indoor Courts',
    (CURRENT_TIMESTAMP + INTERVAL '10 days' + INTERVAL '20 hours')::timestamptz,  -- 10 days from now at 8 PM
    'Beginner',
    37.7749,
    -122.4194,
    u.id,
    v.id,
    'PUBLISHED',
    'SOCIAL', 
    'Friendly badminton doubles session. Great for beginners and casual players. Multiple courts available.',
    6,
    12,
    22.00,
    264.00,
    120,  -- 2 hours
    (CURRENT_TIMESTAMP + INTERVAL '10 days' + INTERVAL '18 hours')::timestamptz,
    12,
    true,
    false,
    false,
    false,  -- Indoor
    '12 hours notice required',
    'Standard badminton rules, rotate partners every 2 games',
    'Rackets available for rent, shuttlecocks, court booking',
    'Indoor court shoes, comfortable athletic wear'
FROM (SELECT id FROM app_user ORDER BY id OFFSET 9 LIMIT 1) u
CROSS JOIN (SELECT id FROM venues WHERE name LIKE '%Sports Center%' OR sport_types LIKE '%Badminton%' LIMIT 1) v;

-- Additional games can be uncommented and customized:

/*
-- Game 11: Baseball 9v9 (Weekend league)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, created_at, updated_at)
VALUES ('Baseball', 'Diamond Field Park', (CURRENT_TIMESTAMP + INTERVAL '12 days' + INTERVAL '11 hours')::timestamptz, 'Intermediate', 40.7282, -73.9942, 1, 1, 'PUBLISHED', 'LEAGUE', 'Weekend baseball league game. Looking for committed players for the season.', 14, 20, 25.00, 500.00, 150, 20, true, false, true, true, NOW(), NOW());

-- Game 12: Hockey 6v6 (Ice rink)  
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, venue_id, status, game_type, description, min_players, max_players, price_per_player, total_cost, duration_minutes, capacity, waitlist_enabled, is_private, requires_approval, weather_dependent, created_at, updated_at)
VALUES ('Hockey', 'City Ice Rink', (CURRENT_TIMESTAMP + INTERVAL '11 days' + INTERVAL '21 hours')::timestamptz, 'Advanced', 42.3601, -71.0589, 1, 1, 'PUBLISHED', 'PICKUP', 'Late night hockey pickup game. Bring your gear and competitive spirit!', 10, 14, 30.00, 420.00, 90, 14, true, false, false, false, NOW(), NOW());
*/

-- Update game statistics and populate some initial participants
-- This simulates some games having partial registration

DO $$ 
DECLARE
    game_record RECORD;
    user_record RECORD;  
    participant_count INTEGER;
BEGIN
    -- Add some participants to games to make them look active
    FOR game_record IN SELECT id, min_players, max_players FROM game WHERE status = 'PUBLISHED' LOOP
        -- Add random number of participants (50-80% of capacity)
        participant_count := FLOOR(game_record.min_players + (game_record.max_players - game_record.min_players) * 0.6);
        
        -- Add participants (randomly select from available users)
        FOR user_record IN 
            SELECT id FROM app_user 
            WHERE id NOT IN (
                SELECT user_id FROM game_participants WHERE game_id = game_record.id
            ) 
            ORDER BY RANDOM() 
            LIMIT participant_count
        LOOP
            INSERT INTO game_participants (game_id, user_id) VALUES (game_record.id, user_record.id);
        END LOOP;
        
        -- Update game status based on current participants
        UPDATE game SET 
            status = CASE 
                WHEN (SELECT COUNT(*) FROM game_participants WHERE game_id = game_record.id) >= game_record.max_players 
                THEN 'FULL'::game_status
                ELSE 'PUBLISHED'::game_status
            END
        WHERE id = game_record.id;
    END LOOP;
END $$;

-- Verify the data
SELECT 
    g.id,
    g.sport,
    g.location, 
    TO_CHAR(g.time, 'YYYY-MM-DD HH24:MI') as game_time,
    g.skill_level,
    g.status,
    g.price_per_player,
    COUNT(gp.user_id) as current_participants,
    g.max_players as max_capacity
FROM game g
LEFT JOIN game_participants gp ON g.id = gp.game_id  
WHERE g.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'  -- Recently created games
GROUP BY g.id, g.sport, g.location, g.time, g.skill_level, g.status, g.price_per_player, g.max_players
ORDER BY g.time;

COMMIT;