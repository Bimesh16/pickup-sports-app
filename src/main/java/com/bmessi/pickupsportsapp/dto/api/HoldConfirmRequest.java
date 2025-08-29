package com.bmessi.pickupsportsapp.dto.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Confirm a previously created hold")
public record HoldConfirmRequest(
        @NotNull @Schema(description = "Hold identifier returned by /hold", example = "42") Long holdId
) {}
