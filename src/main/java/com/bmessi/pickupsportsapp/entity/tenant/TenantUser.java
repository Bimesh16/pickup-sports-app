package com.bmessi.pickupsportsapp.entity.tenant;

import com.bmessi.pickupsportsapp.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing the relationship between users and tenants in multi-tenant architecture.
 * 
 * <p>This entity manages user membership within specific tenants, including roles,
 * permissions, and access levels. A user can belong to multiple tenants with different
 * roles and permissions in each.</p>
 * 
 * <p><strong>User Roles:</strong></p>
 * <ul>
 *   <li><strong>OWNER:</strong> Full control over tenant and all resources</li>
 *   <li><strong>ADMIN:</strong> Administrative access to tenant management</li>
 *   <li><strong>MANAGER:</strong> Manage games, venues, and user access</li>
 *   <li><strong>MODERATOR:</strong> Moderate content and user behavior</li>
 *   <li><strong>MEMBER:</strong> Standard user with basic access</li>
 *   <li><strong>GUEST:</strong> Limited access for temporary users</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "tenant_users", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id", "user_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @NotNull(message = "Tenant is required")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private TenantUserRole role = TenantUserRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TenantUserStatus status = TenantUserStatus.ACTIVE;

    @Size(max = 1000, message = "Permissions must not exceed 1000 characters")
    @Column(name = "permissions", length = 1000)
    private String permissions; // JSON string of specific permissions

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "invited_by")
    private Long invitedBy; // User ID who invited this user

    @Column(name = "invited_at")
    private OffsetDateTime invitedAt;

    @Column(name = "accepted_at")
    private OffsetDateTime acceptedAt;

    @Column(name = "last_active_at")
    private OffsetDateTime lastActiveAt;

    @Column(name = "is_primary_tenant", nullable = false)
    @Builder.Default
    private boolean isPrimaryTenant = false;

    @Column(name = "is_billing_contact", nullable = false)
    @Builder.Default
    private boolean isBillingContact = false;

    @Column(name = "is_technical_contact", nullable = false)
    @Builder.Default
    private boolean isTechnicalContact = false;

    @Column(name = "can_invite_users", nullable = false)
    @Builder.Default
    private boolean canInviteUsers = false;

    @Column(name = "can_manage_venues", nullable = false)
    @Builder.Default
    private boolean canManageVenues = false;

    @Column(name = "can_manage_games", nullable = false)
    @Builder.Default
    private boolean canManageGames = false;

    @Column(name = "can_moderate_content", nullable = false)
    @Builder.Default
    private boolean canModerateContent = false;

    @Column(name = "can_view_analytics", nullable = false)
    @Builder.Default
    private boolean canViewAnalytics = false;

    @Column(name = "can_manage_billing", nullable = false)
    @Builder.Default
    private boolean canManageBilling = false;

    @Column(name = "can_manage_users", nullable = false)
    @Builder.Default
    private boolean canManageUsers = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deactivated_at")
    private OffsetDateTime deactivatedAt;

    // Relationships
    @OneToMany(mappedBy = "tenantUser", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TenantUserInvitation> invitations = new HashSet<>();

    /**
     * Check if user is active in this tenant.
     * 
     * @return True if user is active
     */
    public boolean isActive() {
        return TenantUserStatus.ACTIVE.equals(status);
    }

    /**
     * Check if user has admin privileges.
     * 
     * @return True if user is admin or owner
     */
    public boolean isAdmin() {
        return TenantUserRole.ADMIN.equals(role) || TenantUserRole.OWNER.equals(role);
    }

    /**
     * Check if user is the owner of the tenant.
     * 
     * @return True if user is owner
     */
    public boolean isOwner() {
        return TenantUserRole.OWNER.equals(role);
    }

    /**
     * Check if user can perform a specific action.
     * 
     * @param permission Permission to check
     * @return True if user has permission
     */
    public boolean hasPermission(String permission) {
        switch (permission) {
            case "invite_users":
                return canInviteUsers || isAdmin();
            case "manage_venues":
                return canManageVenues || isAdmin();
            case "manage_games":
                return canManageGames || isAdmin();
            case "moderate_content":
                return canModerateContent || isAdmin();
            case "view_analytics":
                return canViewAnalytics || isAdmin();
            case "manage_billing":
                return canManageBilling || isOwner();
            case "manage_users":
                return canManageUsers || isAdmin();
            default:
                return isAdmin();
        }
    }

    /**
     * Accept the tenant invitation.
     */
    public void acceptInvitation() {
        this.status = TenantUserStatus.ACTIVE;
        this.acceptedAt = OffsetDateTime.now();
    }

    /**
     * Deactivate the user in this tenant.
     */
    public void deactivate() {
        this.status = TenantUserStatus.INACTIVE;
        this.deactivatedAt = OffsetDateTime.now();
    }

    /**
     * Reactivate the user in this tenant.
     */
    public void reactivate() {
        this.status = TenantUserStatus.ACTIVE;
        this.deactivatedAt = null;
    }

    /**
     * Update last activity timestamp.
     */
    public void updateLastActivity() {
        this.lastActiveAt = OffsetDateTime.now();
    }
}
