package com.bmessi.pickupsportsapp.dto.venue;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Request payload for creating a venue booking.
 */
@Schema(name = "BookingRequest", description = "Request body to book a venue")
public record BookingRequest(
        @Schema(description = "Venue ID to book", example = "123")
        @NotNull(message = "Venue ID is required")
        Long venueId,

        @Schema(description = "Start time of the booking", example = "2025-08-25T18:00:00Z")
        @NotNull(message = "Start time is required")
        @Future(message = "Start time must be in the future")
        OffsetDateTime startTime,

        @Schema(description = "End time of the booking", example = "2025-08-25T20:00:00Z")
        @NotNull(message = "End time is required")
        @Future(message = "End time must be in the future")
        OffsetDateTime endTime,

        @Schema(description = "Cost per player (optional)", example = "15.00")
        BigDecimal costPerPlayer,

        @Schema(description = "Additional notes for the booking", example = "Soccer game for intermediate players")
        String notes
) {}
