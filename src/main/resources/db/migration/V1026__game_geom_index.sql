-- Ensure spatial index on geom for efficient radius queries
-- Only create if the 'geom' column exists (e.g., when PostGIS is available and V1005 added it)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game'
      AND column_name = 'geom'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_game_geom ON game USING GIST (geom)';
  ELSE
    RAISE NOTICE 'Skipping idx_game_geom creation: column "geom" does not exist';
  END IF;
END $$;
