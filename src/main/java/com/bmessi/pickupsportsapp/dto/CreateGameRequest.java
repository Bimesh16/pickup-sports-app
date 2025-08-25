package com.bmessi.pickupsportsapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
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
        Double longitude
) {}
