-- Indexes to speed up retention cleanup (fixed table/column names)
-- Chat messages table: chat_messages, column: sent_at
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages (sent_at);

-- Notification table stores created timestamp in column "timestamp"
CREATE INDEX IF NOT EXISTS idx_notification_timestamp_read ON notification ("timestamp", read);
