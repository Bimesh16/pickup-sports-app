-- V8: Ensure trigger sets sport_id to 'unknown' when no matching sport is found.

CREATE OR REPLACE FUNCTION set_game_sport_id() RETURNS trigger AS $$
DECLARE
  matched_id BIGINT;
  unknown_id BIGINT;
BEGIN
  IF NEW.sport_id IS NULL THEN
    IF NEW.sport IS NOT NULL AND btrim(cast(NEW.sport AS text)) <> '' THEN
      SELECT s.id INTO matched_id
      FROM sport s
      WHERE lower(btrim(cast(NEW.sport AS text))) = lower(btrim(s.name))
      LIMIT 1;
    END IF;

    IF matched_id IS NULL THEN
      SELECT id INTO unknown_id FROM sport WHERE lower(name) = 'unknown' LIMIT 1;
      IF unknown_id IS NULL THEN
        -- create unknown on the fly if missing
        INSERT INTO sport(name, display_name) VALUES ('unknown', 'Unknown')
        ON CONFLICT (name) DO NOTHING;
        SELECT id INTO unknown_id FROM sport WHERE lower(name) = 'unknown' LIMIT 1;
      END IF;
      NEW.sport_id = unknown_id;
    ELSE
      NEW.sport_id = matched_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger to use the latest function (safe if already exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_game_sport_id') THEN
    EXECUTE 'DROP TRIGGER trg_set_game_sport_id ON game';
  END IF;
END $$;

CREATE TRIGGER trg_set_game_sport_id
BEFORE INSERT OR UPDATE ON game
FOR EACH ROW
EXECUTE FUNCTION set_game_sport_id();
