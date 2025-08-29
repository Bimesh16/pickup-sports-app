-- V1036: feature flags with rollout percentages
CREATE TABLE IF NOT EXISTS feature_flag (
    name VARCHAR(100) PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rollout_percentage INT NOT NULL DEFAULT 0
);
