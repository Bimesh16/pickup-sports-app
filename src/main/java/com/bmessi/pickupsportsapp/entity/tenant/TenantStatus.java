package com.bmessi.pickupsportsapp.entity.tenant;

/**
 * Enumeration of tenant statuses for multi-tenant architecture.
 * 
 * <p>This enum defines the various states a tenant can be in throughout their lifecycle,
 * from initial setup to active operation and potential suspension or deletion.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
public enum TenantStatus {
    
    /**
     * Tenant setup in progress.
     * Initial configuration and onboarding phase.
     */
    PENDING_ACTIVATION("Pending Activation", "Tenant setup in progress"),
    
    /**
     * Tenant is fully operational.
     * All features enabled and actively serving users.
     */
    ACTIVE("Active", "Tenant is fully operational"),
    
    /**
     * Tenant temporarily suspended.
     * Usually due to payment issues or policy violations.
     */
    SUSPENDED("Suspended", "Tenant temporarily suspended"),
    
    /**
     * Tenant deactivated.
     * Not currently operational but can be reactivated.
     */
    INACTIVE("Inactive", "Tenant deactivated"),
    
    /**
     * Tenant marked for deletion.
     * Data retention period before permanent removal.
     */
    DELETED("Deleted", "Tenant marked for deletion");
    
    private final String displayName;
    private final String description;
    
    TenantStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
