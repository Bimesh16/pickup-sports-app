package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;
import java.util.Set;

/**
 * Detailed representation of a game returned to clients.  Includes
 * participants, creator, and optional GPS coordinates.
 */
public record GameDetailsDTO(
        Long id,
        String sport,
        String location,
        OffsetDateTime time,
        String skillLevel,
        Double latitude,
        Double longitude,
        UserDTO creator,
        Set<UserDTO> participants
) {}
