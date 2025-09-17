package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import com.bmessi.pickupsportsapp.entity.User.Gender;
import com.bmessi.pickupsportsapp.entity.User.Rank;

/**
 * Returned when viewing user profiles.  Includes comprehensive
 * profile information for frontend compatibility.
 */
public record UserProfileDTO(
        Long id,
        String username,
        String firstName,
        String lastName,
        String email,
        String displayName,
        String bio,
        String avatarUrl,
        String location,
        Double latitude,
        Double longitude,
        SkillLevel skillLevel,
        Integer age,
        String position,
        String contactPreference,
        String phone,
        Gender gender,
        String nationality,
        Integer xp,
        Integer level,
        Rank rank,
        Boolean isEmailVerified,
        Boolean isPhoneVerified,
        String preferredSports, // JSON array
        String privacySettings, // JSON object
        String securitySettings // JSON object
) {}
