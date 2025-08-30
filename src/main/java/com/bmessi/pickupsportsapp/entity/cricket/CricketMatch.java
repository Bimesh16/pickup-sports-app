package com.bmessi.pickupsportsapp.entity.cricket;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
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
 * Entity representing a cricket match with detailed scoring and statistics.
 * 
 * <p>This entity extends the basic Game functionality to support cricket-specific
 * features like innings, overs, detailed scoring, and comprehensive match statistics.</p>
 * 
 * <p><strong>Cricket Features:</strong></p>
 * <ul>
 *   <li><strong>Match Formats:</strong> T20, ODI, Test, T10, Street Cricket</li>
 *   <li><strong>Innings Management:</strong> Track batting and bowling for each team</li>
 *   <li><strong>Live Scoring:</strong> Ball-by-ball scoring and commentary</li>
 *   <li><strong>Player Statistics:</strong> Detailed batting, bowling, fielding stats</li>
 *   <li><strong>Match Analysis:</strong> Performance insights and match highlights</li>
 * </ul>
 * 
 * <p><strong>Supported Formats:</strong></p>
 * <ul>
 *   <li><strong>T20:</strong> 20 overs per side, 11 players each</li>
 *   <li><strong>T10:</strong> 10 overs per side, 11 players each</li>
 *   <li><strong>ODI:</strong> 50 overs per side, 11 players each</li>
 *   <li><strong>TEST:</strong> Unlimited overs, 2 innings each</li>
 *   <li><strong>STREET:</strong> Flexible format, 6-8 players per side</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "cricket_matches", indexes = {
        @Index(name = "idx_cricket_match_game", columnList = "game_id"),
        @Index(name = "idx_cricket_match_format", columnList = "match_format"),
        @Index(name = "idx_cricket_match_status", columnList = "match_status"),
        @Index(name = "idx_cricket_match_start_time", columnList = "match_start_time")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CricketMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the main game entity.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    /**
     * Cricket match format (T20, ODI, Test, etc.).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "match_format", nullable = false)
    private CricketFormat matchFormat;

    /**
     * Current status of the cricket match.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false)
    @Builder.Default
    private MatchStatus matchStatus = MatchStatus.NOT_STARTED;

    /**
     * Team that won the toss.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toss_winning_team_id")
    private Team tossWinningTeam;

    /**
     * Toss decision (bat or bowl first).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "toss_decision")
    private TossDecision tossDecision;

    /**
     * Current innings number (1st or 2nd innings).
     */
    @Min(value = 1, message = "Innings number must be at least 1")
    @Max(value = 4, message = "Innings number cannot exceed 4 (for Test matches)")
    @Column(name = "current_innings")
    @Builder.Default
    private Integer currentInnings = 1;

    /**
     * Team currently batting.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batting_team_id")
    private Team battingTeam;

    /**
     * Team currently bowling.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bowling_team_id")
    private Team bowlingTeam;

    /**
     * Current over number in the innings.
     */
    @Min(value = 0, message = "Over number cannot be negative")
    @Column(name = "current_over")
    @Builder.Default
    private Integer currentOver = 0;

    /**
     * Current ball number in the over (0-5 for standard, 0-7 for 8-ball overs).
     */
    @Min(value = 0, message = "Ball number cannot be negative")
    @Max(value = 7, message = "Ball number cannot exceed 7")
    @Column(name = "current_ball")
    @Builder.Default
    private Integer currentBall = 0;

    /**
     * Maximum overs per innings for this match format.
     */
    @Min(value = 1, message = "Max overs must be at least 1")
    @Max(value = 50, message = "Max overs cannot exceed 50 for limited overs")
    @Column(name = "max_overs_per_innings")
    private Integer maxOversPerInnings;

    /**
     * Match start time (actual, not scheduled).
     */
    @Column(name = "match_start_time")
    private OffsetDateTime matchStartTime;

    /**
     * Match end time.
     */
    @Column(name = "match_end_time")
    private OffsetDateTime matchEndTime;

    /**
     * Weather conditions during the match.
     */
    @Size(max = 200, message = "Weather conditions must not exceed 200 characters")
    @Column(name = "weather_conditions", length = 200)
    private String weatherConditions;

    /**
     * Pitch conditions and type.
     */
    @Size(max = 200, message = "Pitch conditions must not exceed 200 characters")
    @Column(name = "pitch_conditions", length = 200)
    private String pitchConditions;

    /**
     * Match umpire/referee.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "umpire_id")
    private User umpire;

    /**
     * Match scorer.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scorer_id")
    private User scorer;

    /**
     * Number of innings per team (1 for T20/ODI, 2 for Test).
     */
    @Min(value = 1, message = "Innings per team must be at least 1")
    @Max(value = 2, message = "Innings per team cannot exceed 2")
    @Column(name = "innings_per_team")
    @Builder.Default
    private Integer inningsPerTeam = 1;

    /**
     * Whether DLS method is applicable for this match.
     */
    @Column(name = "dls_applicable")
    @Builder.Default
    private Boolean dlsApplicable = false;

    /**
     * DLS target score if match is rain-affected.
     */
    @Min(value = 0, message = "DLS target cannot be negative")
    @Column(name = "dls_target")
    private Integer dlsTarget;

    /**
     * DLS overs remaining when target was set.
     */
    @Min(value = 0, message = "DLS overs cannot be negative")
    @Column(name = "dls_overs")
    private Integer dlsOvers;

    /**
     * Match result summary.
     */
    @Size(max = 500, message = "Match result must not exceed 500 characters")
    @Column(name = "match_result", length = 500)
    private String matchResult;

    /**
     * Winning team.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winning_team_id")
    private Team winningTeam;

    /**
     * Margin of victory (runs or wickets).
     */
    @Size(max = 100, message = "Victory margin must not exceed 100 characters")
    @Column(name = "victory_margin", length = 100)
    private String victoryMargin;

    /**
     * Man of the Match player.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "man_of_match_id")
    private User manOfTheMatch;

    /**
     * Match highlights or summary.
     */
    @Column(name = "match_highlights", columnDefinition = "TEXT")
    private String matchHighlights;

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
     * Innings data for this match.
     */
    @OneToMany(mappedBy = "cricketMatch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CricketInnings> innings = new ArrayList<>();

    // Helper methods

    /**
     * Start the match.
     */
    public void startMatch() {
        this.matchStatus = MatchStatus.IN_PROGRESS;
        this.matchStartTime = OffsetDateTime.now();
    }

    /**
     * Complete the match with result.
     */
    public void completeMatch(Team winner, String victoryMargin, User manOfTheMatch) {
        this.matchStatus = MatchStatus.COMPLETED;
        this.matchEndTime = OffsetDateTime.now();
        this.winningTeam = winner;
        this.victoryMargin = victoryMargin;
        this.manOfTheMatch = manOfTheMatch;
    }

    /**
     * Get current innings being played.
     */
    public CricketInnings getCurrentInnings() {
        return innings.stream()
                .filter(inning -> inning.getInningsStatus() == CricketInnings.InningsStatus.IN_PROGRESS)
                .findFirst()
                .orElse(null);
    }

    /**
     * Check if match is completed.
     */
    public Boolean isCompleted() {
        return matchStatus == MatchStatus.COMPLETED || 
               matchStatus == MatchStatus.ABANDONED ||
               matchStatus == MatchStatus.NO_RESULT;
    }

    /**
     * Get total match duration.
     */
    public Long getMatchDurationMinutes() {
        if (matchStartTime == null) return null;
        OffsetDateTime endTime = matchEndTime != null ? matchEndTime : OffsetDateTime.now();
        return java.time.Duration.between(matchStartTime, endTime).toMinutes();
    }

    /**
     * Cricket match formats.
     */
    public enum CricketFormat {
        T20("T20", 20, 1, "Twenty20 format - 20 overs per side"),
        T10("T10", 10, 1, "Ten10 format - 10 overs per side"),
        ODI("ODI", 50, 1, "One Day International - 50 overs per side"),
        TEST("Test", 90, 2, "Test match - unlimited overs, 2 innings each"),
        HUNDRED("Hundred", 20, 1, "The Hundred format - 100 balls per side"),
        STREET("Street", 6, 1, "Street cricket - flexible format");

        private final String displayName;
        private final Integer maxOvers;
        private final Integer inningsPerTeam;
        private final String description;

        CricketFormat(String displayName, Integer maxOvers, Integer inningsPerTeam, String description) {
            this.displayName = displayName;
            this.maxOvers = maxOvers;
            this.inningsPerTeam = inningsPerTeam;
            this.description = description;
        }

        public String getDisplayName() { return displayName; }
        public Integer getMaxOvers() { return maxOvers; }
        public Integer getInningsPerTeam() { return inningsPerTeam; }
        public String getDescription() { return description; }
    }

    /**
     * Cricket match status.
     */
    public enum MatchStatus {
        NOT_STARTED("Not Started"),
        TOSS("Toss"),
        IN_PROGRESS("In Progress"),
        RAIN_DELAY("Rain Delay"),
        LUNCH_BREAK("Lunch Break"),
        TEA_BREAK("Tea Break"),
        DRINKS_BREAK("Drinks Break"),
        INNINGS_BREAK("Innings Break"),
        COMPLETED("Completed"),
        ABANDONED("Abandoned"),
        NO_RESULT("No Result");

        private final String displayName;

        MatchStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    /**
     * Toss decision options.
     */
    public enum TossDecision {
        BAT_FIRST("Elected to Bat First"),
        BOWL_FIRST("Elected to Bowl First");

        private final String description;

        TossDecision(String description) {
            this.description = description;
        }

        public String getDescription() { return description; }
    }
}