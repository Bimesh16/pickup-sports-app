package com.bmessi.pickupsportsapp.entity.tenant;

/**
 * Enumeration of user roles within a tenant.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
public enum TenantUserRole {
    OWNER("Owner", "Full control over tenant and all resources"),
    ADMIN("Admin", "Administrative access to tenant management"),
    MANAGER("Manager", "Manage games, venues, and user access"),
    MODERATOR("Moderator", "Moderate content and user behavior"),
    MEMBER("Member", "Standard user with basic access"),
    GUEST("Guest", "Limited access for temporary users");
    
    private final String displayName;
    private final String description;
    
    TenantUserRole(String displayName, String description) {
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
