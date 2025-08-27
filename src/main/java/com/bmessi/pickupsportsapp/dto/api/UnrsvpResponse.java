package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response after leaving a game")
public record UnrsvpResponse(
        @Schema(description = "Whether the user was removed", example = "true") boolean removed,
        @Schema(description = "Number of players promoted from waitlist", example = "1") int promoted
) {}
