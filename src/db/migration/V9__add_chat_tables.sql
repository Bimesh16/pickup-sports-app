-- Create chat conversations table
CREATE TABLE chat_conversations (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    conversation_type VARCHAR(20) NOT NULL,
    game_id BIGINT,
    created_by BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT fk_chat_conversations_game 
        FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_conversations_created_by 
        FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT chk_chat_conversations_type 
        CHECK (conversation_type IN ('GAME', 'DIRECT', 'GROUP'))
);

-- Create chat messages table
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content VARCHAR(2000) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT fk_chat_messages_conversation 
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_messages_sender 
        FOREIGN KEY (sender_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT chk_chat_messages_type 
        CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM'))
);

-- Create chat participants table
CREATE TABLE chat_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT fk_chat_participants_conversation 
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_participants_user 
        FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT uk_chat_participants_conversation_user 
        UNIQUE (conversation_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_chat_conversations_created_by ON chat_conversations(created_by);
CREATE INDEX idx_chat_conversations_game_id ON chat_conversations(game_id);
CREATE INDEX idx_chat_conversations_updated_at ON chat_conversations(updated_at);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_participants_conversation_id ON chat_participants(conversation_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
