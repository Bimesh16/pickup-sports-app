package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.List;

@Schema(description = "Participants list response")
public record ParticipantsResponse(
        @Schema(description = "Participants", required = true) List<Item> items,
        @Schema(description = "Total participants", example = "12") int total
) {
    @Schema(description = "Participant entry")
    public record Item(
            @Schema(description = "User ID", example = "10") Long userId,
            @Schema(description = "Username", example = "alice") String username,
            @Schema(description = "Joined time (UTC ISO-8601)") OffsetDateTime joinedAt
    ) {}
}
