package com.bmessi.pickupsportsapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;

/**
 * Request payload for creating a new game.  Supports optional GPS
 * coordinates and validates their ranges.
 */
public record CreateGameRequest(

        @NotBlank @Size(max = 50)
        String sport,

        @NotBlank @Size(max = 255)
        String location,

        @NotNull
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime time,

        @Size(max = 50)
        String skillLevel,

        @DecimalMin(value = "-90.0", inclusive = true, message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", inclusive = true, message = "Latitude must be <= 90")
        Double latitude,

        @DecimalMin(value = "-180.0", inclusive = true, message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", inclusive = true, message = "Longitude must be <= 180")
        Double longitude
) {}
