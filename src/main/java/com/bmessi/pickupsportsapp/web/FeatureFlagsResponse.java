package com.bmessi.pickupsportsapp.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FeatureFlags", description = "Frontend boot configuration and feature flags")
public record FeatureFlagsResponse(
        @Schema(description = "Environment name", example = "dev")
        String env,
        @Schema(description = "Whether AI recommendations are enabled", example = "false")
        boolean recommend,
        @Schema(description = "Whether chat features are enabled", example = "true")
        boolean chatEnabled
) {}
