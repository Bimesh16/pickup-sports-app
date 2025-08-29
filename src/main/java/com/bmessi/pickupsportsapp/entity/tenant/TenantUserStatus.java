package com.bmessi.pickupsportsapp.entity.tenant;

/**
 * Enumeration of user statuses within a tenant.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
public enum TenantUserStatus {
    ACTIVE("Active", "User is active in the tenant"),
    INACTIVE("Inactive", "User is inactive in the tenant"),
    SUSPENDED("Suspended", "User is suspended in the tenant"),
    PENDING("Pending", "User invitation is pending acceptance");
    
    private final String displayName;
    private final String description;
    
    TenantUserStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
