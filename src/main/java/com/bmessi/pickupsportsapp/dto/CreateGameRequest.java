package com.bmessi.pickupsportsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record CreateGameRequest(
        @NotBlank @Size(max = 50) String sport,
        @NotBlank @Size(max = 255) String location,
        @NotNull OffsetDateTime time
) {}