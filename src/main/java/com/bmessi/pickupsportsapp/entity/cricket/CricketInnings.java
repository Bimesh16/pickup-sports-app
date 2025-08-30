package com.bmessi.pickupsportsapp.entity.cricket;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Team;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing an innings in a cricket match.
 * 
 * <p>Each cricket match consists of multiple innings (1 or 2 per team depending on format).
 * This entity tracks the detailed scoring, partnerships, and statistics for each innings.</p>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Live Scoring:</strong> Ball-by-ball tracking with detailed statistics</li>
 *   <li><strong>Partnership Tracking:</strong> Monitor batsman partnerships and milestones</li>
 *   <li><strong>Bowling Analysis:</strong> Over-by-over bowling figures and economy rates</li>
 *   <li><strong>Milestone Alerts:</strong> Automatic detection of centuries, wickets, etc.</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "cricket_innings", indexes = {
        @Index(name = "idx_cricket_innings_match", columnList = "cricket_match_id"),
        @Index(name = "idx_cricket_innings_team", columnList = "batting_team_id"),
        @Index(name = "idx_cricket_innings_number", columnList = "innings_number"),
        @Index(name = "idx_cricket_innings_status", columnList = "innings_status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CricketInnings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The cricket match this innings belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cricket_match_id", nullable = false)
    private CricketMatch cricketMatch;

    /**
     * Innings number (1, 2, 3, 4 for Test matches).
     */
    @NotNull(message = "Innings number is required")
    @Min(value = 1, message = "Innings number must be at least 1")
    @Max(value = 4, message = "Innings number cannot exceed 4")
    @Column(name = "innings_number", nullable = false)
    private Integer inningsNumber;

    /**
     * Team batting in this innings.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batting_team_id", nullable = false)
    private Team battingTeam;

    /**
     * Team bowling in this innings.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bowling_team_id", nullable = false)
    private Team bowlingTeam;

    /**
     * Current status of this innings.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "innings_status", nullable = false)
    @Builder.Default
    private InningsStatus inningsStatus = InningsStatus.NOT_STARTED;

    /**
     * Total runs scored in this innings.
     */
    @Min(value = 0, message = "Runs cannot be negative")
    @Column(name = "total_runs")
    @Builder.Default
    private Integer totalRuns = 0;

    /**
     * Total wickets lost in this innings.
     */
    @Min(value = 0, message = "Wickets cannot be negative")
    @Max(value = 10, message = "Wickets cannot exceed 10")
    @Column(name = "total_wickets")
    @Builder.Default
    private Integer totalWickets = 0;

    /**
     * Overs completed in this innings.
     */
    @Min(value = 0, message = "Overs cannot be negative")
    @Column(name = "overs_completed")
    @Builder.Default
    private Integer oversCompleted = 0;

    /**
     * Balls completed in current over.
     */
    @Min(value = 0, message = "Balls cannot be negative")
    @Max(value = 7, message = "Balls in over cannot exceed 7")
    @Column(name = "balls_in_current_over")
    @Builder.Default
    private Integer ballsInCurrentOver = 0;

    /**
     * Target score to chase (for second innings).
     */
    @Min(value = 0, message = "Target cannot be negative")
    @Column(name = "target_score")
    private Integer targetScore;

    /**
     * Required run rate to achieve target.
     */
    @DecimalMin(value = "0.0", message = "Required run rate cannot be negative")
    @Column(name = "required_run_rate", precision = 5, scale = 2)
    private Double requiredRunRate;

    /**
     * Current run rate for this innings.
     */
    @DecimalMin(value = "0.0", message = "Current run rate cannot be negative")
    @Column(name = "current_run_rate", precision = 5, scale = 2)
    private Double currentRunRate;

    /**
     * Total extras in this innings.
     */
    @Min(value = 0, message = "Extras cannot be negative")
    @Column(name = "total_extras")
    @Builder.Default
    private Integer totalExtras = 0;

    /**
     * Breakdown of extras by type.
     */
    @Min(value = 0, message = "Byes cannot be negative")
    @Column(name = "byes")
    @Builder.Default
    private Integer byes = 0;

    @Min(value = 0, message = "Leg byes cannot be negative")
    @Column(name = "leg_byes")
    @Builder.Default
    private Integer legByes = 0;

    @Min(value = 0, message = "Wides cannot be negative")
    @Column(name = "wides")
    @Builder.Default
    private Integer wides = 0;

    @Min(value = 0, message = "No balls cannot be negative")
    @Column(name = "no_balls")
    @Builder.Default
    private Integer noBalls = 0;

    @Min(value = 0, message = "Penalty runs cannot be negative")
    @Column(name = "penalty_runs")
    @Builder.Default
    private Integer penaltyRuns = 0;

    /**
     * Innings start time.
     */
    @Column(name = "innings_start_time")
    private OffsetDateTime inningsStartTime;

    /**
     * Innings end time.
     */
    @Column(name = "innings_end_time")
    private OffsetDateTime inningsEndTime;

    /**
     * How the innings ended.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "innings_conclusion")
    private InningsConclusion inningsConclusion;

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
     * Individual player performances in this innings.
     */
    @OneToMany(mappedBy = "innings", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CricketPlayerPerformance> playerPerformances = new ArrayList<>();

    /**
     * Ball-by-ball data for this innings.
     */
    @OneToMany(mappedBy = "innings", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CricketBall> balls = new ArrayList<>();

    // Helper methods

    /**
     * Start this innings.
     */
    public void startInnings() {
        this.inningsStatus = InningsStatus.IN_PROGRESS;
        this.inningsStartTime = OffsetDateTime.now();
    }

    /**
     * End this innings.
     */
    public void endInnings(InningsConclusion conclusion) {
        this.inningsStatus = InningsStatus.COMPLETED;
        this.inningsEndTime = OffsetDateTime.now();
        this.inningsConclusion = conclusion;
    }

    /**
     * Add runs to the total.
     */
    public void addRuns(int runs, boolean isExtra) {
        this.totalRuns += runs;
        if (isExtra) {
            this.totalExtras += runs;
        }
        updateRunRate();
    }

    /**
     * Add a wicket.
     */
    public void addWicket() {
        this.totalWickets++;
        
        // Check if innings should end (all out)
        if (totalWickets >= 10) {
            endInnings(InningsConclusion.ALL_OUT);
        }
    }

    /**
     * Complete current over.
     */
    public void completeOver() {
        this.oversCompleted++;
        this.ballsInCurrentOver = 0;
        updateRunRate();
        
        // Check if innings should end (overs completed)
        if (oversCompleted >= cricketMatch.getMaxOversPerInnings()) {
            endInnings(InningsConclusion.OVERS_COMPLETED);
        }
    }

    /**
     * Update run rate calculations.
     */
    private void updateRunRate() {
        double totalBalls = oversCompleted * 6.0 + ballsInCurrentOver;
        if (totalBalls > 0) {
            this.currentRunRate = (totalRuns * 6.0) / totalBalls;
        }
        
        // Calculate required run rate if chasing
        if (targetScore != null && targetScore > 0) {
            double ballsRemaining = (cricketMatch.getMaxOversPerInnings() - oversCompleted) * 6.0 - ballsInCurrentOver;
            if (ballsRemaining > 0) {
                int runsRequired = targetScore - totalRuns;
                this.requiredRunRate = (runsRequired * 6.0) / ballsRemaining;
            }
        }
    }

    /**
     * Get current score display (e.g., "145/3").
     */
    public String getCurrentScore() {
        return totalRuns + "/" + totalWickets;
    }

    /**
     * Get overs display (e.g., "15.4").
     */
    public String getOversDisplay() {
        return oversCompleted + "." + ballsInCurrentOver;
    }

    /**
     * Innings status enumeration.
     */
    public enum InningsStatus {
        NOT_STARTED("Not Started"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        SUSPENDED("Suspended");

        private final String displayName;

        InningsStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    /**
     * How the innings concluded.
     */
    public enum InningsConclusion {
        ALL_OUT("All Out"),
        OVERS_COMPLETED("Overs Completed"),
        TARGET_ACHIEVED("Target Achieved"),
        DECLARED("Declared"),
        ABANDONED("Abandoned"),
        RAIN_AFFECTED("Rain Affected"),
        TIME_UP("Time Up");

        private final String description;

        InningsConclusion(String description) {
            this.description = description;
        }

        public String getDescription() { return description; }
    }
}