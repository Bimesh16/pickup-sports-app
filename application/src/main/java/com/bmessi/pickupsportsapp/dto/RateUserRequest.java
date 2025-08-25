package com.bmessi.pickupsportsapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RateUserRequest(
        @NotNull Long ratedUserId,
        @NotNull Long gameId,
        @Min(1) @Max(5) int score,
        @Size(max = 1000) String comment
) {}