package com.bmessi.pickupsportsapp.entity.game;

import com.bmessi.pickupsportsapp.entity.User;
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
 * Tournament team entity representing a team participating in a tournament.
 */
@Entity
@Table(name = "tournament_teams")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;

    @Column(name = "team_description", length = 500)
    private String teamDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tournament_team_members",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members;

    @Column(name = "max_members", nullable = false)
    private Integer maxMembers;

    @Column(name = "current_members", nullable = false)
    private Integer currentMembers;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TeamStatus status;

    @Column(name = "entry_fee_paid", nullable = false)
    private Boolean entryFeePaid;

    @Column(name = "entry_fee_amount", precision = 10, scale = 2)
    private BigDecimal entryFeeAmount;

    @Column(name = "payment_intent_id", length = 100)
    private String paymentIntentId;

    @Column(name = "seed_position")
    private Integer seedPosition;

    @Column(name = "final_rank")
    private Integer finalRank;

    @Column(name = "wins", nullable = false)
    private Integer wins;

    @Column(name = "losses", nullable = false)
    private Integer losses;

    @Column(name = "ties", nullable = false)
    private Integer ties;

    @Column(name = "points_for")
    private Integer pointsFor;

    @Column(name = "points_against")
    private Integer pointsAgainst;

    @Column(name = "registration_date", nullable = false)
    private OffsetDateTime registrationDate;

    @Column(name = "approved_date")
    private OffsetDateTime approvedDate;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum TeamStatus {
        PENDING_APPROVAL, APPROVED, REJECTED, ACTIVE, ELIMINATED, WITHDRAWN
    }
}
