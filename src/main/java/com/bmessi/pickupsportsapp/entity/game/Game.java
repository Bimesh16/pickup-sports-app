
package com.bmessi.pickupsportsapp.entity.game;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.Venue;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a pickup game in the sports application.
 * 
 * <p>This entity manages the complete lifecycle of a sports game, from creation to completion.
 * It supports various game types including pickup games, tournaments, leagues, training sessions,
 * and social events.</p>
 * 
 * <p><strong>Core Features:</strong></p>
 * <ul>
 *   <li><strong>Game Management:</strong> Sport type, location, time, and capacity</li>
 *   <li><strong>Player Management:</strong> Min/max players, waitlist, and approval workflows</li>
 *   <li><strong>Financial:</strong> Price per player, total cost, and payment tracking</li>
 *   <li><strong>Geographic:</strong> GPS coordinates for proximity-based search and filtering</li>
 *   <li><strong>Flexibility:</strong> Private games, weather dependency, and cancellation policies</li>
 * </ul>
 * 
 * <p><strong>Game Types:</strong></p>
 * <ul>
 *   <li><strong>PICKUP:</strong> Casual, spontaneous games</li>
 *   <li><strong>TOURNAMENT:</strong> Competitive, structured events</li>
 *   <li><strong>LEAGUE:</strong> Ongoing, scheduled competitions</li>
 *   <li><strong>TRAINING:</strong> Skill development sessions</li>
 *   <li><strong>SOCIAL:</strong> Recreational, non-competitive play</li>
 *   <li><strong>COMPETITIVE:</strong> High-level, competitive matches</li>
 * </ul>
 * 
 * <p><strong>Game States:</strong></p>
 * <ul>
 *   <li><strong>DRAFT:</strong> Game being planned, not yet published</li>
 *   <li><strong>PUBLISHED:</strong> Game is visible and accepting participants</li>
 *   <li><strong>FULL:</strong> Game has reached maximum capacity</li>
 *   <li><strong>CANCELLED:</strong> Game has been cancelled</li>
 *   <li><strong>COMPLETED:</strong> Game has finished</li>
 *   <li><strong>ARCHIVED:</strong> Game is archived for historical purposes</li>
 * </ul>
 * 
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Sport: Required, max 100 characters</li>
 *   <li>Location: Required, max 255 characters</li>
 *   <li>Time: Required, must be in the future</li>
 *   <li>Coordinates: Latitude (-90 to 90), Longitude (-180 to 180)</li>
 *   <li>Players: Min 1, Max 100</li>
 *   <li>Duration: 15 minutes to 8 hours</li>
 *   <li>Price: Non-negative with proper decimal precision</li>
 * </ul>
 * 
 * <p><strong>Business Logic:</strong></p>
 * <ul>
 *   <li>Automatic capacity management and waitlist handling</li>
 *   <li>RSVP cutoff enforcement and participant tracking</li>
 *   <li>Weather-dependent scheduling and cancellation policies</li>
 *   <li>Equipment requirements and availability tracking</li>
 *   <li>Game rules and safety guidelines enforcement</li>
 * </ul>
 * 
 * <p><strong>Relationships:</strong></p>
 * <ul>
 *   <li>Many-to-one with User (game creator)</li>
 *   <li>Many-to-one with Venue (optional venue location)</li>
 *   <li>Many-to-many with User (participants)</li>
 *   <li>One-to-many with various game-related entities</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "game", indexes = {
        @Index(name = "idx_game_time", columnList = "time"),
        @Index(name = "idx_game_location", columnList = "location"),
        @Index(name = "idx_game_user_time", columnList = "user_id, time"),
        @Index(name = "idx_game_sport", columnList = "sport"),
        @Index(name = "idx_game_status", columnList = "status"),
        @Index(name = "idx_game_venue", columnList = "venue_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Sport is required")
    @Size(max = 100, message = "Sport must not exceed 100 characters")
    @Column(name = "sport", nullable = false, length = 100)
    private String sport;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @NotNull(message = "Game time is required")
    @Future(message = "Game time must be in the future")
    @Column(name = "time", nullable = true)
    private OffsetDateTime time;

    @Size(max = 50, message = "Skill level must not exceed 50 characters")
    @Column(name = "skill_level", length = 50)
    private String skillLevel;

    /**
     * Latitude of the game location (optional).
     */
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90 degrees")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90 degrees")
    @Column
    private Double latitude;

    /**
     * Longitude of the game location (optional).
     */
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180 degrees")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180 degrees")
    @Column
    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    // New enhanced fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private GameStatus status = GameStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false)
    @Builder.Default
    private GameType gameType = GameType.PICKUP;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @Min(value = 1, message = "Minimum players must be at least 1")
    @Max(value = 100, message = "Minimum players cannot exceed 100")
    @Column(name = "min_players")
    private Integer minPlayers;

    @Min(value = 1, message = "Maximum players must be at least 1")
    @Max(value = 100, message = "Maximum players cannot exceed 100")
    @Column(name = "max_players")
    private Integer maxPlayers;

    @DecimalMin(value = "0.0", message = "Price per player must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Price per player must have at most 6 digits and 2 decimal places")
    @Column(name = "price_per_player", precision = 10, scale = 2)
    private BigDecimal pricePerPlayer;

    @DecimalMin(value = "0.0", message = "Total cost must be non-negative")
    @Digits(integer = 8, fraction = 2, message = "Total cost must have at most 8 digits and 2 decimal places")
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 480, message = "Duration cannot exceed 8 hours")
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "rsvp_cutoff")
    private OffsetDateTime rsvpCutoff;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 100, message = "Capacity cannot exceed 100")
    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "waitlist_enabled", nullable = false)
    @Builder.Default
    private Boolean waitlistEnabled = false;

    @Column(name = "is_private", nullable = false)
    @Builder.Default
    private Boolean isPrivate = false;

    @Column(name = "requires_approval", nullable = false)
    @Builder.Default
    private Boolean requiresApproval = false;

    @Column(name = "weather_dependent", nullable = false)
    @Builder.Default
    private Boolean weatherDependent = false;

    @Column(name = "cancellation_policy", length = 500)
    private String cancellationPolicy;

    @Column(name = "rules", length = 1000)
    private String rules;

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

    @Version
    private Long version;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "game_participants",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> participants = new HashSet<>();

    // Helper methods for participants
    public void addParticipant(User user) {
        if (participants == null) {
            participants = new HashSet<>();
        }
        participants.add(user);
    }

    public void removeParticipant(User user) {
        if (participants != null) {
            participants.remove(user);
        }
    }



    public enum GameStatus {
        DRAFT,
        PUBLISHED,
        FULL,
        CANCELLED,
        COMPLETED,
        ARCHIVED
    }

    public enum GameType {
        PICKUP,
        TOURNAMENT,
        LEAGUE,
        TRAINING,
        SOCIAL,
        COMPETITIVE
    }
}