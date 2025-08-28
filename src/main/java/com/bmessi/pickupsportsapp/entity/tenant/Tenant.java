package com.bmessi.pickupsportsapp.entity.tenant;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Multi-tenant architecture entity representing an organization, sports club, or region.
 * 
 * <p>This entity enables the application to support multiple organizations with isolated data,
 * custom configurations, and independent scaling. Each tenant can have their own users, games,
 * venues, and business rules while sharing the same application infrastructure.</p>
 * 
 * <p><strong>Tenant Types:</strong></p>
 * <ul>
 *   <li><strong>SPORTS_CLUB:</strong> Local sports clubs and organizations</li>
 *   <li><strong>FACILITY_OWNER:</strong> Venue and facility management companies</li>
 *   <li><strong>LEAGUE_ORGANIZER:</strong> Sports league and tournament organizers</li>
 *   <li><strong>CORPORATE:</strong> Corporate wellness and team building programs</li>
 *   <li><strong>EDUCATIONAL:</strong> Schools, universities, and educational institutions</li>
 *   <li><strong>MUNICIPAL:</strong> City and government sports programs</li>
 *   <li><strong>FRANCHISE:</strong> Multi-location sports business franchises</li>
 * </ul>
 * 
 * <p><strong>Tenant Status:</strong></p>
 * <ul>
 *   <li><strong>ACTIVE:</strong> Tenant is fully operational</li>
 *   <li><strong>PENDING_ACTIVATION:</strong> Tenant setup in progress</li>
 *   <li><strong>SUSPENDED:</strong> Tenant temporarily suspended</li>
 *   <li><strong>INACTIVE:</strong> Tenant deactivated</li>
 *   <li><strong>DELETED:</strong> Tenant marked for deletion</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "tenants", uniqueConstraints = {
    @UniqueConstraint(columnNames = "tenant_code"),
    @UniqueConstraint(columnNames = "domain_name")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tenant code is required")
    @Size(min = 3, max = 20, message = "Tenant code must be between 3 and 20 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Tenant code can only contain uppercase letters, numbers, underscores, and hyphens")
    @Column(name = "tenant_code", unique = true, nullable = false, length = 20)
    private String tenantCode;

    @NotBlank(message = "Tenant name is required")
    @Size(max = 255, message = "Tenant name must not exceed 255 characters")
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "tenant_type", nullable = false, length = 50)
    @Builder.Default
    private TenantType tenantType = TenantType.SPORTS_CLUB;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TenantStatus status = TenantStatus.PENDING_ACTIVATION;

    @Size(max = 255, message = "Domain name must not exceed 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9.-]+$", message = "Domain name must be a valid domain format")
    @Column(name = "domain_name", unique = true, length = 255)
    private String domainName;

    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://.*)?$", message = "Website URL must be a valid HTTP/HTTPS URL")
    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Size(max = 255, message = "Contact email must not exceed 255 characters")
    @Email(message = "Contact email must be a valid email address")
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Size(max = 20, message = "Contact phone must not exceed 20 characters")
    @Pattern(regexp = "^[+]?[0-9\\s\\-\\(\\)]+$", message = "Contact phone must contain only numbers, spaces, hyphens, and parentheses")
    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Column(name = "address", length = 500)
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    @Column(name = "state", length = 100)
    private String state;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(name = "country", length = 100)
    private String country;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90 degrees")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90 degrees")
    @Column(name = "latitude")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180 degrees")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180 degrees")
    @Column(name = "longitude")
    private Double longitude;

    @Size(max = 512, message = "Logo URL must not exceed 512 characters")
    @Pattern(regexp = "^(https?://.*|/.*|data:.*)?$", message = "Logo URL must be a valid URL, path, or data URI")
    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Size(max = 512, message = "Banner URL must not exceed 512 characters")
    @Pattern(regexp = "^(https?://.*|/.*|data:.*)?$", message = "Banner URL must be a valid URL, path, or data URI")
    @Column(name = "banner_url", length = 512)
    private String bannerUrl;

    @Size(max = 100, message = "Primary color must not exceed 100 characters")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Primary color must be a valid hex color code")
    @Column(name = "primary_color", length = 100)
    private String primaryColor;

    @Size(max = 100, message = "Secondary color must not exceed 100 characters")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Secondary color must be a valid hex color code")
    @Column(name = "secondary_color", length = 100)
    private String secondaryColor;

    @Column(name = "max_users")
    @Min(value = 1, message = "Maximum users must be at least 1")
    @Max(value = 1000000, message = "Maximum users cannot exceed 1,000,000")
    private Integer maxUsers;

    @Column(name = "max_venues")
    @Min(value = 1, message = "Maximum venues must be at least 1")
    @Max(value = 10000, message = "Maximum venues cannot exceed 10,000")
    private Integer maxVenues;

    @Column(name = "max_games_per_month")
    @Min(value = 1, message = "Maximum games per month must be at least 1")
    @Max(value = 100000, message = "Maximum games per month cannot exceed 100,000")
    private Integer maxGamesPerMonth;

    @Column(name = "subscription_plan", length = 50)
    @Pattern(regexp = "^(FREE|BASIC|PROFESSIONAL|ENTERPRISE|CUSTOM)$", message = "Subscription plan must be FREE, BASIC, PROFESSIONAL, ENTERPRISE, or CUSTOM")
    private String subscriptionPlan;

    @Column(name = "monthly_fee", precision = 10, scale = 2)
    @DecimalMin(value = "0.0", message = "Monthly fee must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Monthly fee must have at most 6 digits and 2 decimal places")
    private BigDecimal monthlyFee;

    @Column(name = "setup_fee", precision = 10, scale = 2)
    @DecimalMin(value = "0.0", message = "Setup fee must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Setup fee must have at most 6 digits and 2 decimal places")
    private BigDecimal setupFee;

    @Column(name = "billing_cycle", length = 20)
    @Pattern(regexp = "^(MONTHLY|QUARTERLY|ANNUALLY|CUSTOM)$", message = "Billing cycle must be MONTHLY, QUARTERLY, ANNUALLY, or CUSTOM")
    private String billingCycle;

    @Column(name = "next_billing_date")
    private OffsetDateTime nextBillingDate;

    @Column(name = "features_enabled", length = 1000)
    private String featuresEnabled; // JSON string of enabled features

    @Column(name = "custom_settings", length = 2000)
    private String customSettings; // JSON string of tenant-specific settings

    @Column(name = "timezone", length = 50)
    @Pattern(regexp = "^[A-Za-z_]+/[A-Za-z_]+$", message = "Timezone must be in format Region/City")
    private String timezone;

    @Column(name = "locale", length = 10)
    @Pattern(regexp = "^[a-z]{2}_[A-Z]{2}$", message = "Locale must be in format language_COUNTRY")
    private String locale;

    @Column(name = "currency", length = 3)
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a 3-letter ISO currency code")
    private String currency;

    @Column(name = "tax_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0", message = "Tax rate must be non-negative")
    @DecimalMax(value = "1.0", message = "Tax rate cannot exceed 100%")
    private BigDecimal taxRate;

    @Column(name = "is_test_tenant", nullable = false)
    @Builder.Default
    private boolean isTestTenant = false;

    @Column(name = "parent_tenant_id")
    private Long parentTenantId; // For franchise/sub-tenant relationships

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @Column(name = "suspended_at")
    private OffsetDateTime suspendedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    // Relationships
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TenantUser> tenantUsers = new HashSet<>();

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TenantConfiguration> configurations = new HashSet<>();

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TenantFeature> features = new HashSet<>();

    /**
     * Check if tenant is active and operational.
     * 
     * @return True if tenant is active
     */
    public boolean isActive() {
        return TenantStatus.ACTIVE.equals(status);
    }

    /**
     * Check if tenant is suspended.
     * 
     * @return True if tenant is suspended
     */
    public boolean isSuspended() {
        return TenantStatus.SUSPENDED.equals(status);
    }

    /**
     * Check if tenant is deleted.
     * 
     * @return True if tenant is deleted
     */
    public boolean isDeleted() {
        return TenantStatus.DELETED.equals(status);
    }

    /**
     * Check if tenant has reached user limit.
     * 
     * @param currentUserCount Current number of users
     * @return True if user limit reached
     */
    public boolean hasReachedUserLimit(int currentUserCount) {
        return maxUsers != null && currentUserCount >= maxUsers;
    }

    /**
     * Check if tenant has reached venue limit.
     * 
     * @param currentVenueCount Current number of venues
     * @return True if venue limit reached
     */
    public boolean hasReachedVenueLimit(int currentVenueCount) {
        return maxVenues != null && currentVenueCount >= maxVenues;
    }

    /**
     * Check if tenant has reached monthly game limit.
     * 
     * @param currentMonthGameCount Current month's game count
     * @return True if monthly game limit reached
     */
    public boolean hasReachedMonthlyGameLimit(int currentMonthGameCount) {
        return maxGamesPerMonth != null && currentMonthGameCount >= maxGamesPerMonth;
    }

    /**
     * Activate the tenant.
     */
    public void activate() {
        this.status = TenantStatus.ACTIVE;
        this.activatedAt = OffsetDateTime.now();
    }

    /**
     * Suspend the tenant.
     */
    public void suspend() {
        this.status = TenantStatus.SUSPENDED;
        this.suspendedAt = OffsetDateTime.now();
    }

    /**
     * Mark tenant as deleted.
     */
    public void markAsDeleted() {
        this.status = TenantStatus.DELETED;
        this.deletedAt = OffsetDateTime.now();
    }

    /**
     * Restore tenant from deleted status.
     */
    public void restore() {
        this.status = TenantStatus.ACTIVE;
        this.deletedAt = null;
    }
}
