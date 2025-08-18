package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record UpdateUserProfileRequest(
        @Size(max = 1000, message = "Bio must be at most 1000 characters")
        String bio,

        @Size(max = 512, message = "Avatar URL must be at most 512 characters")
        @Pattern(
                regexp = "^(https?://).+",
                message = "Avatar URL must be an absolute http(s) URL"
        )
        String avatarUrl,

        SkillLevel skillLevel
) {}