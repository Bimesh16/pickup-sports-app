package com.bmessi.pickupsportsapp.entity.tenant;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entity for managing user invitations to tenants.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "tenant_user_invitations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantUserInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Back-reference to TenantUser to satisfy mappedBy = "tenantUser" in TenantUser
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_user_id")
    private TenantUser tenantUser;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(name = "email", nullable = false)
    private String email;

    @NotBlank(message = "Invitation token is required")
    @Column(name = "invitation_token", nullable = false, unique = true)
    private String invitationToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private TenantUserRole role;

    @Column(name = "invited_by")
    private String invitedBy;

    @Column(name = "invited_at", nullable = false)
    private OffsetDateTime invitedAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "accepted_at")
    private OffsetDateTime acceptedAt;

    @Column(name = "declined_at")
    private OffsetDateTime declinedAt;

    @Size(max = 500, message = "Message must not exceed 500 characters")
    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "is_expired")
    @Builder.Default
    private boolean isExpired = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
