package com.bmessi.pickupsportsapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "User", description = "Compact user representation")
public record UserDTO(
        @Schema(description = "User identifier", example = "10")
        Long id,
        @Schema(description = "Username", example = "alice")
        String username,
        @Schema(description = "Preferred sport", example = "Soccer")
        String preferredSport,
        @Schema(description = "Location label", example = "Park A")
        String location
) {}