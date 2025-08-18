package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public record RatingDTO(
        Long id,
        Long raterUserId,
        Long ratedUserId,
        Long gameId,
        int score,
        String comment,
        Instant createdAt
) {}