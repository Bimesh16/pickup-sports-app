INSERT INTO game (id, sport, location, time, skill_level, user_id, created_at, updated_at)
VALUES
  (200, 'soccer', 'Central Park Field', NOW() + INTERVAL '1 day', 'INTERMEDIATE', 100, NOW(), NOW()),
  (201, 'basketball', 'Downtown Gym Court', NOW() + INTERVAL '3 day', 'BEGINNER', 101, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
