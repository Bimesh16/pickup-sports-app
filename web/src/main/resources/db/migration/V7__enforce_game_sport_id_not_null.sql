-- V7: Enforce game.sport_id NOT NULL with safe backfill and strict FK

-- 1) Ensure 'Unknown' sport exists
INSERT INTO sport (name, display_name)
SELECT 'unknown', 'Unknown'
WHERE NOT EXISTS (
  SELECT 1 FROM sport s WHERE lower(s.name) = 'unknown'
);

-- 2) Insert any missing sports based on existing game.sport text
INSERT INTO sport (name, display_name)
SELECT DISTINCT
  lower(btrim(cast(g.sport AS text)))              AS name,
  initcap(lower(btrim(cast(g.sport AS text))))     AS display_name
FROM game g
LEFT JOIN sport s
  ON lower(btrim(cast(g.sport AS text))) = lower(btrim(s.name))
WHERE g.sport_id IS NULL
  AND g.sport IS NOT NULL
  AND btrim(cast(g.sport AS text)) <> ''
  AND s.id IS NULL;

-- 3) Backfill sport_id from sport.name for games with non-empty sport text
UPDATE game g
SET sport_id = s.id
FROM sport s
WHERE g.sport_id IS NULL
  AND g.sport IS NOT NULL
  AND btrim(cast(g.sport AS text)) <> ''
  AND lower(btrim(cast(g.sport AS text))) = lower(btrim(s.name));

-- 4) Assign 'Unknown' sport for any remaining NULL sport_id
UPDATE game g
SET sport_id = (SELECT id FROM sport WHERE lower(name) = 'unknown' LIMIT 1)
WHERE g.sport_id IS NULL;

-- 5) Recreate FK with RESTRICT semantics (drop old if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'game'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'fk_game_sport'
  ) THEN
    EXECUTE 'ALTER TABLE game DROP CONSTRAINT fk_game_sport';
  END IF;
END $$;

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
             ON UPDATE RESTRICT ON DELETE RESTRICT';
  END IF;
END $$;

-- 6) Enforce NOT NULL on sport_id
ALTER TABLE game ALTER COLUMN sport_id SET NOT NULL;

-- 7) Helpful index for joins/filtering
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
