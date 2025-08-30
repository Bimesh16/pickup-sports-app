package com.bmessi.pickupsportsapp.dto.game;

import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

/**
 * DTO for detailed game information including participants and creator.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Builder
public record GameDetailsDTO(
    Long id,
    String sport,
    String location,
    OffsetDateTime time,
    String skillLevel,
    Double latitude,
    Double longitude,
    Game.GameType gameType,
    String description,
    Integer minPlayers,
    Integer maxPlayers,
    BigDecimal pricePerPlayer,
    BigDecimal totalCost,
    Integer durationMinutes,
    OffsetDateTime rsvpCutoff,
    Integer capacity,
    Boolean waitlistEnabled,
    Boolean isPrivate,
    Boolean requiresApproval,
    Boolean weatherDependent,
    String cancellationPolicy,
    String rules,
    String equipmentProvided,
    String equipmentRequired,
    UserDTO creator,
    Set<UserDTO> participants,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
