-- V1034: Guard geom trigger/function based on presence of game.geom column
-- Goal: prevent runtime errors when PostGIS/geom is not available

DO $$
BEGIN
  -- Check if the 'geom' column exists on public.game
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game'
      AND column_name = 'geom'
  ) THEN
    -- No geom column: drop the trigger if present and drop the function to avoid invalid references
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_game_geom_sync') THEN
      EXECUTE 'DROP TRIGGER trg_game_geom_sync ON public.game';
    END IF;

    -- Drop function if it exists (signature without arguments)
    IF EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'game_geom_sync'
        AND p.pronargs = 0
    ) THEN
      EXECUTE 'DROP FUNCTION public.game_geom_sync()';
    END IF;

    RAISE NOTICE 'geom column not found on game; geom trigger/function removed if existed.';
  ELSE
    -- geom column exists: (re)create function and trigger safely
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.game_geom_sync()
      RETURNS trigger AS $f$
      BEGIN
          IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
              NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
          ELSE
              NEW.geom := NULL;
          END IF;
          RETURN NEW;
      END;
      $f$ LANGUAGE plpgsql;
    $sql$;

    -- Recreate trigger to ensure it points to the current function
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_game_geom_sync') THEN
      EXECUTE 'DROP TRIGGER trg_game_geom_sync ON public.game';
    END IF;

    EXECUTE 'CREATE TRIGGER trg_game_geom_sync
             BEFORE INSERT OR UPDATE OF latitude, longitude ON public.game
             FOR EACH ROW EXECUTE FUNCTION public.game_geom_sync()';

    RAISE NOTICE 'geom column found on game; geom trigger/function ensured.';
  END IF;
END $$;
