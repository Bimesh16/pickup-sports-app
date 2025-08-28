package com.bmessi.pickupsportsapp.dto.ai;

import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.ai.GameRecommendation;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO for game recommendations.
 */
public record GameRecommendationDTO(
        Long id,
        GameSummaryDTO recommendedGame,
        BigDecimal recommendationScore,
        String reason,
        GameRecommendation.RecommendationStatus status,
        String aiModelVersion,
        OffsetDateTime createdAt
) {}
