package com.bmessi.pickupsportsapp.dto.ai;

import com.bmessi.pickupsportsapp.dto.venue.VenueResponse;
import com.bmessi.pickupsportsapp.entity.ai.VenueRecommendation;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO for venue recommendations.
 */
public record VenueRecommendationDTO(
        Long id,
        VenueResponse recommendedVenue,
        BigDecimal recommendationScore,
        String reason,
        VenueRecommendation.RecommendationStatus status,
        String aiModelVersion,
        OffsetDateTime createdAt
) {}
