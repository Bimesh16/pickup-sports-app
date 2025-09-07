-- Create game_participants table
CREATE TABLE game_participants (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    game_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rating DECIMAL(3,2),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT fk_game_participants_game 
        FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
    CONSTRAINT chk_game_participants_status 
        CHECK (status IN ('CONFIRMED', 'PENDING', 'DECLINED', 'WAITLISTED')),
    CONSTRAINT chk_game_participants_rating 
        CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

-- Create indexes for better performance
CREATE INDEX idx_game_participants_user_id ON game_participants(user_id);
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_status ON game_participants(status);
CREATE INDEX idx_game_participants_joined_at ON game_participants(joined_at);

-- Add unique constraint to prevent duplicate participations
CREATE UNIQUE INDEX idx_game_participants_unique_user_game 
    ON game_participants(user_id, game_id);
