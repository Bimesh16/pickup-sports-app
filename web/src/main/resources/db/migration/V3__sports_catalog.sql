-- V3: Sports catalog to support multi-sport experiences

-- Create table if not exists (idempotent pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sport'
  ) THEN
    EXECUTE '
      CREATE TABLE sport (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    ';
  END IF;
END $$;

-- Seed popular sports (case-insensitive upsert)
INSERT INTO sport (name, display_name)
SELECT s.name, s.display_name
FROM (VALUES
  ('soccer',       'Soccer'),
  ('basketball',   'Basketball'),
  ('tennis',       'Tennis'),
  ('volleyball',   'Volleyball'),
  ('baseball',     'Baseball'),
  ('football',     'American Football'),
  ('pickleball',   'Pickleball'),
  ('badminton',    'Badminton'),
  ('cricket',      'Cricket'),
  ('hockey',       'Hockey'),
  ('rugby',        'Rugby'),
  ('table_tennis', 'Table Tennis'),
  ('ultimate',     'Ultimate Frisbee')
) AS s(name, display_name)
ON CONFLICT (name) DO NOTHING;
