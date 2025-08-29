-- Migration: Create AI analytics and recommendation tables
-- Version: V1049
-- Description: Creates tables for AI recommendations, analytics events, and performance metrics

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    recommendation_data JSONB NOT NULL,
    confidence_score DECIMAL(3, 2) NOT NULL,
    algorithm_version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    features_used JSONB,
    prediction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_timestamp TIMESTAMP WITH TIME ZONE,
    is_consumed BOOLEAN DEFAULT FALSE,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create AI model performance table
CREATE TABLE IF NOT EXISTS ai_model_performance (
    id BIGSERIAL PRIMARY KEY,
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    accuracy_score DECIMAL(5, 4) NOT NULL,
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    training_data_size INTEGER,
    training_duration_seconds INTEGER,
    last_trained_at TIMESTAMP WITH TIME ZONE,
    deployment_status VARCHAR(20) DEFAULT 'ACTIVE',
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_type, model_version)
);

-- Create user behavior analytics table
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20),
    location_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create recommendation feedback table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id BIGSERIAL PRIMARY KEY,
    recommendation_id BIGINT REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL, -- 'LIKE', 'DISLIKE', 'IGNORE', 'CLICK'
    feedback_value INTEGER CHECK (feedback_value >= 1 AND feedback_value <= 5),
    feedback_text TEXT,
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create A/B testing experiments table
CREATE TABLE IF NOT EXISTS ab_testing_experiments (
    id BIGSERIAL PRIMARY KEY,
    experiment_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    traffic_split DECIMAL(3, 2) DEFAULT 0.5, -- 0.5 = 50/50 split
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'COMPLETED'
    success_metric VARCHAR(100),
    minimum_sample_size INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create A/B testing assignments table
CREATE TABLE IF NOT EXISTS ab_testing_assignments (
    id BIGSERIAL PRIMARY KEY,
    experiment_id BIGINT REFERENCES ab_testing_experiments(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
    assigned_variant VARCHAR(10) NOT NULL, -- 'A' or 'B'
    assignment_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conversion_timestamp TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(10, 2),
    UNIQUE(experiment_id, user_id)
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    metric_unit VARCHAR(20),
    endpoint VARCHAR(200),
    response_time_ms INTEGER,
    status_code INTEGER,
    user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    additional_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create system health metrics table
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- 'CPU', 'MEMORY', 'DISK', 'NETWORK', 'DATABASE'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    metric_unit VARCHAR(20),
    threshold_warning DECIMAL(15, 4),
    threshold_critical DECIMAL(15, 4),
    node_id VARCHAR(100),
    additional_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_confidence ON ai_recommendations(confidence_score);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_timestamp ON ai_recommendations(prediction_timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_feedback ON ai_recommendations(feedback_rating);

CREATE INDEX IF NOT EXISTS idx_ai_model_performance_type ON ai_model_performance(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_version ON ai_model_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_accuracy ON ai_model_performance(accuracy_score);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session ON user_behavior_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_event_type ON user_behavior_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior_analytics(timestamp);

CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation ON recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_type ON recommendation_feedback(feedback_type);

CREATE INDEX IF NOT EXISTS idx_ab_experiments_status ON ab_testing_experiments(status);
CREATE INDEX IF NOT EXISTS idx_ab_experiments_dates ON ab_testing_experiments(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment ON ab_testing_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_user ON ab_testing_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_variant ON ab_testing_assignments(assigned_variant);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);

CREATE INDEX IF NOT EXISTS idx_system_health_type ON system_health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_health_timestamp ON system_health_metrics(timestamp);

-- Add comments for documentation
COMMENT ON TABLE ai_recommendations IS 'AI-powered recommendations for users';
COMMENT ON TABLE ai_model_performance IS 'Performance metrics for AI models';
COMMENT ON TABLE user_behavior_analytics IS 'User behavior tracking for analytics';
COMMENT ON TABLE recommendation_feedback IS 'User feedback on AI recommendations';
COMMENT ON TABLE ab_testing_experiments IS 'A/B testing experiment configurations';
COMMENT ON TABLE ab_testing_assignments IS 'User assignments to A/B test variants';
COMMENT ON TABLE performance_metrics IS 'Application performance metrics';
COMMENT ON TABLE system_health_metrics IS 'System health and resource metrics';

-- Insert default AI model performance records
INSERT INTO ai_model_performance (model_type, model_version, accuracy_score, precision_score, recall_score, f1_score, deployment_status, created_at, updated_at)
VALUES 
    ('COLLABORATIVE_FILTERING', '1.0.0', 0.8500, 0.8200, 0.7800, 0.7990, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CONTENT_BASED_FILTERING', '1.0.0', 0.7800, 0.7500, 0.7200, 0.7340, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('HYBRID_RECOMMENDATION', '1.0.0', 0.8900, 0.8600, 0.8400, 0.8490, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (model_type, model_version) DO NOTHING;
