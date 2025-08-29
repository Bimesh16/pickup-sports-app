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
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a team within a game.
 * 
 * <p>Teams are automatically formed when games require team-based play (e.g., 5v5 soccer).
 * The system supports intelligent team balancing based on skill levels, preferences,
 * and social connections to ensure fair and enjoyable games.</p>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Auto-Formation:</strong> Intelligent team creation from game participants</li>
 *   <li><strong>Skill Balancing:</strong> Equal distribution of skill levels across teams</li>
 *   <li><strong>Captain Assignment:</strong> Automatic or manual team leader selection</li>
 *   <li><strong>Team Identity:</strong> Colors, names, and visual identification</li>
 * </ul>
 * 
 * <p><strong>Formation Strategies:</strong></p>
 * <ul>
 *   <li><strong>SKILL_BALANCED:</strong> Distribute players evenly by skill level</li>
 *   <li><strong>RANDOM:</strong> Random assignment for casual games</li>
 *   <li><strong>MANUAL:</strong> Captain or owner manually assigns teams</li>
 *   <li><strong>FRIEND_GROUPS:</strong> Keep friend groups together when possible</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "teams", indexes = {
        @Index(name = "idx_teams_game_id", columnList = "game_id"),
        @Index(name = "idx_teams_captain", columnList = "captain_id"),
        @Index(name = "idx_teams_number", columnList = "team_number"),
        @Index(name = "idx_teams_balanced", columnList = "is_balanced")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The game this team belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    /**
     * Display name for the team (e.g., "Team A", "Red Team", "Lions").
     */
    @NotBlank(message = "Team name is required")
    @Size(max = 50, message = "Team name must not exceed 50 characters")
    @Column(name = "team_name", nullable = false, length = 50)
    private String teamName;

    /**
     * Team color in HEX format for visual identification.
     */
    @Pattern(regexp = "^#[A-Fa-f0-9]{6}$", message = "Team color must be a valid HEX color code")
    @Column(name = "team_color", length = 7)
    private String teamColor;

    /**
     * Team number within the game (1, 2, 3, etc.).
     */
    @NotNull(message = "Team number is required")
    @Min(value = 1, message = "Team number must be at least 1")
    @Max(value = 10, message = "Team number cannot exceed 10")
    @Column(name = "team_number", nullable = false)
    private Integer teamNumber;

    /**
     * Team captain responsible for team coordination.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id")
    private User captain;

    /**
     * Calculated average skill level of team members.
     */
    @DecimalMin(value = "0.0", message = "Average skill level cannot be negative")
    @DecimalMax(value = "5.0", message = "Average skill level cannot exceed 5.0")
    @Column(name = "average_skill_level", precision = 3, scale = 2)
    private Double averageSkillLevel;

    /**
     * Total experience points of all team members.
     */
    @Min(value = 0, message = "Total experience cannot be negative")
    @Column(name = "total_experience")
    @Builder.Default
    private Integer totalExperience = 0;

    /**
     * Timestamp when the team was formed.
     */
    @CreationTimestamp
    @Column(name = "formed_at", nullable = false, updatable = false)
    private OffsetDateTime formedAt;

    /**
     * Whether the team composition is balanced according to algorithm.
     */
    @Column(name = "is_balanced", nullable = false)
    @Builder.Default
    private Boolean isBalanced = false;

    /**
     * Strategy used to form this team.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "formation_strategy", nullable = false, length = 20)
    @Builder.Default
    private FormationStrategy formationStrategy = FormationStrategy.SKILL_BALANCED;

    /**
     * Team members (players assigned to this team).
     */
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TeamMember> members = new HashSet<>();

    // Helper methods

    /**
     * Add a player to this team.
     */
    public void addMember(User user, String preferredPosition, boolean isSubstitute) {
        TeamMember member = TeamMember.builder()
                .team(this)
                .user(user)
                .preferredPosition(preferredPosition)
                .isSubstitute(isSubstitute)
                .joinedTeamAt(OffsetDateTime.now())
                .build();
        members.add(member);
    }

    /**
     * Remove a player from this team.
     */
    public void removeMember(User user) {
        members.removeIf(member -> member.getUser().getId().equals(user.getId()));
    }

    /**
     * Get current player count (excluding substitutes).
     */
    public Integer getCurrentPlayerCount() {
        return Math.toIntExact(members.stream()
                .filter(member -> !member.getIsSubstitute())
                .count());
    }

    /**
     * Get current substitute count.
     */
    public Integer getCurrentSubstituteCount() {
        return Math.toIntExact(members.stream()
                .filter(TeamMember::getIsSubstitute)
                .count());
    }

    /**
     * Check if team has space for more players.
     */
    public Boolean hasSpaceForPlayers() {
        Game gameTemplate = game; // Assuming game has template reference
        return getCurrentPlayerCount() < gameTemplate.getMinPlayers() / gameTemplate.getTotalTeams();
    }

    /**
     * Check if team has space for more substitutes.
     */
    public Boolean hasSpaceForSubstitutes() {
        // This would need game template reference to get max substitutes
        return getCurrentSubstituteCount() < 3; // Default max subs per team
    }

    /**
     * Recalculate team statistics based on current members.
     */
    public void recalculateStats() {
        if (members.isEmpty()) {
            this.averageSkillLevel = 0.0;
            this.totalExperience = 0;
            return;
        }

        // Calculate average skill level
        double avgSkill = members.stream()
                .mapToDouble(member -> convertSkillLevelToNumeric(member.getUser().getSkillLevel()))
                .average()
                .orElse(0.0);
        this.averageSkillLevel = Math.round(avgSkill * 100.0) / 100.0;

        // Calculate total experience (sum of games played by all members)
        this.totalExperience = members.stream()
                .mapToInt(member -> member.getUser().getGamesCompleted() != null ? 
                    member.getUser().getGamesCompleted() : 0)
                .sum();
    }

    /**
     * Convert skill level string to numeric value for calculations.
     */
    private double convertSkillLevelToNumeric(String skillLevel) {
        return switch (skillLevel != null ? skillLevel.toLowerCase() : "beginner") {
            case "pro" -> 4.0;
            case "advanced" -> 3.0;
            case "intermediate" -> 2.0;
            case "beginner" -> 1.0;
            default -> 1.0;
        };
    }

    /**
     * Team formation strategy enumeration.
     */
    public enum FormationStrategy {
        /**
         * Automatically balance teams based on skill levels.
         */
        SKILL_BALANCED("Skill Balanced", "Teams balanced by player skill levels"),

        /**
         * Randomly assign players to teams.
         */
        RANDOM("Random", "Random team assignment for casual play"),

        /**
         * Manually assign players (by captain or game owner).
         */
        MANUAL("Manual", "Manual team assignment by organizer"),

        /**
         * Keep friend groups together when possible.
         */
        FRIEND_GROUPS("Friend Groups", "Preserve friend connections in team formation");

        private final String displayName;
        private final String description;

        FormationStrategy(String displayName, String description) {
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