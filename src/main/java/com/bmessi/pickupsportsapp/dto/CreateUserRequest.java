package com.bmessi.pickupsportsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Size(max = 100) String password,
        @Size(max = 50) String preferredSport,
        @Size(max = 255) String location
) {}