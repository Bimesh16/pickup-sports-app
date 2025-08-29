-- Top 10 diverse games seed data for testing
-- Includes various sports, cities, team formats, and pricing

-- First, ensure we have game templates for different formats
INSERT INTO game_templates (name, sport, format, players_per_team, total_teams, min_players, max_players, 
    substitute_slots, duration_minutes, default_rules, required_equipment, skill_balancing_required, 
    captain_assignment_required, is_active, popularity, created_by, created_at, updated_at)
VALUES
    ('5v5 Soccer', 'Soccer', '5v5', 5, 2, 8, 12, 2, 90, 'Standard FIFA rules, no slide tackles', 'Soccer ball, shin guards', true, true, true, 15, 'system', NOW(), NOW()),
    ('7v7 Football', 'Football', '7v7', 7, 2, 12, 16, 2, 60, 'Flag football rules, no contact', 'Flag belts, football', true, true, true, 8, 'system', NOW(), NOW()),
    ('Full Court Basketball', 'Basketball', '5v5', 5, 2, 8, 12, 2, 48, 'Standard NBA rules', 'Basketball', true, true, false, 12, 'system', NOW(), NOW()),
    ('3v3 Basketball', 'Basketball', '3v3', 3, 2, 4, 8, 2, 20, 'Half court, make it take it', 'Basketball', false, false, false, 20, 'system', NOW(), NOW()),
    ('Beach Volleyball', 'Volleyball', '2v2', 2, 2, 3, 6, 1, 30, 'Beach volleyball rules', 'Volleyball, net', false, false, false, 5, 'system', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now create the top 10 games using these templates
INSERT INTO game (id, sport, location, time, skill_level, user_id, created_at, updated_at, 
    latitude, longitude, min_players, max_players, price_per_player, total_cost, duration_minutes, 
    status, game_type, description, venue_id, game_template_id)
VALUES
    -- Soccer Games
    (300, 'Soccer', 'Central Park, New York, NY', NOW() + INTERVAL '2 hours', 'INTERMEDIATE', 100, NOW(), NOW(), 
     40.7829, -73.9654, 8, 12, 15.00, 180.00, 90, 'PUBLISHED', 'PICKUP', 
     '5v5 soccer game in iconic Central Park. Great for intermediate players looking for competitive play.', 
     1, 1),
    
    (301, 'Soccer', 'Griffith Park, Los Angeles, CA', NOW() + INTERVAL '1 day', 'BEGINNER', 101, NOW(), NOW(), 
     34.1361, -118.2943, 8, 12, 12.00, 144.00, 90, 'PUBLISHED', 'PICKUP', 
     'Beginner-friendly 5v5 soccer. Perfect for learning and making new friends!', 
     2, 1),

    (302, 'Soccer', 'Discovery Green, Houston, TX', NOW() + INTERVAL '3 days', 'ADVANCED', 102, NOW(), NOW(), 
     29.7506, -95.3578, 8, 12, 20.00, 240.00, 90, 'PUBLISHED', 'PICKUP', 
     'Advanced 5v5 soccer game for experienced players. High-intensity competitive match.', 
     3, 1),

    -- Basketball Games  
    (303, 'Basketball', 'Millennium Park Court, Chicago, IL', NOW() + INTERVAL '6 hours', 'INTERMEDIATE', 103, NOW(), NOW(), 
     41.8826, -87.6226, 8, 12, 10.00, 120.00, 48, 'PUBLISHED', 'PICKUP', 
     'Full court 5v5 basketball in downtown Chicago. Indoor court, climate controlled.', 
     4, 3),

    (304, 'Basketball', 'Venice Beach Courts, Los Angeles, CA', NOW() + INTERVAL '2 days', 'ADVANCED', 104, NOW(), NOW(), 
     33.9850, -118.4695, 4, 8, 8.00, 64.00, 20, 'PUBLISHED', 'PICKUP', 
     '3v3 streetball at the famous Venice Beach courts. Bring your A-game!', 
     5, 4),

    -- Football Games
    (305, 'Football', 'Gas Works Park, Seattle, WA', NOW() + INTERVAL '1 day 2 hours', 'INTERMEDIATE', 105, NOW(), NOW(), 
     47.6456, -122.3344, 12, 16, 18.00, 288.00, 60, 'PUBLISHED', 'PICKUP', 
     '7v7 flag football with beautiful city skyline views. Mixed skill levels welcome.', 
     6, 2),

    (306, 'Football', 'Zilker Park, Austin, TX', NOW() + INTERVAL '4 days', 'BEGINNER', 106, NOW(), NOW(), 
     30.2640, -97.7735, 12, 16, 15.00, 240.00, 60, 'PUBLISHED', 'PICKUP', 
     'Casual 7v7 flag football in Austin\'s favorite park. Great for beginners and casual players.', 
     7, 2),

    -- Volleyball Games
    (307, 'Volleyball', 'Hermosa Beach, Los Angeles, CA', NOW() + INTERVAL '5 hours', 'INTERMEDIATE', 107, NOW(), NOW(), 
     33.8617, -118.3998, 3, 6, 12.00, 72.00, 30, 'PUBLISHED', 'PICKUP', 
     'Beach volleyball 2v2 tournament style. Sand court right on the beach!', 
     8, 5),

    -- Mixed Sports
    (308, 'Soccer', 'Piedmont Park, Atlanta, GA', NOW() + INTERVAL '1 day 8 hours', 'INTERMEDIATE', 108, NOW(), NOW(), 
     33.7890, -84.3733, 8, 12, 14.00, 168.00, 90, 'PUBLISHED', 'PICKUP', 
     '5v5 soccer in Atlanta\'s premier park. Well-maintained field with parking available.', 
     9, 1),

    (309, 'Basketball', 'Mission Dolores Park, San Francisco, CA', NOW() + INTERVAL '2 days 4 hours', 'BEGINNER', 109, NOW(), NOW(), 
     37.7596, -122.4269, 4, 8, 6.00, 48.00, 20, 'PUBLISHED', 'PICKUP', 
     '3v3 basketball for beginners. Outdoor court with Golden Gate views. Very welcoming community!', 
     10, 4)

ON CONFLICT (id) DO NOTHING;

-- Add some team assignments for games that are closer to full capacity
INSERT INTO teams (game_id, team_name, team_color, team_number, formation_strategy, status, formed_at)
VALUES
    -- Teams for Central Park Soccer Game (300)
    (300, 'Red Team', '#FF4444', 1, 'SKILL_BALANCED', 'FORMING', NOW()),
    (300, 'Blue Team', '#4444FF', 2, 'SKILL_BALANCED', 'FORMING', NOW()),
    
    -- Teams for Chicago Basketball Game (303)
    (303, 'Team Alpha', '#FF6B35', 1, 'RANDOM', 'FORMING', NOW()),
    (303, 'Team Beta', '#004E89', 2, 'RANDOM', 'FORMING', NOW()),
    
    -- Teams for Seattle Football Game (305)
    (305, 'Hawks', '#69BE28', 1, 'SKILL_BALANCED', 'FORMING', NOW()),
    (305, 'Eagles', '#FFB700', 2, 'SKILL_BALANCED', 'FORMING', NOW())
ON CONFLICT DO NOTHING;

-- Add some sample team members to show participation
INSERT INTO team_members (team_id, user_id, member_type, preferred_position, is_substitute, 
    amount_owed, amount_paid, payment_status, joined_at)
VALUES
    -- Central Park Soccer - Red Team
    (1, 100, 'CAPTAIN', 'MID', false, 15.00, 15.00, 'PAID', NOW() - INTERVAL '2 hours'),
    (1, 101, 'ACTIVE', 'DEF', false, 15.00, 15.00, 'PAID', NOW() - INTERVAL '1 hour'),
    (1, 102, 'ACTIVE', 'FWD', false, 15.00, 0.00, 'PENDING', NOW() - INTERVAL '30 minutes'),
    
    -- Central Park Soccer - Blue Team  
    (2, 103, 'CAPTAIN', 'GK', false, 15.00, 15.00, 'PAID', NOW() - INTERVAL '90 minutes'),
    (2, 104, 'ACTIVE', 'DEF', false, 15.00, 15.00, 'PAID', NOW() - INTERVAL '45 minutes'),
    (2, 105, 'SUBSTITUTE', 'MID', true, 15.00, 15.00, 'PAID', NOW() - INTERVAL '15 minutes')
ON CONFLICT DO NOTHING;