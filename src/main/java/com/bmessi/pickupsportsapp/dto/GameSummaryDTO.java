package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;

/**
 * Lightweight summary of a game used in list views.  Includes
 * optional GPS coordinates.
 */
public record GameSummaryDTO(
        Long id,
        String sport,
        String location,
        OffsetDateTime time,
        String skillLevel,
        Double latitude,
        Double longitude
) {}
