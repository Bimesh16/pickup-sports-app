package com.bmessi.pickupsportsapp.service.dashboard;

import com.bmessi.pickupsportsapp.entity.Achievement;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserAchievement;
import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.entity.GameParticipation;
import com.bmessi.pickupsportsapp.repository.AchievementRepository;
import com.bmessi.pickupsportsapp.repository.UserAchievementRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameParticipationRepository;
import com.bmessi.pickupsportsapp.service.UserStatsService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import com.bmessi.pickupsportsapp.realtime.event.ActivityFeedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced achievement service with real-time progress tracking and notifications.
 * 
 * Features:
 * - Real-time achievement progress updates
 * - Smart achievement recommendations
 * - Progressive achievement tracking
 * - Social achievement sharing
 * - Achievement analytics and insights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedAchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;
    private final GameParticipationRepository participationRepository;
    private final UserStatsService userStatsService;
    private final RealTimeEventService realTimeEventService;

    /**
     * Check and update achievement progress for a user after any activity.
     */
    @Transactional
    public List<Achievement> checkAndUpdateAchievements(Long userId, String triggerEvent, 
                                                      Map<String, Object> eventData) {
        List<Achievement> newlyEarned = new ArrayList<>();
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            
            UserStats stats = userStatsService.getUserStats(userId);
            List<Achievement> activeAchievements = achievementRepository.findByIsActiveTrue();
            List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
            
            Map<Long, UserAchievement> achievementMap = userAchievements.stream()
                    .collect(Collectors.toMap(ua -> ua.getAchievement().getId(), ua -> ua));

            for (Achievement achievement : activeAchievements) {
                UserAchievement userAchievement = achievementMap.get(achievement.getId());
                
                // Skip if already completed
                if (userAchievement != null && userAchievement.isCompleted()) {
                    continue;
                }
                
                // Calculate current progress
                AchievementProgress progress = calculateAchievementProgress(achievement, stats, userId);
                
                if (userAchievement == null) {
                    // Create new user achievement record
                    userAchievement = UserAchievement.builder()
                            .user(user)
                            .achievement(achievement)
                            .progressPercentage((int) progress.progressPercentage)
                            .build();
                } else {
                    // Update existing progress
                    int oldProgress = userAchievement.getProgressPercentage();
                    userAchievement.setProgressPercentage((int) progress.progressPercentage);
                    
                    // Send progress update if significant change
                    if (Math.abs(progress.progressPercentage - oldProgress) >= 10.0) {
                        sendProgressUpdateNotification(user.getUsername(), achievement, progress.progressPercentage);
                    }
                }
                
                // If newly completed
                if (progress.isCompleted && (userAchievement.getEarnedAt() == null)) {
                    userAchievement.setEarnedAt(LocalDateTime.now());
                    userAchievement.setPointsEarned(achievement.calculatePoints(progress.currentLevel));
                    
                    newlyEarned.add(achievement);
                    
                    // Send achievement earned notification
                    sendAchievementEarnedNotification(user.getUsername(), achievement);
                    
                    // Create activity feed entry
                    createAchievementActivityFeed(user.getUsername(), achievement);
                    
                    log.info("User {} earned achievement: {} ({}pts)", 
                            user.getUsername(), achievement.getName(), userAchievement.getPointsEarned());
                }
                
                userAchievementRepository.save(userAchievement);
            }
            
        } catch (Exception e) {
            log.error("Error checking achievements for user {}: {}", userId, e.getMessage());
        }
        
        return newlyEarned;
    }

    /**
     * Get detailed achievement analytics for a user.
     */
    @Transactional(readOnly = true)
    public AchievementAnalytics getAchievementAnalytics(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(user.getId());
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        
        // Calculate statistics
        int totalCompleted = (int) userAchievements.stream().filter(UserAchievement::isCompleted).count();
        int totalPoints = userAchievements.stream()
                .filter(UserAchievement::isCompleted)
                .mapToInt(ua -> ua.getPointsEarned() != null ? ua.getPointsEarned() : 0)
                .sum();
        
        Map<Achievement.AchievementCategory, Integer> categoryBreakdown = userAchievements.stream()
                .filter(UserAchievement::isCompleted)
                .collect(Collectors.groupingBy(
                    ua -> ua.getAchievement().getCategory(),
                    Collectors.summingInt(ua -> 1)
                ));
        
        // Find next recommended achievements
        List<Achievement> recommendations = getAchievementRecommendations(user.getId(), 5);
        
        // Calculate completion rate
        double completionRate = allAchievements.size() > 0 ? 
                               (double) totalCompleted / allAchievements.size() * 100 : 0.0;
        
        return AchievementAnalytics.builder()
                .userId(user.getId())
                .username(username)
                .totalAchievements(allAchievements.size())
                .completedAchievements(totalCompleted)
                .totalPointsEarned(totalPoints)
                .completionRate(completionRate)
                .categoryBreakdown(categoryBreakdown)
                .recentlyEarned(getRecentlyEarnedAchievements(user.getId(), 10))
                .recommendations(recommendations)
                .progressStreaks(calculateProgressStreaks(user.getId()))
                .build();
    }

    /**
     * Get achievement leaderboard.
     */
    @Transactional(readOnly = true)
    public AchievementLeaderboard getAchievementLeaderboard(int limit) {
        List<Object[]> topByPoints = userAchievementRepository.findTopUsersByTotalPoints();
        List<Object[]> topByCount = userAchievementRepository.findTopUsersByAchievementCount();
        List<Object[]> recentEarners = userAchievementRepository.findRecentAchievementEarners();
        
        return AchievementLeaderboard.builder()
                .topByPoints(convertToLeaderboardEntries(topByPoints, limit))
                .topByCount(convertToLeaderboardEntries(topByCount, limit))
                .recentEarners(convertToRecentEarners(recentEarners, limit))
                .build();
    }

    /**
     * Create custom achievement challenges.
     */
    @Transactional
    public Achievement createCustomChallenge(String name, String description, 
                                           Achievement.AchievementCategory category,
                                           String requirementMetric, int requirementValue,
                                           int pointsReward, LocalDateTime endDate) {
        Achievement challenge = Achievement.builder()
                .name(name)
                .description(description)
                .category(category)
                .type(Achievement.AchievementType.TIME_BOUND)
                .requirementMetric(requirementMetric)
                .requirementValue(requirementValue)
                .basePoints(pointsReward)
                .isActive(true)
                .startDate(LocalDateTime.now())
                .endDate(endDate)
                .isFeatured(true)
                .build();
        
        Achievement saved = achievementRepository.save(challenge);
        
        // Announce new challenge
        announceNewChallenge(saved);
        
        log.info("Created new achievement challenge: {} (ends: {})", name, endDate);
        return saved;
    }

    // Private helper methods

    private AchievementProgress calculateAchievementProgress(Achievement achievement, 
                                                           UserStats stats, Long userId) {
        String metric = achievement.getRequirementMetric();
        int required = achievement.getRequirementValue();
        
        double currentValue = switch (metric) {
            case "games_played" -> stats.getTotalGamesPlayed();
            case "games_won" -> stats.getTotalGamesWon();
            case "current_streak" -> stats.getCurrentStreak();
            case "longest_streak" -> stats.getLongestStreak();
            case "games_created" -> stats.getTotalGamesCreated();
            case "rating" -> stats.getAverageRating() != null ? stats.getAverageRating() : 0.0;
            case "social_score" -> stats.getSocialScore();
            case "play_time_hours" -> stats.getTotalPlayTimeHours();
            case "unique_sports" -> getUniqueSportsPlayed(userId);
            case "perfect_attendance" -> getPerfectAttendanceStreak(userId);
            default -> 0.0;
        };
        
        double progressPercentage = Math.min(100.0, (currentValue / required) * 100);
        boolean isCompleted = currentValue >= required;
        int currentLevel = achievement.isProgressive() ? 
                          Math.min((int) (currentValue / required), achievement.getMaxLevels()) : 
                          (isCompleted ? 1 : 0);
        
        return new AchievementProgress(progressPercentage, isCompleted, currentLevel, currentValue, required);
    }

    private double getUniqueSportsPlayed(Long userId) {
        List<GameParticipation> participations = participationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return participations.stream()
                .map(p -> p.getGame().getSport())
                .filter(Objects::nonNull)
                .distinct()
                .count();
    }

    private double getPerfectAttendanceStreak(Long userId) {
        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
        
        int streak = 0;
        for (GameParticipation participation : participations) {
            if (participation.getWasPresent()) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    private List<Achievement> getAchievementRecommendations(Long userId, int limit) {
        UserStats stats = userStatsService.getUserStats(userId);
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        
        Set<Long> earnedIds = userAchievements.stream()
                .filter(UserAchievement::isCompleted)
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        return allAchievements.stream()
                .filter(achievement -> !earnedIds.contains(achievement.getId()))
                .filter(achievement -> isRecommendedForUser(achievement, stats, userId))
                .sorted((a, b) -> {
                    // Sort by progress (closer to completion first)
                    AchievementProgress progressA = calculateAchievementProgress(a, stats, userId);
                    AchievementProgress progressB = calculateAchievementProgress(b, stats, userId);
                    return Double.compare(progressB.progressPercentage, progressA.progressPercentage);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    private boolean isRecommendedForUser(Achievement achievement, UserStats stats, Long userId) {
        // Recommend achievements that are:
        // 1. At least 25% progress
        // 2. Not too difficult (within 2x current performance)
        // 3. Match user's activity patterns
        
        AchievementProgress progress = calculateAchievementProgress(achievement, stats, userId);
        
        if (progress.progressPercentage < 25.0) {
            return false; // Too early to recommend
        }
        
        if (progress.progressPercentage > 95.0) {
            return true; // Almost there, definitely recommend
        }
        
        // Check if achievement matches user's patterns
        return switch (achievement.getRequirementMetric()) {
            case "games_played", "games_won" -> stats.getTotalGamesPlayed() > 0;
            case "games_created" -> stats.getTotalGamesCreated() > 0;
            case "social_score" -> stats.getSocialScore() > 0;
            case "rating" -> stats.getAverageRating() != null && stats.getAverageRating() > 0;
            default -> true;
        };
    }

    private List<UserAchievement> getRecentlyEarnedAchievements(Long userId, int limit) {
        return userAchievementRepository.findByUserIdAndIsCompletedTrueOrderByCompletedAtDesc(userId)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<ProgressStreak> calculateProgressStreaks(Long userId) {
        List<UserAchievement> completedAchievements = userAchievementRepository
                .findByUserIdAndIsCompletedTrueOrderByCompletedAtDesc(userId);
        
        if (completedAchievements.isEmpty()) {
            return List.of();
        }
        
        List<ProgressStreak> streaks = new ArrayList<>();
        
        // Group achievements by completion date proximity
        List<UserAchievement> currentStreak = new ArrayList<>();
        LocalDateTime lastDate = null;
        
        for (UserAchievement achievement : completedAchievements) {
            if (achievement.getEarnedAt() == null) continue;
            
            if (lastDate == null || 
                ChronoUnit.DAYS.between(achievement.getEarnedAt(), lastDate) <= 7) {
                currentStreak.add(achievement);
            } else {
                if (currentStreak.size() >= 2) {
                    streaks.add(createProgressStreak(currentStreak));
                }
                currentStreak = new ArrayList<>();
                currentStreak.add(achievement);
            }
            
            lastDate = achievement.getEarnedAt();
        }
        
        // Add final streak if exists
        if (currentStreak.size() >= 2) {
            streaks.add(createProgressStreak(currentStreak));
        }
        
        return streaks;
    }

    private ProgressStreak createProgressStreak(List<UserAchievement> achievements) {
        LocalDateTime startDate = achievements.stream()
                .map(UserAchievement::getEarnedAt)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(null);
        
        LocalDateTime endDate = achievements.stream()
                .map(UserAchievement::getEarnedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        
        int totalPoints = achievements.stream()
                .mapToInt(ua -> ua.getPointsEarned() != null ? ua.getPointsEarned() : 0)
                .sum();
        
        return ProgressStreak.builder()
                .achievementCount(achievements.size())
                .totalPoints(totalPoints)
                .startDate(startDate)
                .endDate(endDate)
                .achievements(achievements.stream()
                        .map(ua -> ua.getAchievement().getName())
                        .collect(Collectors.toList()))
                .build();
    }

    private void sendProgressUpdateNotification(String username, Achievement achievement, 
                                              double progressPercentage) {
        try {
            NotificationEvent notification = new NotificationEvent(
                username,
                "Achievement Progress",
                String.format("%.0f%% complete: %s", progressPercentage, achievement.getName()),
                "ACHIEVEMENT_PROGRESS",
                "/achievements/" + achievement.getId()
            );
            
            realTimeEventService.publishEvent(notification);
            log.debug("Sent progress notification to {}: {} ({}%)", 
                     username, achievement.getName(), progressPercentage);
                     
        } catch (Exception e) {
            log.error("Error sending progress notification: {}", e.getMessage());
        }
    }

    private void sendAchievementEarnedNotification(String username, Achievement achievement) {
        try {
            NotificationEvent notification = new NotificationEvent(
                username,
                "🏆 Achievement Unlocked!",
                "Congratulations! You've earned: " + achievement.getName(),
                "ACHIEVEMENT_EARNED",
                "/achievements/" + achievement.getId()
            );
            
            realTimeEventService.publishEvent(notification);
            log.debug("Sent achievement earned notification to {}: {}", username, achievement.getName());
            
        } catch (Exception e) {
            log.error("Error sending achievement earned notification: {}", e.getMessage());
        }
    }

    private void createAchievementActivityFeed(String username, Achievement achievement) {
        try {
            ActivityFeedEvent activityEvent = new ActivityFeedEvent(
                username,
                "EARNED_ACHIEVEMENT",
                "ACHIEVEMENT",
                achievement.getId(),
                username + " earned the achievement: " + achievement.getName()
            );
            
            realTimeEventService.publishEvent(activityEvent);
            log.debug("Created activity feed for achievement earned: {}", achievement.getName());
            
        } catch (Exception e) {
            log.error("Error creating achievement activity feed: {}", e.getMessage());
        }
    }

    private void announceNewChallenge(Achievement challenge) {
        try {
            // Create system announcement for new challenge
            com.bmessi.pickupsportsapp.realtime.event.SystemAnnouncementEvent announcement = 
                new com.bmessi.pickupsportsapp.realtime.event.SystemAnnouncementEvent(
                    "🎯 New Challenge Available!",
                    challenge.getName() + " - " + challenge.getDescription(),
                    "INFO",
                    "System"
                );
            
            realTimeEventService.publishEvent(announcement);
            log.info("Announced new challenge: {}", challenge.getName());
            
        } catch (Exception e) {
            log.error("Error announcing new challenge: {}", e.getMessage());
        }
    }

    private List<LeaderboardEntry> convertToLeaderboardEntries(List<Object[]> results, int limit) {
        return results.stream()
                .limit(limit)
                .map(row -> LeaderboardEntry.builder()
                        .username((String) row[0])
                        .value(((Number) row[1]).longValue())
                        .rank(0) // Would be calculated based on position
                        .build())
                .collect(Collectors.toList());
    }

    private List<RecentEarner> convertToRecentEarners(List<Object[]> results, int limit) {
        return results.stream()
                .limit(limit)
                .map(row -> RecentEarner.builder()
                        .username((String) row[0])
                        .achievementName((String) row[1])
                        .earnedAt((LocalDateTime) row[2])
                        .pointsEarned(((Number) row[3]).intValue())
                        .build())
                .collect(Collectors.toList());
    }

    // Data Transfer Objects

    private static class AchievementProgress {
        final double progressPercentage;
        final boolean isCompleted;
        final int currentLevel;
        final double currentValue;
        final double requiredValue;
        
        AchievementProgress(double progressPercentage, boolean isCompleted, int currentLevel,
                          double currentValue, double requiredValue) {
            this.progressPercentage = progressPercentage;
            this.isCompleted = isCompleted;
            this.currentLevel = currentLevel;
            this.currentValue = currentValue;
            this.requiredValue = requiredValue;
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class AchievementAnalytics {
        private Long userId;
        private String username;
        private int totalAchievements;
        private int completedAchievements;
        private int totalPointsEarned;
        private double completionRate;
        private Map<Achievement.AchievementCategory, Integer> categoryBreakdown;
        private List<UserAchievement> recentlyEarned;
        private List<Achievement> recommendations;
        private List<ProgressStreak> progressStreaks;
    }

    @lombok.Data
    @lombok.Builder
    public static class AchievementLeaderboard {
        private List<LeaderboardEntry> topByPoints;
        private List<LeaderboardEntry> topByCount;
        private List<RecentEarner> recentEarners;
    }

    @lombok.Data
    @lombok.Builder
    public static class LeaderboardEntry {
        private String username;
        private long value;
        private int rank;
    }

    @lombok.Data
    @lombok.Builder
    public static class RecentEarner {
        private String username;
        private String achievementName;
        private LocalDateTime earnedAt;
        private int pointsEarned;
    }

    @lombok.Data
    @lombok.Builder
    public static class ProgressStreak {
        private int achievementCount;
        private int totalPoints;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private List<String> achievements;
    }
}
