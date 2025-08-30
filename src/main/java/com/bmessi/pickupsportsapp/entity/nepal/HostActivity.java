package com.bmessi.pickupsportsapp.entity.nepal;

import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.game.Game;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Host Activity entity to track all actions and performance of City Champions.
 * 
 * <p>This entity provides comprehensive audit trail and performance tracking
 * for hosts, enabling commission calculations, performance reviews, and
 * business intelligence for the Nepal expansion strategy.</p>
 * 
 * <p><strong>Activity Types:</strong></p>
 * <ul>
 *   <li><strong>GAME_CREATED:</strong> Host created a new game</li>
 *   <li><strong>GAME_MANAGED:</strong> Host successfully managed a game</li>
 *   <li><strong>VENUE_PARTNERSHIP:</strong> Host established a new venue partnership</li>
 *   <li><strong>PLAYER_ACQUISITION:</strong> Host recruited new players</li>
 *   <li><strong>REVENUE_GENERATED:</strong> Host generated revenue for platform</li>
 *   <li><strong>TRAINING_COMPLETED:</strong> Host completed training modules</li>
 *   <li><strong>PERFORMANCE_REVIEW:</strong> Host performance was reviewed</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "host_activities", indexes = {
    @Index(name = "idx_host_activity_host", columnList = "city_host_id"),
    @Index(name = "idx_host_activity_type", columnList = "activity_type"),
    @Index(name = "idx_host_activity_created_at", columnList = "created_at"),
    @Index(name = "idx_host_activity_game", columnList = "game_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The city host who performed this activity.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_host_id", nullable = false)
    private CityHost cityHost;

    /**
     * Type of activity performed.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 50)
    private ActivityType activityType;

    /**
     * Detailed description of the activity.
     */
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Game associated with this activity (if applicable).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    /**
     * Venue associated with this activity (if applicable).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    /**
     * Revenue generated from this activity.
     */
    @DecimalMin(value = "0.0", message = "Revenue generated must be non-negative")
    @Column(name = "revenue_generated")
    @Builder.Default
    private BigDecimal revenueGenerated = BigDecimal.ZERO;

    /**
     * Commission earned by the host from this activity.
     */
    @DecimalMin(value = "0.0", message = "Commission earned must be non-negative")
    @Column(name = "commission_earned")
    @Builder.Default
    private BigDecimal commissionEarned = BigDecimal.ZERO;

    /**
     * Number of players managed in this activity.
     */
    @Min(value = 0, message = "Players managed cannot be negative")
    @Column(name = "players_managed")
    private Integer playersManaged;

    /**
     * Rating received for this activity (1.0 to 5.0).
     */
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    @Column(name = "rating_received")
    private BigDecimal ratingReceived;

    /**
     * Activity timestamp.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Activity type enumeration.
     */
    public enum ActivityType {
        GAME_CREATED("Game Created"),
        GAME_MANAGED("Game Managed"),
        VENUE_PARTNERSHIP("Venue Partnership"),
        PLAYER_ACQUISITION("Player Acquisition"),
        REVENUE_GENERATED("Revenue Generated"),
        TRAINING_COMPLETED("Training Completed"),
        PERFORMANCE_REVIEW("Performance Review");

        private final String displayName;

        ActivityType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // ==================== Business Logic Methods ====================

    /**
     * Check if this activity generated commission.
     */
    public boolean hasCommission() {
        return commissionEarned != null && commissionEarned.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Check if this activity was rated.
     */
    public boolean hasRating() {
        return ratingReceived != null;
    }

    /**
     * Get commission rate used for this activity.
     */
    public BigDecimal getCommissionRate() {
        if (revenueGenerated == null || revenueGenerated.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (commissionEarned == null || commissionEarned.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return commissionEarned.divide(revenueGenerated, 4, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Check if this is a high-value activity.
     */
    public boolean isHighValueActivity() {
        return revenueGenerated != null && revenueGenerated.compareTo(new BigDecimal("1000")) >= 0;
    }

    /**
     * Check if this activity received excellent rating.
     */
    public boolean hasExcellentRating() {
        return ratingReceived != null && ratingReceived.compareTo(new BigDecimal("4.5")) >= 0;
    }
}