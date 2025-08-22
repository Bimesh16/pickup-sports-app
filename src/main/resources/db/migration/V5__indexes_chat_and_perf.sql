-- V5: Performance indexes for chat history

-- Index chat messages by (game_id, sent_at DESC) to speed latest/history lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_chat_messages_game_sentat_desc'
  ) THEN
    EXECUTE 'CREATE INDEX idx_chat_messages_game_sentat_desc ON chat_messages (game_id, sent_at DESC)';
  END IF;
END $$;
