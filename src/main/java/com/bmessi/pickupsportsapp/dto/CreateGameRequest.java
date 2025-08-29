package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Request payload for creating a new game. Supports optional GPS
 * coordinates and validates their ranges.
 */
@Schema(name = "CreateGameRequest", description = "Request body to create a game")
public record CreateGameRequest(

        @Schema(description = "Sport to play", example = "Soccer")
        @NotBlank @Size(max = 50)
        String sport,

        @Schema(description = "Location label", example = "Park A")
        @NotBlank @Size(max = 255)
        String location,

        @Schema(description = "Planned start time (ISO-8601)", example = "2025-08-25T18:30:00Z")
        @NotNull
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime time,

        @Schema(description = "Desired skill level", example = "Intermediate")
        @Size(max = 50)
        String skillLevel,

        @Schema(description = "Latitude in degrees", example = "37.7749")
        @DecimalMin(value = "-90.0", inclusive = true, message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", inclusive = true, message = "Latitude must be <= 90")
        Double latitude,

        @Schema(description = "Longitude in degrees", example = "-122.4194")
        @DecimalMin(value = "-180.0", inclusive = true, message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", inclusive = true, message = "Longitude must be <= 180")
        Double longitude,

        // New enhanced fields
        @Schema(description = "Venue ID for the game", example = "123")
        Long venueId,

        @Schema(description = "Game type", example = "PICKUP")
        Game.GameType gameType,

        @Schema(description = "Game description", example = "Casual pickup soccer game")
        @Size(max = 1000)
        String description,

        @Schema(description = "Minimum number of players", example = "10")
        @Min(value = 1, message = "Minimum players must be at least 1")
        @Max(value = 100, message = "Minimum players cannot exceed 100")
        Integer minPlayers,

        @Schema(description = "Maximum number of players", example = "22")
        @Min(value = 1, message = "Maximum players must be at least 1")
        @Max(value = 100, message = "Maximum players cannot exceed 100")
        Integer maxPlayers,

        @Schema(description = "Price per player", example = "15.00")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price per player must be non-negative")
        @Digits(integer = 6, fraction = 2, message = "Price per player must have at most 6 digits and 2 decimal places")
        BigDecimal pricePerPlayer,

        @Schema(description = "Total cost for the game", example = "150.00")
        @DecimalMin(value = "0.0", inclusive = true, message = "Total cost must be non-negative")
        @Digits(integer = 8, fraction = 2, message = "Total cost must have at most 8 digits and 2 decimal places")
        BigDecimal totalCost,

        @Schema(description = "Game duration in minutes", example = "90")
        @Min(value = 15, message = "Duration must be at least 15 minutes")
        @Max(value = 480, message = "Duration cannot exceed 8 hours")
        Integer durationMinutes,

        @Schema(description = "RSVP cutoff time", example = "2025-08-25T17:00:00Z")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime rsvpCutoff,

        @Schema(description = "Game capacity", example = "22")
        @Min(value = 1, message = "Capacity must be at least 1")
        @Max(value = 100, message = "Capacity cannot exceed 100")
        Integer capacity,

        @Schema(description = "Whether waitlist is enabled", example = "true")
        Boolean waitlistEnabled,

        @Schema(description = "Whether the game is private", example = "false")
        Boolean isPrivate,

        @Schema(description = "Whether approval is required to join", example = "false")
        Boolean requiresApproval,

        @Schema(description = "Whether the game depends on weather", example = "true")
        Boolean weatherDependent,

        @Schema(description = "Cancellation policy", example = "24 hours notice required")
        @Size(max = 500)
        String cancellationPolicy,

        @Schema(description = "Game rules", example = "No slide tackling, friendly play")
        @Size(max = 1000)
        String rules,

        @Schema(description = "Equipment provided by organizer", example = "Balls, cones, goals")
        @Size(max = 500)
        String equipmentProvided,

        @Schema(description = "Equipment required from players", example = "Cleats, shin guards")
        @Size(max = 500)
        String equipmentRequired
) {}
