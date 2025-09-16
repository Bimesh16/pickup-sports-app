package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import jakarta.validation.constraints.*;

public record UpdateUserProfileRequest(
        @Size(max = 1000, message = "Bio must be at most 1000 characters")
        String bio,

        @Size(max = 255, message = "Location must be at most 255 characters")
        String location,

        @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
        Double latitude,

        @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
        Double longitude,

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
