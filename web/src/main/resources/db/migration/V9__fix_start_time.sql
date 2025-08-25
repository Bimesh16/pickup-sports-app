-- V9: Align game.start_time with game.time and prevent NOT NULL violations

-- 1) Drop NOT NULL on start_time if present (safe in all environments)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game'
      AND column_name = 'start_time'
      AND is_nullable = 'NO'
  ) THEN
    EXECUTE 'ALTER TABLE public.game ALTER COLUMN start_time DROP NOT NULL';
  END IF;
END $$;

-- 2) Backfill start_time from time wherever it's currently null
UPDATE public.game
SET start_time = "time"
WHERE start_time IS NULL
  AND "time" IS NOT NULL;

-- 3) Add a trigger to auto-populate start_time from time on insert/update
CREATE OR REPLACE FUNCTION public.set_game_start_time() RETURNS trigger AS $$
BEGIN
  IF NEW.start_time IS NULL AND NEW."time" IS NOT NULL THEN
    NEW.start_time = NEW."time";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_game_start_time ON public.game;
CREATE TRIGGER trg_set_game_start_time
BEFORE INSERT OR UPDATE ON public.game
FOR EACH ROW
EXECUTE FUNCTION public.set_game_start_time();
