package com.bmessi.pickupsportsapp.dto.game;

import lombok.Builder;

import java.time.OffsetDateTime;

/**
 * DTO for game summary information used in lists and search results.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Builder
public record GameSummaryDTO(
    Long id,
    String sport,
    String location,
    OffsetDateTime time,
    String skillLevel,
    Double latitude,
    Double longitude,
    String creatorName,
    Integer currentPlayers,
    Integer maxPlayers,
    String status
) {}
