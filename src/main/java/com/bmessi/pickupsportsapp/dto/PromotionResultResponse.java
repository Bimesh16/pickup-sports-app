package com.bmessi.pickupsportsapp.dto;

public record PromotionResultResponse(
        int requestedSlots,
        int promotedUsers,
        int participantsAdded
) {}
