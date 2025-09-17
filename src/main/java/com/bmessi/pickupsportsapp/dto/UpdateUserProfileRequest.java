package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import com.bmessi.pickupsportsapp.entity.User.Gender;
import com.bmessi.pickupsportsapp.entity.User.Rank;
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
        String contactPreference,

        // Additional fields for frontend compatibility
        @Size(max = 50, message = "First name must be at most 50 characters")
        String firstName,

        @Size(max = 50, message = "Last name must be at most 50 characters")
        String lastName,

        @Size(max = 100, message = "Display name must be at most 100 characters")
        String displayName,

        Gender gender,

        @Size(max = 2, message = "Nationality must be a 2-character country code")
        @Pattern(regexp = "^[A-Z]{2}$", message = "Nationality must be a valid ISO 3166-1 alpha-2 country code")
        String nationality,

        @Min(value = 0, message = "XP cannot be negative")
        Integer xp,

        @Min(value = 1, message = "Level must be at least 1")
        Integer level,

        Rank rank,

        @Size(max = 20, message = "Phone number must be at most 20 characters")
        @Pattern(regexp = "^[+]?[0-9\\s\\-\\(\\)]+$", message = "Phone number must contain only numbers, spaces, hyphens, and parentheses")
        String phone,

        String preferredSports, // JSON array
        String privacySettings, // JSON object
        String securitySettings // JSON object
) {}
