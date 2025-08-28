package com.bmessi.pickupsportsapp.dto.venue;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Request payload for venue business hours.
 */
@Schema(name = "VenueBusinessHoursRequest", description = "Request body for venue business hours")
public record VenueBusinessHoursRequest(
        @Schema(description = "Day of the week", example = "MONDAY")
        @NotNull
        DayOfWeek dayOfWeek,
        
        @Schema(description = "Opening time", example = "09:00")
        @NotNull
        LocalTime openTime,
        
        @Schema(description = "Closing time", example = "17:00")
        @NotNull
        LocalTime closeTime,
        
        @Schema(description = "Whether the venue is closed on this day", example = "false")
        Boolean isClosed
) {}
