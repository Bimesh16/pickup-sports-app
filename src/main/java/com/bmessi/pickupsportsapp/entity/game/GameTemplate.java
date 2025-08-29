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
 * Entity representing game templates for common game formats.
 * 
 * <p>Game templates define standard configurations for popular game formats
 * like 5v5 soccer, 7v7 football, 3v3 basketball, etc. This enables quick
 * game creation with pre-configured rules, player counts, and settings.</p>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Format Definition:</strong> Players per team, total teams, duration</li>
 *   <li><strong>Rule Templates:</strong> Default rules and equipment requirements</li>
 *   <li><strong>Team Management:</strong> Auto-balancing and captain assignment settings</li>
 *   <li><strong>Popularity Tracking:</strong> Usage analytics for template optimization</li>
 * </ul>
 * 
 * <p><strong>Common Templates:</strong></p>
 * <ul>
 *   <li><strong>Soccer:</strong> 5v5 (10 players), 7v7 (14 players), 11v11 (22 players)</li>
 *   <li><strong>Basketball:</strong> 3v3 (6 players), 5v5 (10 players)</li>
 *   <li><strong>Volleyball:</strong> 4v4 beach (8 players), 6v6 indoor (12 players)</li>
 *   <li><strong>Football:</strong> 7v7 flag (14 players), 11v11 tackle (22 players)</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Entity
@Table(name = "game_templates", indexes = {
        @Index(name = "idx_template_sport", columnList = "sport"),
        @Index(name = "idx_template_format", columnList = "format"),
        @Index(name = "idx_template_active", columnList = "is_active"),
        @Index(name = "idx_template_popularity", columnList = "popularity")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Display name for the template (e.g., "5v5 Soccer", "3v3 Basketball").
     */
    @NotBlank(message = "Template name is required")
    @Size(max = 100, message = "Template name must not exceed 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Sport type for this template.
     */
    @NotBlank(message = "Sport is required")
    @Size(max = 50, message = "Sport must not exceed 50 characters")
    @Column(name = "sport", nullable = false, length = 50)
    private String sport;

    /**
     * Game format identifier (e.g., "5v5", "7v7", "3v3").
     */
    @NotBlank(message = "Format is required")
    @Size(max = 20, message = "Format must not exceed 20 characters")
    @Column(name = "format", nullable = false, length = 20)
    private String format;

    /**
     * Number of players per team.
     */
    @NotNull(message = "Players per team is required")
    @Min(value = 1, message = "Players per team must be at least 1")
    @Max(value = 50, message = "Players per team cannot exceed 50")
    @Column(name = "players_per_team", nullable = false)
    private Integer playersPerTeam;

    /**
     * Total number of teams (usually 2, but can be more for tournaments).
     */
    @NotNull(message = "Total teams is required")
    @Min(value = 2, message = "Total teams must be at least 2")
    @Max(value = 10, message = "Total teams cannot exceed 10")
    @Column(name = "total_teams", nullable = false)
    @Builder.Default
    private Integer totalTeams = 2;

    /**
     * Minimum players needed to start the game.
     */
    @NotNull(message = "Minimum players is required")
    @Min(value = 2, message = "Minimum players must be at least 2")
    @Max(value = 100, message = "Minimum players cannot exceed 100")
    @Column(name = "min_players", nullable = false)
    private Integer minPlayers;

    /**
     * Maximum players allowed in the game (including substitutes).
     */
    @NotNull(message = "Maximum players is required")
    @Min(value = 2, message = "Maximum players must be at least 2")
    @Max(value = 100, message = "Maximum players cannot exceed 100")
    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers;

    /**
     * Number of substitute slots available per team.
     */
    @Min(value = 0, message = "Substitute slots cannot be negative")
    @Max(value = 20, message = "Substitute slots cannot exceed 20")
    @Column(name = "substitute_slots")
    @Builder.Default
    private Integer substituteSlots = 0;

    /**
     * Default game duration in minutes.
     */
    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 480, message = "Duration cannot exceed 8 hours")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    /**
     * Default rules for games created from this template.
     */
    @Column(name = "default_rules", columnDefinition = "TEXT")
    private String defaultRules;

    /**
     * Equipment required from players.
     */
    @Size(max = 1000, message = "Required equipment description must not exceed 1000 characters")
    @Column(name = "required_equipment", columnDefinition = "TEXT")
    private String requiredEquipment;

    /**
     * Whether skill-based team balancing is required.
     */
    @Column(name = "skill_balancing_required", nullable = false)
    @Builder.Default
    private Boolean skillBalancingRequired = true;

    /**
     * Whether team captains should be automatically assigned.
     */
    @Column(name = "captain_assignment_required", nullable = false)
    @Builder.Default
    private Boolean captainAssignmentRequired = false;

    /**
     * Whether specific position assignment is required.
     */
    @Column(name = "position_assignment_required", nullable = false)
    @Builder.Default
    private Boolean positionAssignmentRequired = false;

    /**
     * Whether this template is currently active and available for use.
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Usage count for popularity tracking and analytics.
     */
    @Min(value = 0, message = "Popularity cannot be negative")
    @Column(name = "popularity", nullable = false)
    @Builder.Default
    private Integer popularity = 0;

    /**
     * Timestamp when this template was created.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this template was last updated.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Calculate total player slots (players per team * total teams + substitutes).
     */
    public Integer getTotalPlayerSlots() {
        int teamSlots = playersPerTeam * totalTeams;
        int subSlots = substituteSlots * totalTeams;
        return teamSlots + subSlots;
    }

    /**
     * Check if this template requires team formation.
     */
    public Boolean requiresTeamFormation() {
        return totalTeams > 1 && playersPerTeam > 1;
    }

    /**
     * Get suggested pricing tier based on format complexity.
     */
    public PricingTier getSuggestedPricingTier() {
        int totalSlots = getTotalPlayerSlots();
        if (totalSlots <= 6) return PricingTier.BUDGET;
        if (totalSlots <= 12) return PricingTier.STANDARD;
        if (totalSlots <= 20) return PricingTier.PREMIUM;
        return PricingTier.ENTERPRISE;
    }

    public enum PricingTier {
        BUDGET,     // $5-10 per player
        STANDARD,   // $10-20 per player  
        PREMIUM,    // $20-35 per player
        ENTERPRISE  // $35+ per player
    }
}