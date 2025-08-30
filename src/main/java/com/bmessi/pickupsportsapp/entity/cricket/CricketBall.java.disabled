package com.bmessi.pickupsportsapp.entity.cricket;

import com.bmessi.pickupsportsapp.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Entity representing individual ball deliveries in a cricket match.
 * 
 * <p>This entity provides ball-by-ball tracking for comprehensive cricket scoring
 * and analysis. Each delivery is recorded with detailed information about the
 * outcome, participants, and match situation.</p>
 * 
 * <p><strong>Features:</strong></p>
 * <ul>
 *   <li><strong>Ball-by-Ball Tracking:</strong> Complete delivery details</li>
 *   <li><strong>Live Commentary:</strong> Real-time match updates</li>
 *   <li><strong>Statistical Analysis:</strong> Performance insights per delivery</li>
 *   <li><strong>Match Reconstruction:</strong> Replay entire innings ball-by-ball</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "cricket_balls", indexes = {
        @Index(name = "idx_cricket_balls_innings", columnList = "innings_id"),
        @Index(name = "idx_cricket_balls_over_ball", columnList = "over_number, ball_number"),
        @Index(name = "idx_cricket_balls_bowler", columnList = "bowler_id"),
        @Index(name = "idx_cricket_balls_batsman", columnList = "batsman_on_strike_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CricketBall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The innings this ball belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "innings_id", nullable = false)
    private CricketInnings innings;

    /**
     * Over number in the innings.
     */
    @NotNull(message = "Over number is required")
    @Min(value = 1, message = "Over number must be at least 1")
    @Column(name = "over_number", nullable = false)
    private Integer overNumber;

    /**
     * Ball number within the over (1-6 for standard, 1-8 for 8-ball overs).
     */
    @NotNull(message = "Ball number is required")
    @Min(value = 1, message = "Ball number must be at least 1")
    @Max(value = 8, message = "Ball number cannot exceed 8")
    @Column(name = "ball_number", nullable = false)
    private Integer ballNumber;

    /**
     * Bowler for this delivery.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bowler_id", nullable = false)
    private User bowler;

    /**
     * Batsman on strike for this delivery.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batsman_on_strike_id", nullable = false)
    private User batsmanOnStrike;

    /**
     * Batsman at non-striker's end.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batsman_non_strike_id")
    private User batsmanNonStrike;

    /**
     * Runs scored off this delivery (including extras).
     */
    @Min(value = 0, message = "Runs cannot be negative")
    @Max(value = 6, message = "Runs off single ball cannot exceed 6")
    @Column(name = "runs_off_ball")
    @Builder.Default
    private Integer runsOffBall = 0;

    /**
     * Type of delivery outcome.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ball_outcome", nullable = false)
    private BallOutcome ballOutcome;

    /**
     * Whether this ball resulted in a wicket.
     */
    @Column(name = "is_wicket")
    @Builder.Default
    private Boolean isWicket = false;

    /**
     * Type of wicket (if applicable).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "wicket_type")
    private CricketPlayerPerformance.DismissalType wicketType;

    /**
     * Fielder involved in dismissal (if applicable).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fielder_id")
    private User fielder;

    /**
     * Whether this is an extra delivery (wide, no-ball).
     */
    @Column(name = "is_extra")
    @Builder.Default
    private Boolean isExtra = false;

    /**
     * Type of extra (if applicable).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "extra_type")
    private ExtraType extraType;

    /**
     * Shot played by batsman.
     */
    @Size(max = 50, message = "Shot type must not exceed 50 characters")
    @Column(name = "shot_type", length = 50)
    private String shotType;

    /**
     * Area where the ball was hit (for field analysis).
     */
    @Size(max = 50, message = "Shot direction must not exceed 50 characters")
    @Column(name = "shot_direction", length = 50)
    private String shotDirection;

    /**
     * Ball speed (in kmph).
     */
    @DecimalMin(value = "0.0", message = "Ball speed cannot be negative")
    @DecimalMax(value = "200.0", message = "Ball speed cannot exceed 200 kmph")
    @Column(name = "ball_speed_kmph", precision = 5, scale = 2)
    private Double ballSpeedKmph;

    /**
     * Commentary for this delivery.
     */
    @Size(max = 500, message = "Commentary must not exceed 500 characters")
    @Column(name = "commentary", length = 500)
    private String commentary;

    /**
     * Time when this ball was bowled.
     */
    @CreationTimestamp
    @Column(name = "ball_time", nullable = false, updatable = false)
    private OffsetDateTime ballTime;

    /**
     * Ball outcome types.
     */
    public enum BallOutcome {
        DOT_BALL("Dot Ball", "No runs scored"),
        SINGLE("Single", "1 run scored"),
        DOUBLE("Double", "2 runs scored"),
        TRIPLE("Triple", "3 runs scored"),
        FOUR("Four", "Boundary - 4 runs"),
        SIX("Six", "Maximum - 6 runs"),
        WICKET("Wicket", "Batsman dismissed"),
        WIDE("Wide", "Wide delivery"),
        NO_BALL("No Ball", "Illegal delivery"),
        BYE("Bye", "Runs without bat contact"),
        LEG_BYE("Leg Bye", "Runs off batsman's body");

        private final String displayName;
        private final String description;

        BallOutcome(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
    }

    /**
     * Types of extras in cricket.
     */
    public enum ExtraType {
        WIDE("Wide", "Ball outside batsman's reach"),
        NO_BALL("No Ball", "Illegal delivery"),
        BYE("Bye", "Ball passes batsman and keeper"),
        LEG_BYE("Leg Bye", "Ball hits batsman's body"),
        PENALTY("Penalty", "Penalty runs awarded");

        private final String displayName;
        private final String description;

        ExtraType(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
    }

    // ===== HELPER METHODS =====

    /**
     * Get display string for this ball (e.g., "4", "W", "1").
     */
    public String getDisplayString() {
        if (isWicket) return "W";
        if (isExtra) {
            return switch (extraType) {
                case WIDE -> "Wd";
                case NO_BALL -> "Nb";
                case BYE -> "B";
                case LEG_BYE -> "Lb";
                case PENALTY -> "P";
                default -> String.valueOf(runsOffBall);
            };
        }
        return String.valueOf(runsOffBall);
    }

    /**
     * Get over and ball display (e.g., "15.4").
     */
    public String getOverBallDisplay() {
        return overNumber + "." + ballNumber;
    }

    /**
     * Check if this ball ends the over.
     */
    public boolean endsOver() {
        return ballNumber >= 6 && !isExtra; // Standard 6-ball over, extras don't count
    }
}