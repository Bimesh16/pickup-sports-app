package com.bmessi.pickupsportsapp.dto.game;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

/**
 * Lightweight summary of a game used in list views. Includes
 * optional GPS coordinates. When a geo-filtered search is used,
 * distanceKm may be populated with the distance from the query point.
 */
@Schema(name = "GameSummary", description = "Compact summary of a game for list views")
public record GameSummaryDTO(
        @Schema(description = "Game identifier", example = "42")
        Long id,
        @Schema(description = "Canonical sport name", example = "Soccer")
        String sport,
        @Schema(description = "Location label", example = "Park A")
        String location,
        @Schema(description = "Scheduled start time (ISO-8601)", example = "2025-08-25T18:30:00Z")
        OffsetDateTime time,
        @Schema(description = "Canonical skill level", example = "Intermediate")
        String skillLevel,
        @Schema(description = "Latitude in degrees", example = "37.7749")
        Double latitude,
        @Schema(description = "Longitude in degrees", example = "-122.4194")
        Double longitude,
        @Schema(description = "Distance from query point in kilometers (only for geo searches)", example = "2.1")
        Double distanceKm
) {}
