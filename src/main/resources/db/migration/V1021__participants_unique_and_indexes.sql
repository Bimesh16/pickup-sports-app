-- Ensure idempotent participant inserts and speed common lookups
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'ux_game_participants_game_user'
    ) THEN
        CREATE UNIQUE INDEX ux_game_participants_game_user ON game_participants (game_id, user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_game_participants_game ON game_participants (game_id);

-- Waitlist indexes (in case not present)
CREATE INDEX IF NOT EXISTS idx_game_waitlist_game ON game_waitlist (game_id);
CREATE INDEX IF NOT EXISTS idx_game_waitlist_user ON game_waitlist (user_id);
