package com.bmessi.pickupsportsapp.dto;

public record UserRatingSummaryDTO(
        Long userId,
        Double average,
        Integer count
) {}