package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;

public record UserProfileDTO(
        Long id,
        String username,
        String bio,
        String avatarUrl,
        SkillLevel skillLevel
) {}