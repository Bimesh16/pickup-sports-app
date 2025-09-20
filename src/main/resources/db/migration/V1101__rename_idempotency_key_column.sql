-- Ensure idempotency key column uses a non-reserved identifier
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'idempotency_record'
          AND column_name = 'key'
    ) THEN
        ALTER TABLE idempotency_record RENAME COLUMN key TO idempotency_key;
    END IF;
END $$;
