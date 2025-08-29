package com.bmessi.pickupsportsapp.dto.venue;

import com.bmessi.pickupsportsapp.entity.VenueBooking;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Response payload for venue booking information.
 */
@Schema(name = "BookingResponse", description = "Venue booking response")
public record BookingResponse(
        @Schema(description = "Booking identifier", example = "42")
        Long id,

        @Schema(description = "Venue name", example = "Central Park Soccer Field")
        String venueName,

        @Schema(description = "Start time of the booking", example = "2025-08-25T20:00:00Z")
        OffsetDateTime startTime,

        @Schema(description = "End time of the booking", example = "2025-08-25T20:00:00Z")
        OffsetDateTime endTime,

        @Schema(description = "Total cost of the booking", example = "150.00")
        BigDecimal totalCost,

        @Schema(description = "Booking status", example = "CONFIRMED")
        VenueBooking.BookingStatus status,

        @Schema(description = "Payment intent ID", example = "pi_123456789")
        String paymentIntentId
) {}
