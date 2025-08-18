package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import jakarta.validation.constraints.*;

public record UpdateUserProfileRequest(
        @Size(max = 1000, message = "Bio must be at most 1000 characters")
        String bio,

        @Size(max = 512, message = "Avatar URL must be at most 512 characters")
        @Pattern(regexp = "^(https?://).+", message = "Avatar URL must be an absolute http(s) URL")
        String avatarUrl,

        SkillLevel skillLevel,

        @Min(value = 1, message = "Age must be at least 1")
        @Max(value = 120, message = "Age must be at most 120")
        Integer age,

        @Size(max = 100, message = "Position must be at most 100 characters")
        String position,

        @Size(max = 50, message = "Contact preference must be at most 50 characters")
        String contactPreference
) {}
