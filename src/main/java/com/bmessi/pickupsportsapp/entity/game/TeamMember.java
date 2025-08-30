package com.bmessi.pickupsportsapp.entity.game;

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
 * Entity representing a team member within a team for a specific game.
 * 
 * <p>This entity tracks the assignment of users to teams, including their roles,
 * positions, and participation details. It supports both regular players and
 * substitutes with different privileges and responsibilities.</p>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Position Management:</strong> Track preferred and assigned positions</li>
 *   <li><strong>Role Assignment:</strong> Distinguish between players, substitutes, captains</li>
 *   <li><strong>Performance Tracking:</strong> Individual contribution and ratings</li>
 *   <li><strong>Game Statistics:</strong> Attendance, participation metrics</li>
 * </ul>
 * 
 * <p><strong>Member Types:</strong></p>
 * <ul>
 *   <li><strong>Regular Player:</strong> Starting lineup member</li>
 *   <li><strong>Substitute:</strong> Available for rotation during game</li>
 *   <li><strong>Captain:</strong> Team leader with additional responsibilities</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "team_members", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"team_id", "user_id"})
       },
       indexes = {
           @Index(name = "idx_team_members_team", columnList = "team_id"),
           @Index(name = "idx_team_members_user", columnList = "user_id"),
           @Index(name = "idx_team_members_position", columnList = "preferred_position"),
           @Index(name = "idx_team_members_substitute", columnList = "is_substitute")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The team this member belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    /**
     * The user who is a member of this team.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Player's preferred position (sport-specific).
     * 
     * <p>Common positions by sport:</p>
     * <ul>
     *   <li><strong>Soccer:</strong> GK, DEF, MID, FWD</li>
     *   <li><strong>Basketball:</strong> PG, SG, SF, PF, C</li>
     *   <li><strong>Football:</strong> QB, RB, WR, TE, OL, DL, LB, DB</li>
     *   <li><strong>Volleyball:</strong> S, OH, MB, L, DS</li>
     * </ul>
     */
    @Size(max = 20, message = "Preferred position must not exceed 20 characters")
    @Column(name = "preferred_position", length = 20)
    private String preferredPosition;

    /**
     * Whether this member is a substitute player.
     */
    @Column(name = "is_substitute", nullable = false)
    @Builder.Default
    private Boolean isSubstitute = false;

    /**
     * Jersey number assigned to this player (if applicable).
     */
    @Min(value = 1, message = "Jersey number must be at least 1")
    @Max(value = 99, message = "Jersey number cannot exceed 99")
    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    /**
     * Member's role within the team.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "member_role", nullable = false, length = 15)
    @Builder.Default
    private MemberRole memberRole = MemberRole.PLAYER;

    /**
     * Whether this member has checked in for the game.
     */
    @Column(name = "checked_in", nullable = false)
    @Builder.Default
    private Boolean checkedIn = false;

    /**
     * Timestamp when the member checked in.
     */
    @Column(name = "checked_in_at")
    private OffsetDateTime checkedInAt;

    /**
     * Timestamp when the user joined this team.
     */
    @CreationTimestamp
    @Column(name = "joined_team_at", nullable = false, updatable = false)
    private OffsetDateTime joinedTeamAt;

    /**
     * Performance rating for this specific game (1-5 scale).
     * Filled after game completion.
     */
    @Min(value = 1, message = "Performance rating must be at least 1")
    @Max(value = 5, message = "Performance rating cannot exceed 5")
    @Column(name = "performance_rating")
    private Integer performanceRating;

    /**
     * Individual feedback or notes about this member's participation.
     */
    @Size(max = 500, message = "Member notes must not exceed 500 characters")
    @Column(name = "member_notes", length = 500)
    private String memberNotes;

    /**
     * Whether this member attended the actual game.
     */
    @Column(name = "attended")
    private Boolean attended;

    /**
     * Minutes played during the game (for rotation tracking).
     */
    @Min(value = 0, message = "Minutes played cannot be negative")
    @Column(name = "minutes_played")
    private Integer minutesPlayed;

    // Helper methods

    /**
     * Check in this member for the game.
     */
    public void checkIn() {
        this.checkedIn = true;
        this.checkedInAt = OffsetDateTime.now();
    }

    /**
     * Mark this member as attended with performance details.
     */
    public void recordAttendance(Integer rating, Integer minutesPlayed, String notes) {
        this.attended = true;
        this.performanceRating = rating;
        this.minutesPlayed = minutesPlayed;
        this.memberNotes = notes;
    }

    /**
     * Check if this member is the team captain.
     */
    public Boolean isCaptain() {
        return team != null && team.getCaptain() != null && 
               team.getCaptain().getId().equals(user.getId());
    }

    /**
     * Get display name for UI (handles captain designation).
     */
    public String getDisplayName() {
        String baseName = user.getUsername();
        if (isCaptain()) {
            baseName += " (C)";
        }
        if (isSubstitute) {
            baseName += " (SUB)";
        }
        return baseName;
    }

    /**
     * Get skill level numeric value for team balancing calculations.
     */
    public Double getSkillLevelNumeric() {
        String skillLevel = user.getSkillLevel();
        return switch (skillLevel != null ? skillLevel.toLowerCase() : "beginner") {
            case "pro" -> 4.0;
            case "advanced" -> 3.0;
            case "intermediate" -> 2.0;
            case "beginner" -> 1.0;
            default -> 1.0;
        };
    }

    /**
     * Member role within the team.
     */
    public enum MemberRole {
        /**
         * Regular team player.
         */
        PLAYER("Player", "Regular team member"),

        /**
         * Team captain with leadership responsibilities.
         */
        CAPTAIN("Captain", "Team leader and coordinator"),

        /**
         * Substitute player available for rotation.
         */
        SUBSTITUTE("Substitute", "Available for player rotation"),

        /**
         * Assistant captain helping team coordination.
         */
        VICE_CAPTAIN("Vice Captain", "Assistant team leader");

        private final String displayName;
        private final String description;

        MemberRole(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getDescription() {
            return description;
        }
    }
}