package com.bmessi.pickupsportsapp.entity.game;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.Sport;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

/**
 * Tournament entity for organizing multiple games in a competitive format.
 */
@Entity
@Table(name = "tournaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Enumerated(EnumType.STRING)
    @Column(name = "tournament_type", nullable = false)
    private TournamentType tournamentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TournamentStatus status;

    @Column(name = "max_teams", nullable = false)
    private Integer maxTeams;

    @Column(name = "min_teams", nullable = false)
    private Integer minTeams;

    @Column(name = "team_size", nullable = false)
    private Integer teamSize;

    @Column(name = "entry_fee", precision = 10, scale = 2)
    private BigDecimal entryFee;

    @Column(name = "prize_pool", precision = 10, scale = 2)
    private BigDecimal prizePool;

    @Column(name = "registration_deadline", nullable = false)
    private OffsetDateTime registrationDeadline;

    @Column(name = "start_date", nullable = false)
    private OffsetDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private OffsetDateTime endDate;

    @Column(name = "rules", length = 2000)
    private String rules;

    @Column(name = "bracket_structure", length = 100)
    private String bracketStructure; // e.g., "single_elimination", "double_elimination", "round_robin"

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval;

    @Column(name = "max_spectators")
    private Integer maxSpectators;

    @Column(name = "spectator_fee", precision = 10, scale = 2)
    private BigDecimal spectatorFee;

    @Column(name = "weather_dependent", nullable = false)
    private Boolean weatherDependent;

    @Column(name = "weather_policy", length = 500)
    private String weatherPolicy;

    @Column(name = "cancellation_policy", length = 500)
    private String cancellationPolicy;

    @Column(name = "equipment_provided", length = 500)
    private String equipmentProvided;

    @Column(name = "equipment_required", length = 500)
    private String equipmentRequired;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TournamentTeam> teams;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TournamentGame> games;

    public enum TournamentType {
        SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN, SWISS_SYSTEM, CUSTOM
    }

    public enum TournamentStatus {
        DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
