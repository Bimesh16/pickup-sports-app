-- Ensure spatial index on geom for efficient radius queries
CREATE INDEX IF NOT EXISTS idx_game_geom ON game USING GIST (geom);
