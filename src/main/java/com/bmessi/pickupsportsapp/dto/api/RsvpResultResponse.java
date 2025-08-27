package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Result of an RSVP or hold confirmation")
public record RsvpResultResponse(
        @Schema(description = "True if the user is now a participant", example = "true") boolean joined,
        @Schema(description = "True if the user was placed on the waitlist", example = "false") boolean waitlisted,
        @Schema(description = "Human-readable message", example = "ok") String message
) {}
