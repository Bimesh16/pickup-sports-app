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
 * <p>Teams are dynamically formed for each game based on the GameTemplate specifications.
 * The system supports automatic team balancing, manual team assignment, and captain selection.</p>
 * 
 * <p><strong>Core Features:</strong></p>
 * <ul>
 *   <li><strong>Team Identity:</strong> Name, color, and number for easy identification</li>
 *   <li><strong>Player Management:</strong> Core players, substitutes, and captain assignment</li>
 *   <li><strong>Team Balance:</strong> Skill level tracking and formation strategies</li>
 *   <li><strong>Formation Tracking:</strong> How and when teams were formed</li>
 * </ul>
 * 
 * <p><strong>Formation Strategies:</strong></p>
 * <ul>
 *   <li><strong>SKILL_BALANCED:</strong> Algorithm balances teams by skill level</li>
 *   <li><strong>RANDOM:</strong> Random team assignment</li>
 *   <li><strong>MANUAL:</strong> Manual assignment by game organizer</li>
 *   <li><strong>DRAFT:</strong> Captain-based draft selection</li>
 * </ul>
 * 
 * <p><strong>Business Logic:</strong></p>
 * <ul>
 *   <li>Teams are created when games move from DRAFT to PUBLISHED status</li>
 *   <li>Skill balance is calculated automatically when players are assigned</li>
 *   <li>Captains are either assigned by algorithm or selected manually</li>
 *   <li>Team colors help with visual identification during games</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 1.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "teams", indexes = {
        @Index(name = "idx_team_game", columnList = "game_id"),
        @Index(name = "idx_team_captain", columnList = "captain_id"),
        @Index(name = "idx_team_number", columnList = "game_id, team_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Core Relationships
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    // Team Identity
    @NotBlank(message = "Team name is required")
    @Size(max = 50, message = "Team name must not exceed 50 characters")
    @Column(name = "team_name", nullable = false, length = 50)
    private String teamName; // "Team A", "Red Team", "Lions"

    @Size(max = 7, message = "Team color must not exceed 7 characters")
    @Column(name = "team_color", length = 7)
    private String teamColor; // HEX color code like "#FF0000"

    @NotNull(message = "Team number is required")
    @Min(value = 1, message = "Team number must be at least 1")
    @Max(value = 4, message = "Team number cannot exceed 4")
    @Column(name = "team_number", nullable = false)
    private Integer teamNumber; // 1, 2, 3, 4 for identification

    // Team Leadership
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id")
    private User captain;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "co_captain_id")
    private User coCaptain; // Optional co-captain for larger teams

    // Player Management (Many-to-Many through TeamMember)
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TeamMember> members = new HashSet<>();

    // Team Statistics (Calculated Fields)
    @DecimalMin(value = "0.0", message = "Average skill level must be non-negative")
    @DecimalMax(value = "5.0", message = "Average skill level cannot exceed 5.0")
    @Column(name = "average_skill_level", precision = 3, scale = 2)
    private Double averageSkillLevel;

    @Min(value = 0, message = "Total experience cannot be negative")
    @Column(name = "total_experience")
    private Integer totalExperience; // Sum of all players' experience levels

    @Min(value = 0, message = "Active players cannot be negative")
    @Column(name = "active_players_count")
    @Builder.Default
    private Integer activePlayersCount = 0;

    @Min(value = 0, message = "Substitute players cannot be negative")
    @Column(name = "substitute_players_count")
    @Builder.Default
    private Integer substitutePlayersCount = 0;

    // Team Formation Metadata
    @Column(name = "is_balanced")
    @Builder.Default
    private Boolean isBalanced = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "formation_strategy", length = 20)
    @Builder.Default
    private FormationStrategy formationStrategy = FormationStrategy.SKILL_BALANCED;

    @CreationTimestamp
    @Column(name = "formed_at", nullable = false)
    private OffsetDateTime formedAt;

    @Size(max = 500, message = "Formation notes must not exceed 500 characters")
    @Column(name = "formation_notes", length = 500)
    private String formationNotes; // Notes about how team was formed

    // Team Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TeamStatus status = TeamStatus.FORMING;

    /**
     * Enum for team formation strategies.
     */
    public enum FormationStrategy {
        SKILL_BALANCED("Teams balanced by skill level"),
        RANDOM("Random team assignment"),
        MANUAL("Manually assigned by organizer"),
        DRAFT("Captain-based draft selection"),
        FRIEND_GROUPS("Keep friend groups together");

        private final String description;

        FormationStrategy(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Enum for team status during formation and game lifecycle.
     */
    public enum TeamStatus {
        FORMING("Team is being formed"),
        READY("Team is complete and ready"),
        PLAYING("Team is currently playing"),
        COMPLETED("Team has finished the game"),
        DISBANDED("Team was disbanded before game");

        private final String description;

        TeamStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Helper Methods
    
    /**
     * Add a player to this team.
     */
    public void addMember(TeamMember member) {
        members.add(member);
        member.setTeam(this);
        updatePlayerCounts();
        recalculateTeamStats();
    }

    /**
     * Remove a player from this team.
     */
    public void removeMember(TeamMember member) {
        members.remove(member);
        member.setTeam(null);
        updatePlayerCounts();
        recalculateTeamStats();
    }

    /**
     * Check if team has space for more players.
     */
    public boolean hasSpaceForPlayer(boolean isSubstitute) {
        GameTemplate template = game.getGameTemplate();
        if (template == null) return true; // No template constraints
        
        if (isSubstitute) {
            return substitutePlayersCount < template.getSubstituteSlots();
        } else {
            return activePlayersCount < template.getPlayersPerTeam();
        }
    }

    /**
     * Check if team is ready to play (has minimum players).
     */
    public boolean isReadyToPlay() {
        GameTemplate template = game.getGameTemplate();
        if (template == null) return activePlayersCount >= 1;
        
        // Need at least 70% of required players to be ready
        int minRequired = Math.max(1, (int) (template.getPlayersPerTeam() * 0.7));
        return activePlayersCount >= minRequired;
    }

    // Private helper methods
    private void updatePlayerCounts() {
        long active = members.stream().filter(m -> !m.isSubstitute()).count();
        long subs = members.stream().filter(TeamMember::isSubstitute).count();
        
        this.activePlayersCount = (int) active;
        this.substitutePlayersCount = (int) subs;
    }

    private void recalculateTeamStats() {
        if (members.isEmpty()) {
            this.averageSkillLevel = 0.0;
            this.totalExperience = 0;
            return;
        }

        // Calculate average skill level (assuming User has skill level as enum or number)
        double avgSkill = members.stream()
            .mapToDouble(m -> getSkillLevelNumeric(m.getUser()))
            .average()
            .orElse(0.0);
        
        this.averageSkillLevel = Math.round(avgSkill * 100.0) / 100.0; // Round to 2 decimal places

        // Calculate total experience (assuming User has gamesCompleted field)
        this.totalExperience = members.stream()
            .mapToInt(m -> getExperienceLevel(m.getUser()))
            .sum();
    }

    // Helper methods to extract skill and experience from User
    private double getSkillLevelNumeric(User user) {
        // Convert skill level to numeric value for calculation
        if (user == null || user.getSkillLevel() == null) return 2.0; // Default intermediate
        
        return switch (user.getSkillLevel()) {
            case BEGINNER -> 1.0;
            case INTERMEDIATE -> 2.0;
            case ADVANCED -> 3.0;
            case PRO -> 4.0;
        };
    }

    private int getExperienceLevel(User user) {
        // Return games completed or a default experience level
        // This would require enhancing User entity with gamesCompleted field
        return 0; // Placeholder - implement based on User entity enhancements
    }
}