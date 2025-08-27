package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "RSVP status for the current user")
public record RsvpStatusResponse(
        @Schema(description = "User has joined the game", example = "true") boolean joined,
        @Schema(description = "User is on the waitlist", example = "false") boolean waitlisted,
        @Schema(description = "Game capacity if set", example = "10") Integer capacity,
        @Schema(description = "Remaining open slots", example = "2") int openSlots,
        @Schema(description = "RSVP cutoff has passed", example = "false") boolean cutoff
) {}
