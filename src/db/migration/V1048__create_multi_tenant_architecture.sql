-- Migration: Create multi-tenant architecture tables
-- Version: V1048
-- Description: Creates tables for multi-tenant architecture including tenants, tenant users, features, and configurations

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_ACTIVATION',
    domain_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    branding_logo_url VARCHAR(500),
    branding_primary_color VARCHAR(7),
    branding_secondary_color VARCHAR(7),
    max_users INTEGER DEFAULT 1000,
    max_venues INTEGER DEFAULT 100,
    max_games_per_day INTEGER DEFAULT 50,
    subscription_plan VARCHAR(50) DEFAULT 'BASIC',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    monthly_fee DECIMAL(10, 2) DEFAULT 0.00,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en_US',
    currency VARCHAR(3) DEFAULT 'USD',
    tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create tenant features table
CREATE TABLE IF NOT EXISTS tenant_features (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    enabled_at TIMESTAMP WITH TIME ZONE,
    disabled_at TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, feature_name)
);

-- Create tenant configurations table
CREATE TABLE IF NOT EXISTS tenant_configurations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    is_system_config BOOLEAN NOT NULL DEFAULT FALSE,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    validation_regex VARCHAR(255),
    default_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, config_key)
);

-- Create tenant users table
CREATE TABLE IF NOT EXISTS tenant_users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    permissions JSONB,
    invited_by VARCHAR(100),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_venues BOOLEAN DEFAULT FALSE,
    can_manage_games BOOLEAN DEFAULT FALSE,
    can_view_analytics BOOLEAN DEFAULT FALSE,
    can_manage_billing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

-- Create tenant user invitations table
CREATE TABLE IF NOT EXISTS tenant_user_invitations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_by VARCHAR(100),
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    message TEXT,
    is_expired BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_code ON tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_type ON tenants(tenant_type);
CREATE INDEX IF NOT EXISTS idx_tenants_domain_name ON tenants(domain_name);
CREATE INDEX IF NOT EXISTS idx_tenants_location ON tenants(city, state, country);

CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant_id ON tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_enabled ON tenant_features(is_enabled);

CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant_id ON tenant_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_key ON tenant_configurations(config_key);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);

CREATE INDEX IF NOT EXISTS idx_tenant_invitations_tenant_id ON tenant_user_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON tenant_user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_token ON tenant_user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_expires ON tenant_user_invitations(expires_at);

-- Add comments for documentation
COMMENT ON TABLE tenants IS 'Multi-tenant architecture: Main tenant information';
COMMENT ON TABLE tenant_features IS 'Multi-tenant architecture: Feature flags per tenant';
COMMENT ON TABLE tenant_configurations IS 'Multi-tenant architecture: Configuration settings per tenant';
COMMENT ON TABLE tenant_users IS 'Multi-tenant architecture: User-tenant relationships and roles';
COMMENT ON TABLE tenant_user_invitations IS 'Multi-tenant architecture: User invitation management';

-- Insert default tenant (for existing single-tenant setup)
INSERT INTO tenants (tenant_code, name, description, tenant_type, status, domain_name, created_at, updated_at)
VALUES ('default', 'Default Tenant', 'Default tenant for existing single-tenant setup', 'SPORTS_CLUB', 'ACTIVE', 'pickupsports.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (tenant_code) DO NOTHING;

-- Insert default tenant features
INSERT INTO tenant_features (tenant_id, feature_name, is_enabled, description, created_at, updated_at)
SELECT 
    t.id,
    feature_name,
    is_enabled,
    description,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    VALUES 
        ('MULTI_TENANT', true, 'Multi-tenant architecture support'),
        ('ADVANCED_AI', true, 'Advanced AI recommendations'),
        ('REAL_TIME_FEATURES', true, 'Real-time WebSocket features'),
        ('MOBILE_OPTIMIZATION', true, 'Mobile-optimized features'),
        ('ADVANCED_SECURITY', true, 'Advanced security features'),
        ('GDPR_COMPLIANCE', true, 'GDPR compliance features')
) AS features(feature_name, is_enabled, description)
CROSS JOIN (SELECT id FROM tenants WHERE tenant_code = 'default') AS t
ON CONFLICT (tenant_id, feature_name) DO NOTHING;

-- Insert default tenant configurations
INSERT INTO tenant_configurations (tenant_id, config_key, config_value, description, is_required, created_at, updated_at)
SELECT 
    t.id,
    config_key,
    config_value,
    description,
    is_required,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    VALUES 
        ('MAX_USERS', '1000', 'Maximum number of users allowed', true),
        ('MAX_VENUES', '100', 'Maximum number of venues allowed', true),
        ('MAX_GAMES_PER_DAY', '50', 'Maximum number of games per day', true),
        ('SUBSCRIPTION_PLAN', 'BASIC', 'Current subscription plan', true),
        ('TIMEZONE', 'UTC', 'Default timezone', true),
        ('LOCALE', 'en_US', 'Default locale', true),
        ('CURRENCY', 'USD', 'Default currency', true)
) AS configs(config_key, config_value, description, is_required)
CROSS JOIN (SELECT id FROM tenants WHERE tenant_code = 'default') AS t
ON CONFLICT (tenant_id, config_key) DO NOTHING;
