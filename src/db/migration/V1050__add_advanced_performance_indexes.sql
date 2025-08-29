-- Migration: Add advanced performance indexes
-- Version: V1050
-- Description: Adds comprehensive performance indexes for multi-tenant, AI, and real-time features

-- Multi-tenant performance indexes
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription ON tenants(subscription_plan, subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_tenants_billing ON tenants(monthly_fee, status);

CREATE INDEX IF NOT EXISTS idx_tenant_users_role_status ON tenant_users(role, status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_permissions ON tenant_users USING GIN(permissions);
CREATE INDEX IF NOT EXISTS idx_tenant_users_last_active ON tenant_users(last_active_at);

CREATE INDEX IF NOT EXISTS idx_tenant_invitations_expired ON tenant_user_invitations(is_expired, expires_at);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email_role ON tenant_user_invitations(email, role);

-- AI and analytics performance indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_type ON ai_recommendations(user_id, recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_confidence_consumed ON ai_recommendations(confidence_score, is_consumed);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_feedback ON ai_recommendations(feedback_rating, feedback_timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_model ON ai_recommendations(model_type, algorithm_version);

CREATE INDEX IF NOT EXISTS idx_ai_model_performance_deployment ON ai_model_performance(deployment_status, last_trained_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_metrics ON ai_model_performance(accuracy_score, f1_score);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_session ON user_behavior_analytics(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_event_timestamp ON user_behavior_analytics(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behavior_location ON user_behavior_analytics USING GIN(location_data);
CREATE INDEX IF NOT EXISTS idx_user_behavior_device ON user_behavior_analytics(device_type, timestamp);

CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_type_value ON recommendation_feedback(feedback_type, feedback_value);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_context ON recommendation_feedback USING GIN(context_data);

-- A/B testing performance indexes
CREATE INDEX IF NOT EXISTS idx_ab_experiments_active ON ab_testing_experiments(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ab_experiments_metrics ON ab_testing_experiments(success_metric, minimum_sample_size);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment_user ON ab_testing_assignments(experiment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_variant_conversion ON ab_testing_assignments(assigned_variant, conversion_timestamp);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_conversion_value ON ab_testing_assignments(conversion_value, conversion_timestamp);

-- Performance and system health indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp ON performance_metrics(metric_name, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint_status ON performance_metrics(endpoint, status_code);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time ON performance_metrics(response_time_ms, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_session ON performance_metrics(user_id, session_id);

CREATE INDEX IF NOT EXISTS idx_system_health_type_name ON system_health_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_thresholds ON system_health_metrics(threshold_warning, threshold_critical);
CREATE INDEX IF NOT EXISTS idx_system_health_node ON system_health_metrics(node_id, timestamp);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_tenants_comprehensive ON tenants(status, tenant_type, created_at, monthly_fee);
CREATE INDEX IF NOT EXISTS idx_tenant_users_comprehensive ON tenant_users(tenant_id, role, status, last_active_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_comprehensive ON ai_recommendations(user_id, recommendation_type, confidence_score, is_consumed);
CREATE INDEX IF NOT EXISTS idx_user_behavior_comprehensive ON user_behavior_analytics(user_id, event_type, timestamp, device_type);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_tenants_active_subscription ON tenants(subscription_plan, subscription_end_date) 
WHERE status = 'ACTIVE' AND subscription_end_date > CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_tenant_users_active ON tenant_users(tenant_id, role) 
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_active ON ai_recommendations(user_id, recommendation_type) 
WHERE is_consumed = FALSE AND confidence_score >= 0.7;

CREATE INDEX IF NOT EXISTS idx_ab_experiments_running ON ab_testing_experiments(experiment_name, status) 
WHERE status = 'ACTIVE' AND start_date <= CURRENT_TIMESTAMP AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP);

-- Function-based indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tenants_domain_lower ON tenants(LOWER(domain_name));
CREATE INDEX IF NOT EXISTS idx_tenant_users_email_lower ON tenant_user_invitations(LOWER(email));

-- GIN indexes for JSON fields
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_data ON ai_recommendations USING GIN(recommendation_data);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_features ON ai_recommendations USING GIN(features_used);
CREATE INDEX IF NOT EXISTS idx_tenant_users_permissions_gin ON tenant_users USING GIN(permissions);
CREATE INDEX IF NOT EXISTS idx_user_behavior_event_data ON user_behavior_analytics USING GIN(event_data);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_additional ON performance_metrics USING GIN(additional_data);
CREATE INDEX IF NOT EXISTS idx_system_health_additional ON system_health_metrics USING GIN(additional_data);

-- Add comments for documentation
COMMENT ON INDEX idx_tenants_comprehensive IS 'Composite index for comprehensive tenant queries';
COMMENT ON INDEX idx_tenant_users_comprehensive IS 'Composite index for comprehensive tenant user queries';
COMMENT ON INDEX idx_ai_recommendations_comprehensive IS 'Composite index for comprehensive AI recommendation queries';
COMMENT ON INDEX idx_user_behavior_comprehensive IS 'Composite index for comprehensive user behavior queries';
COMMENT ON INDEX idx_tenants_active_subscription IS 'Partial index for active tenants with valid subscriptions';
COMMENT ON INDEX idx_tenant_users_active IS 'Partial index for active tenant users';
COMMENT ON INDEX idx_ai_recommendations_active IS 'Partial index for active AI recommendations with high confidence';
COMMENT ON INDEX idx_ab_experiments_running IS 'Partial index for currently running A/B experiments';
