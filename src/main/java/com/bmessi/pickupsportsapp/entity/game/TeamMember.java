package com.bmessi.pickupsportsapp.entity.game;

import com.bmessi.pickupsportsapp.entity.User;
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
 * Entity representing a user's membership in a specific team for a game.
 * 
 * <p>This entity serves as the association table between User and Team with additional
 * context about the player's role, position, payment status, and performance in that specific game.</p>
 * 
 * <p><strong>Core Features:</strong></p>
 * <ul>
 *   <li><strong>Team Assignment:</strong> Links users to teams with role specification</li>
 *   <li><strong>Position Management:</strong> Player positions and jersey numbers</li>
 *   <li><strong>Payment Tracking:</strong> Individual payment status and amounts</li>
 *   <li><strong>Game Performance:</strong> Check-in status, attendance, and ratings</li>
 * </ul>
 * 
 * <p><strong>Member Types:</strong></p>
 * <ul>
 *   <li><strong>ACTIVE:</strong> Core team member playing in starting lineup</li>
 *   <li><strong>SUBSTITUTE:</strong> Bench player available for substitution</li>
 *   <li><strong>CAPTAIN:</strong> Team leader (also marked as active)</li>
 *   <li><strong>CO_CAPTAIN:</strong> Assistant team leader</li>
 * </ul>
 * 
 * <p><strong>Payment Integration:</strong></p>
 * <ul>
 *   <li>Individual payment tracking per team member</li>
 *   <li>Support for payment splitting based on participation</li>
 *   <li>Refund handling for cancellations or no-shows</li>
 *   <li>Payment intent correlation for external payment processors</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 1.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "team_members", 
    indexes = {
        @Index(name = "idx_team_member_team", columnList = "team_id"),
        @Index(name = "idx_team_member_user", columnList = "user_id"),
        @Index(name = "idx_team_member_game_user", columnList = "team_id, user_id"),
        @Index(name = "idx_team_member_position", columnList = "preferred_position"),
        @Index(name = "idx_team_member_payment", columnList = "payment_status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_team_member", columnNames = {"team_id", "user_id"}),
        @UniqueConstraint(name = "uk_team_jersey", columnNames = {"team_id", "jersey_number"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Core Relationships
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Team Role & Position
    @Enumerated(EnumType.STRING)
    @Column(name = "member_type", nullable = false)
    @Builder.Default
    private MemberType memberType = MemberType.ACTIVE;

    @Size(max = 20, message = "Preferred position must not exceed 20 characters")
    @Column(name = "preferred_position", length = 20)
    private String preferredPosition; // "GK", "DEF", "MID", "ATT", "PG", "SG", etc.

    @Size(max = 20, message = "Assigned position must not exceed 20 characters")
    @Column(name = "assigned_position", length = 20)
    private String assignedPosition; // Actual position assigned for this game

    @Column(name = "is_substitute")
    @Builder.Default
    private boolean isSubstitute = false;

    @Min(value = 1, message = "Jersey number must be at least 1")
    @Max(value = 99, message = "Jersey number cannot exceed 99")
    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    // Payment & Financial Tracking
    @DecimalMin(value = "0.0", message = "Amount owed must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Amount owed must have proper precision")
    @Column(name = "amount_owed", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal amountOwed = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Amount paid must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Amount paid must have proper precision")
    @Column(name = "amount_paid", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Size(max = 100, message = "Payment intent ID must not exceed 100 characters")
    @Column(name = "payment_intent_id", length = 100)
    private String paymentIntentId; // External payment processor reference

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // Game Day Experience
    @CreationTimestamp
    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt;

    @Column(name = "checked_in_at")
    private OffsetDateTime checkedInAt; // When player checked in on game day

    @Column(name = "paid_at")
    private OffsetDateTime paidAt; // When payment was completed

    // Post-Game Tracking
    @Column(name = "attended")
    @Builder.Default
    private Boolean attended = false; // Did player actually show up?

    @Min(value = 1, message = "Performance rating must be at least 1")
    @Max(value = 5, message = "Performance rating cannot exceed 5")
    @Column(name = "performance_rating")
    private Integer performanceRating; // 1-5 rating post-game

    @Size(max = 500, message = "Feedback must not exceed 500 characters")
    @Column(name = "feedback", length = 500)
    private String feedback; // Player feedback about the game/team

    // Team Formation Context
    @Size(max = 100, message = "Assignment reason must not exceed 100 characters")
    @Column(name = "assignment_reason", length = 100)
    private String assignmentReason; // "SKILL_BALANCE", "MANUAL_SELECT", "FRIEND_GROUP"

    @Column(name = "manual_assignment")
    @Builder.Default
    private Boolean manualAssignment = false; // Was manually assigned vs algorithm

    /**
     * Enum for different types of team membership.
     */
    public enum MemberType {
        ACTIVE("Active team member"),
        SUBSTITUTE("Substitute player"),
        CAPTAIN("Team captain"),
        CO_CAPTAIN("Co-captain or assistant captain");

        private final String description;

        MemberType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Enum for payment status of team members.
     */
    public enum PaymentStatus {
        PENDING("Payment not yet completed"),
        PAID("Payment completed successfully"),
        FAILED("Payment failed"),
        REFUNDED("Payment was refunded"),
        WAIVED("Payment waived by organizer"),
        PARTIAL("Partial payment made");

        private final String description;

        PaymentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Helper Methods

    /**
     * Check if this member has paid their share.
     */
    public boolean hasCompletedPayment() {
        return paymentStatus == PaymentStatus.PAID || 
               paymentStatus == PaymentStatus.WAIVED ||
               (amountPaid.compareTo(amountOwed) >= 0);
    }

    /**
     * Calculate remaining amount to be paid.
     */
    public BigDecimal getRemainingAmount() {
        return amountOwed.subtract(amountPaid).max(BigDecimal.ZERO);
    }

    /**
     * Check if member is checked in for the game.
     */
    public boolean isCheckedIn() {
        return checkedInAt != null;
    }

    /**
     * Mark player as checked in.
     */
    public void checkIn() {
        this.checkedInAt = OffsetDateTime.now();
    }

    /**
     * Calculate payment completion percentage.
     */
    public double getPaymentCompletionPercentage() {
        if (amountOwed.compareTo(BigDecimal.ZERO) == 0) {
            return 100.0; // No payment required
        }
        return amountPaid.divide(amountOwed, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    /**
     * Check if this member can be assigned to a specific position.
     */
    public boolean canPlayPosition(String position) {
        if (position == null) return true;
        
        // If no preferred position specified, can play any position
        if (preferredPosition == null || preferredPosition.isBlank()) {
            return true;
        }
        
        // Check if position matches preferred position
        return preferredPosition.equalsIgnoreCase(position);
    }
}