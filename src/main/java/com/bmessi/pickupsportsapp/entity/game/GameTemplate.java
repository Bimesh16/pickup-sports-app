package com.bmessi.pickupsportsapp.entity.game;

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
 * Entity representing a reusable game template for different sports and formats.
 * 
 * <p>Game templates define the structure and rules for common game formats like
 * 5v5 Soccer, 7v7 Football, Full Court Basketball, etc. This enables app owners
 * to quickly create standardized games with predefined team structures.</p>
 * 
 * <p><strong>Core Features:</strong></p>
 * <ul>
 *   <li><strong>Template Definition:</strong> Sport, format, and player configuration</li>
 *   <li><strong>Team Structure:</strong> Players per team, total teams, substitute slots</li>
 *   <li><strong>Game Settings:</strong> Duration, rules, equipment requirements</li>
 *   <li><strong>Business Logic:</strong> Skill balancing, captain assignment preferences</li>
 * </ul>
 * 
 * <p><strong>Template Examples:</strong></p>
 * <ul>
 *   <li><strong>5v5 Soccer:</strong> 10 players (5 per team), 2 subs, 90 minutes</li>
 *   <li><strong>Full Court Basketball:</strong> 10 players (5 per team), 4 subs, 48 minutes</li>
 *   <li><strong>7v7 Flag Football:</strong> 14 players (7 per team), 2 subs, 60 minutes</li>
 *   <li><strong>3v3 Basketball:</strong> 6 players (3 per team), 2 subs, 20 minutes</li>
 * </ul>
 * 
 * <p><strong>Business Rules:</strong></p>
 * <ul>
 *   <li>Templates enable consistent game creation across venues</li>
 *   <li>Automatic team formation based on template specifications</li>
 *   <li>Skill balancing algorithms use template constraints</li>
 *   <li>Popular templates are promoted in app owner interface</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 1.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "game_templates", indexes = {
        @Index(name = "idx_game_template_sport", columnList = "sport"),
        @Index(name = "idx_game_template_format", columnList = "format"),
        @Index(name = "idx_game_template_active", columnList = "is_active"),
        @Index(name = "idx_game_template_popularity", columnList = "popularity")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Template Configuration
    @NotBlank(message = "Template name is required")
    @Size(max = 100, message = "Template name must not exceed 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name; // "5v5 Soccer", "Full Court Basketball"

    @NotBlank(message = "Sport is required")
    @Size(max = 50, message = "Sport must not exceed 50 characters")
    @Column(name = "sport", nullable = false, length = 50)
    private String sport; // "Soccer", "Basketball", "Football"

    @NotBlank(message = "Format is required")
    @Size(max = 20, message = "Format must not exceed 20 characters")
    @Column(name = "format", nullable = false, length = 20)
    private String format; // "5v5", "7v7", "3v3", "Full Court"

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;

    // Team Structure Configuration
    @NotNull(message = "Players per team is required")
    @Min(value = 1, message = "Players per team must be at least 1")
    @Max(value = 15, message = "Players per team cannot exceed 15")
    @Column(name = "players_per_team", nullable = false)
    private Integer playersPerTeam; // 5 for 5v5 soccer

    @NotNull(message = "Total teams is required")
    @Min(value = 2, message = "Must have at least 2 teams")
    @Max(value = 4, message = "Cannot exceed 4 teams")
    @Column(name = "total_teams", nullable = false)
    @Builder.Default
    private Integer totalTeams = 2; // Standard 2-team games

    @NotNull(message = "Minimum players is required")
    @Min(value = 2, message = "Minimum players must be at least 2")
    @Max(value = 60, message = "Minimum players cannot exceed 60")
    @Column(name = "min_players", nullable = false)
    private Integer minPlayers; // 8 for 5v5 soccer (minimum to start)

    @NotNull(message = "Maximum players is required")
    @Min(value = 2, message = "Maximum players must be at least 2")
    @Max(value = 100, message = "Maximum players cannot exceed 100")
    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers; // 12 for 5v5 soccer (including subs)

    @Min(value = 0, message = "Substitute slots cannot be negative")
    @Max(value = 10, message = "Substitute slots cannot exceed 10")
    @Column(name = "substitute_slots")
    @Builder.Default
    private Integer substituteSlots = 0; // 2 subs per team

    // Game Settings
    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 480, message = "Duration cannot exceed 8 hours")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes; // 90 minutes for soccer

    @Size(max = 1000, message = "Default rules must not exceed 1000 characters")
    @Column(name = "default_rules", length = 1000)
    private String defaultRules;

    @Size(max = 500, message = "Required equipment must not exceed 500 characters")
    @Column(name = "required_equipment", length = 500)
    private String requiredEquipment;

    @Size(max = 1000, message = "Positions must not exceed 1000 characters")
    @Column(name = "positions", length = 1000)
    private String positions; // JSON: ["GK","DEF","MID","FWD"] for soccer

    // Business Rules Configuration
    @Column(name = "skill_balancing_required")
    @Builder.Default
    private Boolean skillBalancingRequired = true;

    @Column(name = "captain_assignment_required")
    @Builder.Default
    private Boolean captainAssignmentRequired = true;

    @Column(name = "position_assignment_required")
    @Builder.Default
    private Boolean positionAssignmentRequired = false;

    @Column(name = "requires_even_teams")
    @Builder.Default
    private Boolean requiresEvenTeams = true; // Teams must have equal players

    // Template Metadata
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Min(value = 0, message = "Popularity cannot be negative")
    @Column(name = "popularity")
    @Builder.Default
    private Integer popularity = 0; // Usage count for ranking

    @Size(max = 100, message = "Created by must not exceed 100 characters")
    @Column(name = "created_by", length = 100)
    private String createdBy; // Admin or system user who created template

    // Validation methods
    public boolean isValidPlayerCount(int playerCount) {
        return playerCount >= minPlayers && playerCount <= maxPlayers;
    }

    public int calculateTeamsNeeded(int playerCount) {
        if (!isValidPlayerCount(playerCount)) {
            throw new IllegalArgumentException("Invalid player count for this template");
        }
        return Math.min(totalTeams, playerCount / playersPerTeam);
    }

    public int calculatePlayersPerTeam(int totalPlayers) {
        int teams = calculateTeamsNeeded(totalPlayers);
        return totalPlayers / teams;
    }

    public void incrementPopularity() {
        this.popularity++;
    }

    /**
     * Check if this template can accommodate the given number of players.
     */
    public boolean canAccommodate(int playerCount) {
        return playerCount >= minPlayers && playerCount <= maxPlayers 
            && playerCount >= (totalTeams * 1); // At least 1 player per team
    }
}