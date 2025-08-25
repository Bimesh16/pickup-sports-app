package com.bmessi.pickupsportsapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.Set;

/**
 * Detailed representation of a game returned to clients. Includes
 * participants, creator, and optional GPS coordinates.
 */
@Schema(name = "GameDetails", description = "Detailed game view including creator and participants")
public record GameDetailsDTO(
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
        @Schema(description = "Game creator")
        UserDTO creator,
        @Schema(description = "Participants attending the game")
        Set<UserDTO> participants
) {}
