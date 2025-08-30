package com.bmessi.pickupsportsapp.dto.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO for creating a new game.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Builder
public record CreateGameRequest(
    
    @NotBlank(message = "Sport is required")
    String sport,
    
    @NotBlank(message = "Location is required")
    String location,
    
    @NotNull(message = "Game time is required")
    OffsetDateTime time,
    
    @NotBlank(message = "Skill level is required")
    String skillLevel,
    
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    Double latitude,
    
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    Double longitude,
    
    Game.GameType gameType,
    
    String description,
    
    @Min(value = 1, message = "Minimum players must be at least 1")
    Integer minPlayers,
    
    @Min(value = 1, message = "Maximum players must be at least 1")
    Integer maxPlayers,
    
    @DecimalMin(value = "0.0", message = "Price per player cannot be negative")
    BigDecimal pricePerPlayer,
    
    @DecimalMin(value = "0.0", message = "Total cost cannot be negative")
    BigDecimal totalCost,
    
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    Integer durationMinutes,
    
    OffsetDateTime rsvpCutoff,
    
    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity,
    
    Boolean waitlistEnabled,
    
    Boolean isPrivate,
    
    Boolean requiresApproval,
    
    Boolean weatherDependent,
    
    String cancellationPolicy,
    
    String rules,
    
    String equipmentProvided,
    
    String equipmentRequired
) {}
