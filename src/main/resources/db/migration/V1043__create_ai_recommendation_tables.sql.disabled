-- Migration: Create AI recommendation tables
-- Version: V1043
-- Description: Creates tables for AI-powered recommendations including player, game, and venue recommendations

SET search_path TO public;

-- Player recommendations table
CREATE TABLE player_recommendations (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL,
    recommended_player_id BIGINT NOT NULL,
    requesting_player_id BIGINT NOT NULL,
    recommendation_score DECIMAL(5,4) NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ai_model_version VARCHAR(50),
    features_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_player_recommendations_game FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
    CONSTRAINT fk_player_recommendations_recommended_player FOREIGN KEY (recommended_player_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_player_recommendations_requesting_player FOREIGN KEY (requesting_player_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_player_recommendations_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    CONSTRAINT chk_player_recommendations_score CHECK (recommendation_score >= 0 AND recommendation_score <= 1)
);

-- Game recommendations table
CREATE TABLE game_recommendations (
    id BIGSERIAL PRIMARY KEY,
    recommended_game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    recommendation_score DECIMAL(5,4) NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ai_model_version VARCHAR(50),
    features_used TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE,
    joined_game BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_game_recommendations_game FOREIGN KEY (recommended_game_id) REFERENCES game(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_recommendations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_game_recommendations_status CHECK (status IN ('ACTIVE', 'CLICKED', 'JOINED', 'EXPIRED')),
    CONSTRAINT chk_game_recommendations_score CHECK (recommendation_score >= 0 AND recommendation_score <= 1)
);

-- Venue recommendations table
CREATE TABLE venue_recommendations (
    id BIGSERIAL PRIMARY KEY,
    recommended_venue_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    recommendation_score DECIMAL(5,4) NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ai_model_version VARCHAR(50),
    features_used TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE,
    booked_venue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_venue_recommendations_venue FOREIGN KEY (recommended_venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    CONSTRAINT fk_venue_recommendations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_venue_recommendations_status CHECK (status IN ('ACTIVE', 'CLICKED', 'BOOKED', 'EXPIRED')),
    CONSTRAINT chk_venue_recommendations_score CHECK (recommendation_score >= 0 AND recommendation_score <= 1)
);

-- Create indexes for better performance
CREATE INDEX idx_player_recommendations_game ON player_recommendations(game_id);
CREATE INDEX idx_player_recommendations_recommended_player ON player_recommendations(recommended_player_id);
CREATE INDEX idx_player_recommendations_requesting_player ON player_recommendations(requesting_player_id);
CREATE INDEX idx_player_recommendations_status ON player_recommendations(status);
CREATE INDEX idx_player_recommendations_score ON player_recommendations(recommendation_score DESC);

CREATE INDEX idx_game_recommendations_user ON game_recommendations(user_id);
CREATE INDEX idx_game_recommendations_game ON game_recommendations(recommended_game_id);
CREATE INDEX idx_game_recommendations_status ON game_recommendations(status);
CREATE INDEX idx_game_recommendations_score ON game_recommendations(recommendation_score DESC);

CREATE INDEX idx_venue_recommendations_user ON venue_recommendations(user_id);
CREATE INDEX idx_venue_recommendations_venue ON venue_recommendations(recommended_venue_id);
CREATE INDEX idx_venue_recommendations_status ON venue_recommendations(status);
CREATE INDEX idx_venue_recommendations_score ON venue_recommendations(recommendation_score DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_player_recommendations_updated_at BEFORE UPDATE ON player_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_recommendations_updated_at BEFORE UPDATE ON game_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_recommendations_updated_at BEFORE UPDATE ON venue_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE player_recommendations IS 'AI-generated player recommendations for games';
COMMENT ON TABLE game_recommendations IS 'AI-generated game recommendations for users';
COMMENT ON TABLE venue_recommendations IS 'AI-generated venue recommendations for users';
COMMENT ON COLUMN player_recommendations.recommendation_score IS 'AI confidence score between 0 and 1';
COMMENT ON COLUMN game_recommendations.recommendation_score IS 'AI confidence score between 0 and 1';
COMMENT ON COLUMN venue_recommendations.recommendation_score IS 'AI confidence score between 0 and 1';
COMMENT ON COLUMN player_recommendations.features_used IS 'JSON string of features used for recommendation';
COMMENT ON COLUMN game_recommendations.features_used IS 'JSON string of features used for recommendation';
COMMENT ON COLUMN venue_recommendations.features_used IS 'JSON string of features used for recommendation';
