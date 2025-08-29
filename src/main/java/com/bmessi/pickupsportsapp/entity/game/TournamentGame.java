package com.bmessi.pickupsportsapp.entity.game;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Tournament game entity representing individual games within a tournament.
 */
@Entity
@Table(name = "tournament_games")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "game_number", nullable = false)
    private Integer gameNumber; // Sequential number within the tournament

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber; // Which round this game belongs to

    @Column(name = "bracket_position", length = 50)
    private String bracketPosition; // e.g., "A1", "B2", "Quarterfinal 1"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id")
    private TournamentTeam homeTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id")
    private TournamentTeam awayTeam;

    @Column(name = "scheduled_time")
    private OffsetDateTime scheduledTime;

    @Column(name = "actual_start_time")
    private OffsetDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private OffsetDateTime actualEndTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GameStatus status;

    @Column(name = "home_team_score")
    private Integer homeTeamScore;

    @Column(name = "away_team_score")
    private Integer awayTeamScore;

    @Column(name = "home_team_points")
    private Integer homeTeamPoints;

    @Column(name = "away_team_points")
    private Integer awayTeamPoints;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "venue_name", length = 100)
    private String venueName;

    @Column(name = "field_number", length = 20)
    private String fieldNumber;

    @Column(name = "referee_name", length = 100)
    private String refereeName;

    @Column(name = "weather_conditions", length = 100)
    private String weatherConditions;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "winner_id")
    private Long winnerId; // ID of the winning team

    @Column(name = "loser_id")
    private Long loserId; // ID of the losing team

    @Column(name = "is_tie", nullable = false)
    private Boolean isTie;

    @Column(name = "overtime_played", nullable = false)
    private Boolean overtimePlayed;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes;

    @Column(name = "penalty_shootout", nullable = false)
    private Boolean penaltyShootout;

    @Column(name = "home_team_penalties")
    private Integer homeTeamPenalties;

    @Column(name = "away_team_penalties")
    private Integer awayTeamPenalties;

    @Column(name = "attendance")
    private Integer attendance;

    @Column(name = "ticket_price", precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum GameStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED, FORFEITED
    }
}
