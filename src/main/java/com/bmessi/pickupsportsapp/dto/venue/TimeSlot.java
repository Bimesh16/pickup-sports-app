package com.bmessi.pickupsportsapp.dto.venue;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Represents an available time slot for venue booking.
 */
@Schema(name = "TimeSlot", description = "Available time slot for venue booking")
public record TimeSlot(
        @Schema(description = "Start time of the slot", example = "2025-08-25T18:00:00")
        LocalDateTime startTime,

        @Schema(description = "End time of the slot", example = "2025-08-25T19:00:00")
        LocalDateTime endTime
) {}
