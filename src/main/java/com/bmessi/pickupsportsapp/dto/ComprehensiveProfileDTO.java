package com.bmessi.pickupsportsapp.dto;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import com.bmessi.pickupsportsapp.entity.User.Gender;
import com.bmessi.pickupsportsapp.entity.User.Rank;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive profile DTO that includes all profile information,
 * stats, badges, and teams for frontend compatibility.
 */
public record ComprehensiveProfileDTO(
        // Basic Profile Information
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
        
        // XP and Level System
        Integer xp,
        Integer level,
        Rank rank,
        
        // Verification Status
        Boolean isEmailVerified,
        Boolean isPhoneVerified,
        
        // Sports Preferences
        List<String> preferredSports,
        
        // Statistics
        UserStatsDTO stats,
        
        // Badges and Achievements
        List<BadgeDTO> badges,
        
        // Teams
        List<TeamDTO> teams,
        
        // Sports Profiles
        List<SportProfileDTO> sports,
        
        // Privacy Settings
        PrivacySettingsDTO privacy,
        
        // Security Settings
        SecuritySettingsDTO security,
        
        // Timestamps
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

/**
 * User statistics DTO
 */
record UserStatsDTO(
        Integer totalGames,
        Integer totalWins,
        Double winRate,
        Integer currentStreak,
        Integer longestStreak,
        Double fairPlayScore,
        String mostPlayedSport,
        List<Integer> recentWeeklyAttendance,
        Map<String, Integer> sportAppearances
) {}

/**
 * Badge DTO
 */
record BadgeDTO(
        String id,
        String name,
        String description,
        String icon,
        String color,
        LocalDateTime earnedAt,
        Integer level,
        Boolean isFeatured
) {}

/**
 * Team DTO
 */
record TeamDTO(
        String id,
        String name,
        String description,
        String sport,
        String role,
        LocalDateTime joinedAt,
        Boolean isActive
) {}

/**
 * Sport Profile DTO
 */
record SportProfileDTO(
        String sport,
        List<String> positions,
        Integer skillLevel,
        List<String> styleTags,
        String dominantFoot,
        String dominantHand,
        String intensity,
        Map<String, List<String>> availability,
        String notes,
        Boolean isVisible
) {}

/**
 * Privacy Settings DTO
 */
record PrivacySettingsDTO(
        Boolean showPublicly,
        List<String> publicFields,
        List<String> privateFields
) {}

/**
 * Security Settings DTO
 */
record SecuritySettingsDTO(
        Boolean has2FA,
        List<SessionDTO> activeSessions,
        LocalDateTime lastPasswordChange
) {}

/**
 * Session DTO
 */
record SessionDTO(
        String id,
        String device,
        String location,
        LocalDateTime lastActive,
        Boolean isCurrent
) {}
