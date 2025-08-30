package com.bmessi.pickupsportsapp.entity.nepal;

import com.bmessi.pickupsportsapp.entity.User;
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
import java.util.List;

/**
 * City Host entity for managing local hosts in different cities across Nepal.
 * 
 * <p>This is the core of our Nepal-wide expansion strategy using the "City Champions" model.
 * Each host is responsible for managing sports activities in their local area, building
 * venue partnerships, and growing the player community.</p>
 * 
 * <p><strong>Host Levels:</strong></p>
 * <ul>
 *   <li><strong>Bronze (Level 1):</strong> New hosts, 8-10% commission, up to 20 games/month</li>
 *   <li><strong>Silver (Level 2):</strong> Experienced hosts, 10-12% commission, up to 50 games/month</li>
 *   <li><strong>Gold (Level 3):</strong> Expert hosts, 12-15% commission, up to 100 games/month</li>
 *   <li><strong>Platinum (Level 4):</strong> Regional leaders, 15-18% commission, up to 200 games/month</li>
 *   <li><strong>Diamond (Level 5):</strong> National champions, 18-20% commission, unlimited games</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "city_hosts", indexes = {
    @Index(name = "idx_city_host_user", columnList = "user_id"),
    @Index(name = "idx_city_host_city", columnList = "city"),
    @Index(name = "idx_city_host_status", columnList = "status"),
    @Index(name = "idx_city_host_level", columnList = "host_level"),
    @Index(name = "idx_city_host_created_at", columnList = "created_at")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_city_host_user", columnNames = {"user_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityHost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User account associated with this city host.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * City where this host operates.
     */
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name must not exceed 100 characters")
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    /**
     * District within Nepal.
     */
    @Size(max = 100, message = "District name must not exceed 100 characters")
    @Column(name = "district", length = 100)
    private String district;

    /**
     * Province within Nepal.
     */
    @Size(max = 100, message = "Province name must not exceed 100 characters")
    @Column(name = "province", length = 100)
    private String province;

    /**
     * Current status of the host.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private HostStatus status = HostStatus.PENDING_VERIFICATION;

    /**
     * Commission rate as decimal (0.10 = 10%).
     */
    @DecimalMin(value = "0.0", message = "Commission rate must be non-negative")
    @DecimalMax(value = "1.0", message = "Commission rate cannot exceed 100%")
    @Column(name = "commission_rate")
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("0.10");

    /**
     * Performance score out of 5.0.
     */
    @DecimalMin(value = "0.0", message = "Performance score must be non-negative")
    @DecimalMax(value = "5.0", message = "Performance score cannot exceed 5.0")
    @Column(name = "performance_score")
    @Builder.Default
    private BigDecimal performanceScore = BigDecimal.ZERO;

    /**
     * Total number of games this host has managed.
     */
    @Min(value = 0, message = "Total games managed cannot be negative")
    @Column(name = "total_games_managed")
    @Builder.Default
    private Integer totalGamesManaged = 0;

    /**
     * Total revenue generated through this host.
     */
    @DecimalMin(value = "0.0", message = "Total revenue must be non-negative")
    @Column(name = "total_revenue_generated")
    @Builder.Default
    private BigDecimal totalRevenueGenerated = BigDecimal.ZERO;

    /**
     * Monthly bonus earned by the host.
     */
    @DecimalMin(value = "0.0", message = "Monthly bonus must be non-negative")
    @Column(name = "monthly_bonus")
    @Builder.Default
    private BigDecimal monthlyBonus = BigDecimal.ZERO;

    /**
     * Number of free games remaining for the host.
     */
    @Min(value = 0, message = "Free games remaining cannot be negative")
    @Column(name = "free_games_remaining")
    @Builder.Default
    private Integer freeGamesRemaining = 2; // New hosts get 2 free games

    /**
     * Host level (1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Diamond).
     */
    @Min(value = 1, message = "Host level must be at least 1")
    @Max(value = 5, message = "Host level cannot exceed 5")
    @Column(name = "host_level")
    @Builder.Default
    private Integer hostLevel = 1; // Start at Bronze level

    /**
     * Verification documents status.
     */
    @Column(name = "verification_documents", columnDefinition = "TEXT")
    private String verificationDocuments;

    /**
     * Whether the host has completed training.
     */
    @Column(name = "training_completed")
    @Builder.Default
    private Boolean trainingCompleted = false;

    /**
     * Last activity timestamp.
     */
    @Column(name = "last_activity")
    private OffsetDateTime lastActivity;

    /**
     * Additional notes about the host.
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Creation timestamp.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Last update timestamp.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Host activities (lazy loaded).
     */
    @OneToMany(mappedBy = "cityHost", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HostActivity> activities;

    /**
     * Venue partnerships (lazy loaded).
     */
    @OneToMany(mappedBy = "cityHost", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HostVenuePartnership> venuePartnerships;

    /**
     * Host status enumeration.
     */
    public enum HostStatus {
        PENDING_VERIFICATION("Pending Verification"),
        ACTIVE("Active"),
        SUSPENDED("Suspended"),
        TERMINATED("Terminated"),
        TRAINING("In Training");

        private final String displayName;

        HostStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // ==================== Business Logic Methods ====================

    /**
     * Check if host can manage more games based on level.
     */
    public boolean canManageGames() {
        return status == HostStatus.ACTIVE && 
               (freeGamesRemaining > 0 || totalGamesManaged < getMaxGamesForLevel());
    }

    /**
     * Get maximum games allowed based on host level.
     */
    public int getMaxGamesForLevel() {
        return switch (hostLevel) {
            case 1 -> 20;   // Bronze
            case 2 -> 50;   // Silver
            case 3 -> 100;  // Gold
            case 4 -> 200;  // Platinum
            case 5 -> 500;  // Diamond
            default -> 10;  // New hosts
        };
    }

    /**
     * Calculate commission for a game amount.
     */
    public BigDecimal calculateCommission(BigDecimal gameAmount) {
        if (commissionRate == null) {
            commissionRate = new BigDecimal("0.10");
        }
        return gameAmount.multiply(commissionRate);
    }

    /**
     * Update performance metrics after managing a game.
     */
    public void updatePerformanceMetrics(int gamesManaged, BigDecimal revenue) {
        this.totalGamesManaged = (this.totalGamesManaged != null ? this.totalGamesManaged : 0) + gamesManaged;
        this.totalRevenueGenerated = (this.totalRevenueGenerated != null ? this.totalRevenueGenerated : BigDecimal.ZERO).add(revenue);
        this.lastActivity = OffsetDateTime.now();
        
        // Update host level based on performance
        updateHostLevel();
    }

    /**
     * Update host level based on performance metrics.
     */
    private void updateHostLevel() {
        if (totalGamesManaged == null || totalRevenueGenerated == null) {
            this.hostLevel = 1;
            return;
        }

        if (totalGamesManaged >= 500 && totalRevenueGenerated.compareTo(new BigDecimal("100000")) >= 0) {
            this.hostLevel = 5; // Diamond
        } else if (totalGamesManaged >= 200 && totalRevenueGenerated.compareTo(new BigDecimal("50000")) >= 0) {
            this.hostLevel = 4; // Platinum
        } else if (totalGamesManaged >= 100 && totalRevenueGenerated.compareTo(new BigDecimal("25000")) >= 0) {
            this.hostLevel = 3; // Gold
        } else if (totalGamesManaged >= 50 && totalRevenueGenerated.compareTo(new BigDecimal("10000")) >= 0) {
            this.hostLevel = 2; // Silver
        } else {
            this.hostLevel = 1; // Bronze
        }
    }

    /**
     * Use a free game (decrements counter).
     */
    public boolean useFreeGame() {
        if (freeGamesRemaining != null && freeGamesRemaining > 0) {
            freeGamesRemaining--;
            return true;
        }
        return false;
    }

    /**
     * Add free games to host account (monthly bonus).
     */
    public void addFreeGames(int count) {
        this.freeGamesRemaining = (this.freeGamesRemaining != null ? this.freeGamesRemaining : 0) + count;
    }

    /**
     * Get host level name for display.
     */
    public String getHostLevelName() {
        return switch (hostLevel != null ? hostLevel : 1) {
            case 1 -> "Bronze";
            case 2 -> "Silver";
            case 3 -> "Gold";
            case 4 -> "Platinum";
            case 5 -> "Diamond";
            default -> "New";
        };
    }

    /**
     * Check if host is in good standing.
     */
    public boolean isInGoodStanding() {
        return status == HostStatus.ACTIVE && 
               performanceScore.compareTo(new BigDecimal("3.0")) >= 0;
    }
}