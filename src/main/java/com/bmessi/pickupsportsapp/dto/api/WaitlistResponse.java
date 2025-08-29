package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.List;

@Schema(description = "Waitlist response")
public record WaitlistResponse(
        @Schema(description = "Waitlist entries", required = true) List<Item> items,
        @Schema(description = "Total waitlisted", example = "5") int total,
        @Schema(description = "Your 1-based position if present, otherwise null", example = "2") Integer myPosition
) {
    @Schema(description = "Waitlist entry")
    public record Item(
            @Schema(description = "User ID", example = "10") Long userId,
            @Schema(description = "Username", example = "alice") String username,
            @Schema(description = "When the user joined the waitlist (UTC ISO-8601)") OffsetDateTime createdAt
    ) {}
}
