package com.bmessi.pickupsportsapp.entity.nepal;

import com.bmessi.pickupsportsapp.entity.Venue;
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

/**
 * Host Venue Partnership entity to manage relationships between City Champions and venue owners.
 * 
 * <p>This entity manages the business partnerships that are core to our Nepal expansion strategy.
 * Each partnership defines revenue sharing, performance metrics, and mutual obligations between
 * hosts and venue owners.</p>
 * 
 * <p><strong>Partnership Model:</strong></p>
 * <ul>
 *   <li><strong>Commission-Based:</strong> Platform takes 15-20%, venue gets 80-85%, host gets 5% bonus</li>
 *   <li><strong>Revenue Sharing:</strong> Mutual benefits with marketing support from platform</li>
 *   <li><strong>Performance Tracking:</strong> Both host and venue ratings for quality assurance</li>
 *   <li><strong>Exclusive Agreements:</strong> Priority bookings and special rates for platform users</li>
 * </ul>
 * 
 * <p><strong>Partnership Status:</strong></p>
 * <ul>
 *   <li><strong>PENDING:</strong> Partnership proposal under review</li>
 *   <li><strong>ACTIVE:</strong> Partnership is operational</li>
 *   <li><strong>SUSPENDED:</strong> Temporarily suspended due to issues</li>
 *   <li><strong>TERMINATED:</strong> Partnership ended</li>
 *   <li><strong>EXPIRED:</strong> Partnership term has expired</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "host_venue_partnerships", indexes = {
    @Index(name = "idx_host_venue_partnerships_host", columnList = "city_host_id"),
    @Index(name = "idx_host_venue_partnerships_venue", columnList = "venue_id"),
    @Index(name = "idx_host_venue_partnerships_status", columnList = "status")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_host_venue_partnership", columnNames = {"city_host_id", "venue_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostVenuePartnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * City host in this partnership.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_host_id", nullable = false)
    private CityHost cityHost;

    /**
     * Venue in this partnership.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    /**
     * Current partnership status.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PartnershipStatus status = PartnershipStatus.PENDING;

    /**
     * Commission rate for this specific partnership.
     */
    @DecimalMin(value = "0.0", message = "Commission rate must be non-negative")
    @DecimalMax(value = "1.0", message = "Commission rate cannot exceed 100%")
    @Column(name = "commission_rate")
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("0.10");

    /**
     * Partnership start date.
     */
    @Column(name = "partnership_start_date")
    private OffsetDateTime partnershipStartDate;

    /**
     * Partnership end date (null for indefinite).
     */
    @Column(name = "partnership_end_date")
    private OffsetDateTime partnershipEndDate;

    /**
     * Total games managed through this partnership.
     */
    @Min(value = 0, message = "Total games managed cannot be negative")
    @Column(name = "total_games_managed")
    @Builder.Default
    private Integer totalGamesManaged = 0;

    /**
     * Total revenue generated through this partnership.
     */
    @DecimalMin(value = "0.0", message = "Total revenue must be non-negative")
    @Column(name = "total_revenue_generated")
    @Builder.Default
    private BigDecimal totalRevenueGenerated = BigDecimal.ZERO;

    /**
     * Total commission earned by host from this partnership.
     */
    @DecimalMin(value = "0.0", message = "Host commission must be non-negative")
    @Column(name = "host_commission_earned")
    @Builder.Default
    private BigDecimal hostCommissionEarned = BigDecimal.ZERO;

    /**
     * Venue rating given by users (1.0 to 5.0).
     */
    @DecimalMin(value = "1.0", message = "Venue rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Venue rating cannot exceed 5.0")
    @Column(name = "venue_rating")
    private BigDecimal venueRating;

    /**
     * Host rating given by venue owner (1.0 to 5.0).
     */
    @DecimalMin(value = "1.0", message = "Host rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Host rating cannot exceed 5.0")
    @Column(name = "host_rating")
    private BigDecimal hostRating;

    /**
     * Partnership notes and comments.
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Partnership creation timestamp.
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
     * Partnership status enumeration.
     */
    public enum PartnershipStatus {
        PENDING("Pending"),
        ACTIVE("Active"),
        SUSPENDED("Suspended"),
        TERMINATED("Terminated"),
        EXPIRED("Expired");

        private final String displayName;

        PartnershipStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // ==================== Business Logic Methods ====================

    /**
     * Check if partnership is currently active.
     */
    public boolean isActive() {
        return status == PartnershipStatus.ACTIVE && 
               (partnershipEndDate == null || partnershipEndDate.isAfter(OffsetDateTime.now()));
    }

    /**
     * Calculate host commission for a specific game amount.
     */
    public BigDecimal calculateHostCommission(BigDecimal gameAmount) {
        if (commissionRate == null) {
            commissionRate = new BigDecimal("0.10");
        }
        return gameAmount.multiply(commissionRate);
    }

    /**
     * Update partnership metrics after a game.
     */
    public void updateMetrics(int gamesManaged, BigDecimal revenue) {
        this.totalGamesManaged = (this.totalGamesManaged != null ? this.totalGamesManaged : 0) + gamesManaged;
        this.totalRevenueGenerated = (this.totalRevenueGenerated != null ? this.totalRevenueGenerated : BigDecimal.ZERO).add(revenue);
        this.hostCommissionEarned = (this.hostCommissionEarned != null ? this.hostCommissionEarned : BigDecimal.ZERO)
                .add(calculateHostCommission(revenue));
    }

    /**
     * Check if partnership is performing well.
     */
    public boolean isPerformingWell() {
        boolean hasGoodRatings = (venueRating == null || venueRating.compareTo(new BigDecimal("4.0")) >= 0) &&
                                (hostRating == null || hostRating.compareTo(new BigDecimal("4.0")) >= 0);
        boolean hasRevenueFlow = totalRevenueGenerated != null && totalRevenueGenerated.compareTo(new BigDecimal("5000")) >= 0;
        return hasGoodRatings && hasRevenueFlow;
    }

    /**
     * Calculate partnership efficiency (revenue per game).
     */
    public BigDecimal getRevenuePerGame() {
        if (totalGamesManaged == null || totalGamesManaged == 0) {
            return BigDecimal.ZERO;
        }
        if (totalRevenueGenerated == null) {
            return BigDecimal.ZERO;
        }
        return totalRevenueGenerated.divide(new BigDecimal(totalGamesManaged), 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Get partnership duration in days.
     */
    public long getPartnershipDurationDays() {
        if (partnershipStartDate == null) {
            return 0;
        }
        OffsetDateTime endDate = partnershipEndDate != null ? partnershipEndDate : OffsetDateTime.now();
        return java.time.temporal.ChronoUnit.DAYS.between(partnershipStartDate, endDate);
    }

    /**
     * Check if partnership needs renewal.
     */
    public boolean needsRenewal() {
        if (partnershipEndDate == null) {
            return false; // Indefinite partnership
        }
        return partnershipEndDate.isBefore(OffsetDateTime.now().plusDays(30)); // Needs renewal within 30 days
    }
}