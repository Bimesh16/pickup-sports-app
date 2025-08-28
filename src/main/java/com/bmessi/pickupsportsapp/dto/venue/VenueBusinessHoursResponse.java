package com.bmessi.pickupsportsapp.dto.venue;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Response for venue business hours.
 */
public record VenueBusinessHoursResponse(
        Long id,
        DayOfWeek dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime,
        Boolean isClosed
) {}
