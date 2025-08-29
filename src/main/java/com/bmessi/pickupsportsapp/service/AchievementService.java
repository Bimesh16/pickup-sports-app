package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Achievement;
import com.bmessi.pickupsportsapp.entity.UserAchievement;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.AchievementRepository;
import com.bmessi.pickupsportsapp.repository.UserAchievementRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AchievementService {
    
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;
    private final UserStatsService userStatsService;
    
    /**
     * Check and award achievements for a user
     */
    public void checkAndAwardAchievements(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        List<Achievement> availableAchievements = achievementRepository.findByIsActiveTrue();
        
        for (Achievement achievement : availableAchievements) {
            if (shouldAwardAchievement(user, achievement)) {
                awardAchievement(user, achievement);
            }
        }
    }
    
    /**
     * Check if a user should be awarded an achievement
     */
    private boolean shouldAwardAchievement(User user, Achievement achievement) {
        // Check if user already has this achievement
        if (userHasAchievement(user.getId(), achievement.getId())) {
            return false;
        }
        
        // Check if achievement is available
        if (!achievement.isAvailable()) {
            return false;
        }
        
        // Check requirements based on achievement type
        return checkAchievementRequirements(user, achievement);
    }
    
    /**
     * Check achievement requirements
     */
    private boolean checkAchievementRequirements(User user, Achievement achievement) {
        String metric = achievement.getRequirementMetric();
        int requiredValue = achievement.getRequirementValue();
        
        switch (metric) {
            case "games_played":
                return checkGamesPlayedRequirement(user, requiredValue);
            case "games_created":
                return checkGamesCreatedRequirement(user, requiredValue);
            case "streak_days":
                return checkStreakRequirement(user, requiredValue);
            case "total_play_time":
                return checkPlayTimeRequirement(user, requiredValue);
            case "rating":
                return checkRatingRequirement(user, requiredValue);
            case "social_score":
                return checkSocialScoreRequirement(user, requiredValue);
            case "friends_count":
                return checkFriendsCountRequirement(user, requiredValue);
            default:
                log.warn("Unknown achievement metric: {}", metric);
                return false;
        }
    }
    
    private boolean checkGamesPlayedRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getTotalGamesPlayed() >= requiredValue;
    }
    
    private boolean checkGamesCreatedRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getTotalGamesCreated() >= requiredValue;
    }
    
    private boolean checkStreakRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getCurrentStreak() >= requiredValue;
    }
    
    private boolean checkPlayTimeRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getTotalPlayTimeHours() >= requiredValue;
    }
    
    private boolean checkRatingRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getAverageRating() != null && stats.getAverageRating() >= requiredValue;
    }
    
    private boolean checkSocialScoreRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getSocialScore() >= requiredValue;
    }
    
    private boolean checkFriendsCountRequirement(User user, int requiredValue) {
        var stats = userStatsService.getUserStats(user.getId());
        return stats.getTotalFriends() >= requiredValue;
    }
    
    /**
     * Award an achievement to a user
     */
    private void awardAchievement(User user, Achievement achievement) {
        UserAchievement userAchievement = UserAchievement.builder()
                .user(user)
                .achievement(achievement)
                .earnedAt(LocalDateTime.now())
                .progressPercentage(100)
                .currentLevel(1)
                .maxLevel(achievement.getMaxLevels())
                .pointsEarned(achievement.calculatePoints(1))
                .status(UserAchievement.AchievementStatus.ACTIVE)
                .build();
        
        userAchievementRepository.save(userAchievement);
        
        // Update user stats with achievement points
        userStatsService.updateSocialScore(user.getId(), achievement.getBasePoints());
        
        log.info("Awarded achievement '{}' to user {}", achievement.getName(), user.getUsername());
    }
    
    /**
     * Get user's achievements
     */
    public List<UserAchievement> getUserAchievements(Long userId) {
        return userAchievementRepository.findByUserIdAndStatus(userId, UserAchievement.AchievementStatus.ACTIVE);
    }
    
    /**
     * Get user's achievement progress
     */
    public AchievementProgress getAchievementProgress(Long userId) {
        List<UserAchievement> earnedAchievements = getUserAchievements(userId);
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        
        int totalAchievements = allAchievements.size();
        int earnedCount = earnedAchievements.size();
        int totalPoints = earnedAchievements.stream()
                .mapToInt(UserAchievement::getPointsEarned)
                .sum();
        
        return AchievementProgress.builder()
                .totalAchievements(totalAchievements)
                .earnedAchievements(earnedCount)
                .completionPercentage((double) earnedCount / totalAchievements * 100)
                .totalPoints(totalPoints)
                .achievements(earnedAchievements)
                .build();
    }
    
    /**
     * Get featured achievements
     */
    public List<Achievement> getFeaturedAchievements() {
        return achievementRepository.findByIsFeaturedTrueAndIsActiveTrue();
    }
    
    /**
     * Get achievements by category
     */
    public List<Achievement> getAchievementsByCategory(Achievement.AchievementCategory category) {
        return achievementRepository.findByCategoryAndIsActiveTrue(category);
    }
    
    /**
     * Check if user has a specific achievement
     */
    public boolean userHasAchievement(Long userId, Long achievementId) {
        return userAchievementRepository.existsByUserIdAndAchievementId(userId, achievementId);
    }
    
    /**
     * Get achievement rarity distribution
     */
    public AchievementRarityStats getAchievementRarityStats() {
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        
        long commonCount = allAchievements.stream()
                .filter(a -> a.getBasePoints() <= 100)
                .count();
        long rareCount = allAchievements.stream()
                .filter(a -> a.getBasePoints() > 100 && a.getBasePoints() <= 500)
                .count();
        long epicCount = allAchievements.stream()
                .filter(a -> a.getBasePoints() > 500 && a.getBasePoints() <= 1000)
                .count();
        long legendaryCount = allAchievements.stream()
                .filter(a -> a.getBasePoints() > 1000)
                .count();
        
        return AchievementRarityStats.builder()
                .common((int) commonCount)
                .rare((int) rareCount)
                .epic((int) epicCount)
                .legendary((int) legendaryCount)
                .total(allAchievements.size())
                .build();
    }
    
    // DTOs for API responses
    @lombok.Data
    @lombok.Builder
    public static class AchievementProgress {
        private int totalAchievements;
        private int earnedAchievements;
        private double completionPercentage;
        private int totalPoints;
        private List<UserAchievement> achievements;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class AchievementRarityStats {
        private int common;
        private int rare;
        private int epic;
        private int legendary;
        private int total;
    }
}
