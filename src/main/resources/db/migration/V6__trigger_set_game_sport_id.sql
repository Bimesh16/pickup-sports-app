-- V6: Trigger to auto-populate game.sport_id from game.sport on insert/update.

-- Create or replace a function that sets NEW.sport_id if sport text matches a known sport.name (case/space-insensitive).
CREATE OR REPLACE FUNCTION set_game_sport_id() RETURNS trigger AS $$
BEGIN
  IF NEW.sport_id IS NULL AND NEW.sport IS NOT NULL THEN
    SELECT s.id INTO NEW.sport_id
    FROM sport s
    WHERE lower(btrim(cast(NEW.sport AS text))) = lower(btrim(s.name))
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if present to avoid duplicates.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_game_sport_id'
  ) THEN
    EXECUTE 'DROP TRIGGER trg_set_game_sport_id ON game';
  END IF;
END $$;

-- Create the trigger for BEFORE INSERT OR UPDATE.
CREATE TRIGGER trg_set_game_sport_id
BEFORE INSERT OR UPDATE ON game
FOR EACH ROW
EXECUTE FUNCTION set_game_sport_id();
