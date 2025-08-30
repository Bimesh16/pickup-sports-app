package com.bmessi.pickupsportsapp.entity.cricket;

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

/**
 * Entity tracking individual player performance in a cricket innings.
 * 
 * <p>This entity captures comprehensive cricket statistics for each player's
 * contribution in batting, bowling, and fielding during a specific innings.</p>
 * 
 * <p><strong>Statistics Tracked:</strong></p>
 * <ul>
 *   <li><strong>Batting:</strong> Runs, balls faced, boundaries, strike rate, dismissal</li>
 *   <li><strong>Bowling:</strong> Overs, maidens, runs conceded, wickets, economy rate</li>
 *   <li><strong>Fielding:</strong> Catches, run-outs, stumpings, dropped catches</li>
 *   <li><strong>Performance:</strong> Impact rating, player of the match consideration</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "cricket_player_performance", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"innings_id", "player_id"})
       },
       indexes = {
           @Index(name = "idx_cricket_perf_innings", columnList = "innings_id"),
           @Index(name = "idx_cricket_perf_player", columnList = "player_id"),
           @Index(name = "idx_cricket_perf_role", columnList = "player_role")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CricketPlayerPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The innings this performance belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "innings_id", nullable = false)
    private CricketInnings innings;

    /**
     * The player whose performance is being tracked.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    /**
     * Player's role in this innings (batsman, bowler, wicket-keeper, etc.).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "player_role", nullable = false)
    private PlayerRole playerRole;

    // ===== BATTING STATISTICS =====

    /**
     * Runs scored by the batsman.
     */
    @Min(value = 0, message = "Runs cannot be negative")
    @Column(name = "runs_scored")
    @Builder.Default
    private Integer runsScored = 0;

    /**
     * Balls faced by the batsman.
     */
    @Min(value = 0, message = "Balls faced cannot be negative")
    @Column(name = "balls_faced")
    @Builder.Default
    private Integer ballsFaced = 0;

    /**
     * Number of 4s hit by the batsman.
     */
    @Min(value = 0, message = "Fours cannot be negative")
    @Column(name = "fours_hit")
    @Builder.Default
    private Integer foursHit = 0;

    /**
     * Number of 6s hit by the batsman.
     */
    @Min(value = 0, message = "Sixes cannot be negative")
    @Column(name = "sixes_hit")
    @Builder.Default
    private Integer sixesHit = 0;

    /**
     * How the batsman was dismissed (if out).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "dismissal_type")
    private DismissalType dismissalType;

    /**
     * Bowler who dismissed the batsman (if applicable).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dismissed_by_bowler_id")
    private User dismissedByBowler;

    /**
     * Fielder who assisted in dismissal (if applicable).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dismissed_by_fielder_id")
    private User dismissedByFielder;

    /**
     * Whether the batsman is currently not out.
     */
    @Column(name = "is_not_out")
    @Builder.Default
    private Boolean isNotOut = true;

    // ===== BOWLING STATISTICS =====

    /**
     * Overs bowled (including partial overs).
     */
    @DecimalMin(value = "0.0", message = "Overs bowled cannot be negative")
    @DecimalMax(value = "50.0", message = "Overs bowled cannot exceed 50")
    @Column(name = "overs_bowled", precision = 4, scale = 1)
    @Builder.Default
    private Double oversBowled = 0.0;

    /**
     * Maiden overs bowled.
     */
    @Min(value = 0, message = "Maiden overs cannot be negative")
    @Column(name = "maiden_overs")
    @Builder.Default
    private Integer maidenOvers = 0;

    /**
     * Runs conceded while bowling.
     */
    @Min(value = 0, message = "Runs conceded cannot be negative")
    @Column(name = "runs_conceded")
    @Builder.Default
    private Integer runsConceded = 0;

    /**
     * Wickets taken while bowling.
     */
    @Min(value = 0, message = "Wickets taken cannot be negative")
    @Max(value = 10, message = "Wickets taken cannot exceed 10")
    @Column(name = "wickets_taken")
    @Builder.Default
    private Integer wicketsTaken = 0;

    /**
     * Wides bowled.
     */
    @Min(value = 0, message = "Wides cannot be negative")
    @Column(name = "wides_bowled")
    @Builder.Default
    private Integer widesBowled = 0;

    /**
     * No balls bowled.
     */
    @Min(value = 0, message = "No balls cannot be negative")
    @Column(name = "no_balls_bowled")
    @Builder.Default
    private Integer noBallsBowled = 0;

    // ===== FIELDING STATISTICS =====

    /**
     * Catches taken while fielding.
     */
    @Min(value = 0, message = "Catches cannot be negative")
    @Column(name = "catches_taken")
    @Builder.Default
    private Integer catchesTaken = 0;

    /**
     * Run-outs affected (direct hits or assists).
     */
    @Min(value = 0, message = "Run-outs cannot be negative")
    @Column(name = "run_outs")
    @Builder.Default
    private Integer runOuts = 0;

    /**
     * Stumpings (for wicket-keepers).
     */
    @Min(value = 0, message = "Stumpings cannot be negative")
    @Column(name = "stumpings")
    @Builder.Default
    private Integer stumpings = 0;

    /**
     * Dropped catches.
     */
    @Min(value = 0, message = "Dropped catches cannot be negative")
    @Column(name = "dropped_catches")
    @Builder.Default
    private Integer droppedCatches = 0;

    // ===== CALCULATED FIELDS =====

    /**
     * Batting strike rate (runs per 100 balls).
     */
    @DecimalMin(value = "0.0", message = "Strike rate cannot be negative")
    @Column(name = "strike_rate", precision = 6, scale = 2)
    private Double strikeRate;

    /**
     * Bowling economy rate (runs per over).
     */
    @DecimalMin(value = "0.0", message = "Economy rate cannot be negative")
    @Column(name = "economy_rate", precision = 5, scale = 2)
    private Double economyRate;

    /**
     * Overall performance rating for this innings (1-10 scale).
     */
    @Min(value = 1, message = "Performance rating must be at least 1")
    @Max(value = 10, message = "Performance rating cannot exceed 10")
    @Column(name = "performance_rating")
    private Integer performanceRating;

    /**
     * Impact score considering all-around performance.
     */
    @DecimalMin(value = "0.0", message = "Impact score cannot be negative")
    @Column(name = "impact_score", precision = 5, scale = 2)
    private Double impactScore;

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

    // ===== CALCULATED METHODS =====

    /**
     * Calculate and update batting strike rate.
     */
    public void calculateStrikeRate() {
        if (ballsFaced > 0) {
            this.strikeRate = (runsScored * 100.0) / ballsFaced;
        }
    }

    /**
     * Calculate and update bowling economy rate.
     */
    public void calculateEconomyRate() {
        if (oversBowled > 0) {
            this.economyRate = runsConceded / oversBowled;
        }
    }

    /**
     * Calculate overall impact score based on contribution.
     */
    public void calculateImpactScore() {
        double battingImpact = 0.0;
        double bowlingImpact = 0.0;
        double fieldingImpact = 0.0;

        // Batting impact
        if (ballsFaced > 0) {
            battingImpact = (runsScored * 1.0) + (foursHit * 0.5) + (sixesHit * 1.0);
            if (strikeRate != null && strikeRate > 100) {
                battingImpact *= 1.2; // Bonus for high strike rate
            }
        }

        // Bowling impact
        if (oversBowled > 0) {
            bowlingImpact = (wicketsTaken * 3.0) + (maidenOvers * 2.0);
            if (economyRate != null && economyRate < 6.0) {
                bowlingImpact *= 1.3; // Bonus for economical bowling
            }
        }

        // Fielding impact
        fieldingImpact = (catchesTaken * 2.0) + (runOuts * 3.0) + (stumpings * 2.5) - (droppedCatches * 1.0);

        this.impactScore = battingImpact + bowlingImpact + fieldingImpact;
    }

    /**
     * Check if this is a milestone performance.
     */
    public boolean isMilestonePerformance() {
        // Batting milestones
        if (runsScored >= 100) return true; // Century
        if (runsScored >= 50) return true;  // Half-century
        
        // Bowling milestones  
        if (wicketsTaken >= 5) return true; // Five-wicket haul
        if (wicketsTaken >= 3) return true; // Three-wicket haul
        
        // Fielding milestones
        if (catchesTaken >= 3) return true; // Three catches
        
        return false;
    }

    /**
     * Player roles in cricket.
     */
    public enum PlayerRole {
        BATSMAN("Batsman", "Specialist batsman"),
        BOWLER("Bowler", "Specialist bowler"),
        ALL_ROUNDER("All-Rounder", "Batting and bowling specialist"),
        WICKET_KEEPER("Wicket-Keeper", "Wicket-keeper batsman"),
        CAPTAIN("Captain", "Team captain"),
        FIELDER("Fielder", "Specialist fielder");

        private final String displayName;
        private final String description;

        PlayerRole(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
    }

    /**
     * Types of dismissals in cricket.
     */
    public enum DismissalType {
        BOWLED("Bowled", "b"),
        CAUGHT("Caught", "c"),
        LBW("LBW", "lbw"),
        RUN_OUT("Run Out", "run out"),
        STUMPED("Stumped", "st"),
        HIT_WICKET("Hit Wicket", "hit wicket"),
        HANDLED_BALL("Handled Ball", "handled ball"),
        OBSTRUCTING_FIELD("Obstructing Field", "obstructing field"),
        HIT_BALL_TWICE("Hit Ball Twice", "hit ball twice"),
        TIMED_OUT("Timed Out", "timed out"),
        RETIRED_HURT("Retired Hurt", "retired hurt"),
        RETIRED_NOT_OUT("Retired Not Out", "retired not out");

        private final String displayName;
        private final String shortForm;

        DismissalType(String displayName, String shortForm) {
            this.displayName = displayName;
            this.shortForm = shortForm;
        }

        public String getDisplayName() { return displayName; }
        public String getShortForm() { return shortForm; }
    }
}