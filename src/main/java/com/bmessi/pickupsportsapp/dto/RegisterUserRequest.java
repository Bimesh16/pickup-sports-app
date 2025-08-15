package com.bmessi.pickupsportsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 50) String preferredSport,
        @Size(max = 255) String location
) {}