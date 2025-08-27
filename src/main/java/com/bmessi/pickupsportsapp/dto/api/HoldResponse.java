package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Hold creation response")
public record HoldResponse(
        @Schema(description = "Hold identifier", example = "42") Long holdId,
        @Schema(description = "Payment intent identifier", example = "pi_123") String paymentIntentId,
        @Schema(description = "When this hold expires (UTC ISO-8601)") OffsetDateTime expiresAt
) {}
