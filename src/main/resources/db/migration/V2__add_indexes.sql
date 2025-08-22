-- V2: Add helpful indexes (idempotent) for common queries.

-- 1) Index on game(time) to speed listing/sorting by time.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'game'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i'
        AND c.relname = 'idx_game_time'
    ) THEN
      EXECUTE 'CREATE INDEX idx_game_time ON public.game("time")';
    END IF;
  END IF;
END $$;

-- 2) Optional: Index on notification(user_id, created_at/createdat DESC) for fast retrieval.
DO $$
DECLARE
  col_created_at_exists boolean;
  col_createdat_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notification' AND column_name = 'created_at'
  ) INTO col_created_at_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notification' AND column_name = 'createdat'
  ) INTO col_createdat_exists;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_notification_user_createdat'
  ) THEN
    IF col_created_at_exists THEN
      EXECUTE 'CREATE INDEX idx_notification_user_createdat ON notification(user_id, created_at DESC)';
    ELSIF col_createdat_exists THEN
      EXECUTE 'CREATE INDEX idx_notification_user_createdat ON notification(user_id, createdat DESC)';
    ELSE
      RAISE NOTICE 'Skipping idx_notification_user_createdat: created_at/createdat column not found on notification';
    END IF;
  END IF;
END $$;
