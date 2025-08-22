-- V4: Link game to sport (nullable FK), safely backfill from existing text values.

-- 1) Add sport_id column if missing (nullable for now).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'game' AND column_name = 'sport_id'
  ) THEN
    EXECUTE 'ALTER TABLE game ADD COLUMN sport_id BIGINT NULL';
  END IF;
END $$;

-- 2) Backfill sport_id where possible by matching existing game.sport to sport.name (case/space-insensitive).
UPDATE game g
SET sport_id = s.id
FROM sport s
WHERE g.sport_id IS NULL
  AND lower(btrim(cast(g.sport AS text))) = lower(btrim(s.name));

-- 3) Add index on sport_id for faster filtering/joining.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'i'
       AND c.relname = 'idx_game_sport_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_game_sport_id ON game(sport_id)';
  END IF;
END $$;

-- 4) Add FK constraint if missing (leave nullable; on delete set null).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'game'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'fk_game_sport'
  ) THEN
    EXECUTE 'ALTER TABLE game
             ADD CONSTRAINT fk_game_sport
             FOREIGN KEY (sport_id) REFERENCES sport(id)
             ON UPDATE RESTRICT ON DELETE SET NULL';
  END IF;
END $$;
