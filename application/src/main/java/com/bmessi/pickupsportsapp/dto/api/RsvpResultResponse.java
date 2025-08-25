package com.bmessi.pickupsportsapp.dto.api;

public record RsvpResultResponse(
        boolean joined,
        boolean waitlisted,
        String message
) {}
