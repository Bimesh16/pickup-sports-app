package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.ComprehensiveProfileDTO;
import com.bmessi.pickupsportsapp.dto.UserStatsDTO;
import com.bmessi.pickupsportsapp.dto.BadgeDTO;
import com.bmessi.pickupsportsapp.dto.TeamDTO;
import com.bmessi.pickupsportsapp.dto.SportProfileDTO;
import com.bmessi.pickupsportsapp.dto.PrivacySettingsDTO;
import com.bmessi.pickupsportsapp.dto.SecuritySettingsDTO;
import com.bmessi.pickupsportsapp.dto.SessionDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.entity.UserAchievement;
import com.bmessi.pickupsportsapp.entity.Achievement;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.UserStatsRepository;
import com.bmessi.pickupsportsapp.repository.UserAchievementRepository;
import com.bmessi.pickupsportsapp.repository.AchievementRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ComprehensiveProfileService {

    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final AchievementRepository achievementRepository;
    private final ObjectMapper objectMapper;

    public ComprehensiveProfileDTO getComprehensiveProfile(String username) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserStats stats = userStatsRepository.findByUserId(user.getId())
                .orElse(createDefaultStats(user.getId()));

        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(user.getId());
        List<BadgeDTO> badges = userAchievements.stream()
                .map(this::toBadgeDTO)
                .collect(Collectors.toList());

        // TODO: Implement teams and sports profiles
        List<TeamDTO> teams = List.of();
        List<SportProfileDTO> sports = List.of();

        return new ComprehensiveProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getDisplayName(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getLocation(),
                user.getLatitude(),
                user.getLongitude(),
                user.getSkillLevel(),
                user.getAge(),
                user.getPosition(),
                user.getContactPreference(),
                user.getPhone(),
                user.getGender(),
                user.getNationality(),
                user.getXp(),
                user.getLevel(),
                user.getRank(),
                user.getIsEmailVerified(),
                user.getIsPhoneVerified(),
                parsePreferredSports(user.getPreferredSports()),
                toUserStatsDTO(stats),
                badges,
                teams,
                sports,
                parsePrivacySettings(user.getPrivacySettings()),
                parseSecuritySettings(user.getSecuritySettings()),
                user.getCreatedAt().toLocalDateTime(),
                user.getUpdatedAt().toLocalDateTime()
        );
    }

    private UserStats createDefaultStats(Long userId) {
        UserStats stats = new UserStats();
        stats.setUser(userRepository.findById(userId).orElseThrow());
        return userStatsRepository.save(stats);
    }

    private UserStatsDTO toUserStatsDTO(UserStats stats) {
        return new UserStatsDTO(
                stats.getTotalGamesPlayed(),
                stats.getTotalGamesWon(),
                calculateWinRate(stats.getTotalGamesPlayed(), stats.getTotalGamesWon()),
                stats.getCurrentStreak(),
                stats.getLongestStreak(),
                stats.getAverageRating(),
                stats.getMostActiveSport(),
                List.of(3, 2, 4, 1, 3, 2, 4), // TODO: Calculate from actual data
                Map.of("Futsal", 25, "Basketball", 15, "Volleyball", 5) // TODO: Calculate from actual data
        );
    }

    private BadgeDTO toBadgeDTO(UserAchievement userAchievement) {
        Achievement achievement = userAchievement.getAchievement();
        return new BadgeDTO(
                userAchievement.getId().toString(),
                achievement.getName(),
                achievement.getDescription(),
                achievement.getBadgeIcon(),
                achievement.getBadgeColor(),
                userAchievement.getEarnedAt(),
                userAchievement.getCurrentLevel(),
                userAchievement.getIsFeatured()
        );
    }

    private List<String> parsePreferredSports(String preferredSportsJson) {
        try {
            if (preferredSportsJson == null || preferredSportsJson.trim().isEmpty()) {
                return List.of();
            }
            return objectMapper.readValue(preferredSportsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse preferred sports JSON: {}", preferredSportsJson, e);
            return List.of();
        }
    }

    private PrivacySettingsDTO parsePrivacySettings(String privacySettingsJson) {
        try {
            if (privacySettingsJson == null || privacySettingsJson.trim().isEmpty()) {
                return new PrivacySettingsDTO(true, List.of("bio", "stats", "badges"), List.of("email", "phone"));
            }
            return objectMapper.readValue(privacySettingsJson, PrivacySettingsDTO.class);
        } catch (Exception e) {
            log.warn("Failed to parse privacy settings JSON: {}", privacySettingsJson, e);
            return new PrivacySettingsDTO(true, List.of("bio", "stats", "badges"), List.of("email", "phone"));
        }
    }

    private SecuritySettingsDTO parseSecuritySettings(String securitySettingsJson) {
        try {
            if (securitySettingsJson == null || securitySettingsJson.trim().isEmpty()) {
                return new SecuritySettingsDTO(false, List.of(), LocalDateTime.now());
            }
            return objectMapper.readValue(securitySettingsJson, SecuritySettingsDTO.class);
        } catch (Exception e) {
            log.warn("Failed to parse security settings JSON: {}", securitySettingsJson, e);
            return new SecuritySettingsDTO(false, List.of(), LocalDateTime.now());
        }
    }

    private Double calculateWinRate(Integer totalGames, Integer totalWins) {
        if (totalGames == null || totalGames == 0) {
            return 0.0;
        }
        return (double) totalWins / totalGames * 100;
    }
}
