-- Composite index to accelerate bounding-box filtering on latitude/longitude
CREATE INDEX IF NOT EXISTS idx_game_lat_lng ON game (latitude, longitude);

-- Ensure PostGIS geom index exists if geom column present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'game' AND column_name = 'geom'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_game_geom ON game USING GIST (geom)';
  END IF;
END $$;
