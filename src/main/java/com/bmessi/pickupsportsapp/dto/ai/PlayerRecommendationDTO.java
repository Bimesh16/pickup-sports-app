package com.bmessi.pickupsportsapp.dto.ai;

import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.ai.PlayerRecommendation;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO for player recommendations.
 */
public record PlayerRecommendationDTO(
        Long id,
        Long gameId,
        UserDTO recommendedPlayer,
        UserDTO requestingPlayer,
        BigDecimal recommendationScore,
        String reason,
        PlayerRecommendation.RecommendationStatus status,
        String aiModelVersion,
        OffsetDateTime createdAt
) {}
