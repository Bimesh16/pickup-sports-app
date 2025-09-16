package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;

/**
 * Returned when viewing user profiles.  Includes optional
 * age, position, and contact preference.
 */
public record UserProfileDTO(
        Long id,
        String username,
        String bio,
        String avatarUrl,
        String location,
        Double latitude,
        Double longitude,
        SkillLevel skillLevel,
        Integer age,
        String position,
        String contactPreference
) {}
