-- Conditionally enable PostGIS and set up geometry only when PostGIS is installed.
DO $$
DECLARE
  ext_available boolean;
BEGIN
  SELECT EXISTS(
      SELECT 1
      FROM pg_available_extensions
      WHERE name = 'postgis'
  ) INTO ext_available;

  IF ext_available THEN
    -- Enable PostGIS (requires privileges)
    BEGIN
      EXECUTE 'CREATE EXTENSION IF NOT EXISTS postgis';
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if we cannot create extension (e.g., insufficient privileges)
      RAISE NOTICE 'PostGIS extension not created: %', SQLERRM;
    END;

    -- Add geography(Point,4326) column and index
    BEGIN
      EXECUTE 'ALTER TABLE game ADD COLUMN IF NOT EXISTS geom geography(Point,4326)';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add geom column: %', SQLERRM;
    END;

    -- Backfill from longitude/latitude if present
    BEGIN
      EXECUTE $sql$
        UPDATE game
           SET geom = ST_SetSRID(ST_MakePoint(COALESCE(longitude, 0), COALESCE(latitude, 0)), 4326)::geography
         WHERE latitude IS NOT NULL AND longitude IS NOT NULL
           AND geom IS NULL
      $sql$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Backfill skipped: %', SQLERRM;
    END;

    -- Spatial index
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_game_geom ON game USING GIST (geom)';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Index creation skipped: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'PostGIS not available on this system; skipping geometry setup.';
  END IF;
END $$;
