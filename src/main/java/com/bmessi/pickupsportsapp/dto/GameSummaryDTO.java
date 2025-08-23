package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;

/**
 * Lightweight summary of a game used in list views.  Includes
 * optional GPS coordinates. When a geo-filtered search is used,
 * distanceKm may be populated with the distance from the query point.
 */
public record GameSummaryDTO(
        Long id,
        String sport,
        String location,
        OffsetDateTime time,
        String skillLevel,
        Double latitude,
        Double longitude,
        Double distanceKm
) {}
