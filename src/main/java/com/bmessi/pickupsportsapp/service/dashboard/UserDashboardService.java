package com.bmessi.pickupsportsapp.service.dashboard;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.entity.GameParticipation;
import com.bmessi.pickupsportsapp.entity.Achievement;
import com.bmessi.pickupsportsapp.entity.UserAchievement;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.GameParticipationRepository;
import com.bmessi.pickupsportsapp.repository.AchievementRepository;
import com.bmessi.pickupsportsapp.repository.UserAchievementRepository;
import com.bmessi.pickupsportsapp.service.UserStatsService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Comprehensive service for user dashboard data and analytics.
 * 
 * Provides:
 * - Personal statistics and insights
 * - Game history and performance analytics
 * - Achievement progress and recommendations
 * - Skill progression tracking
 * - Social activity and connections
 * - Real-time dashboard updates
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDashboardService {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final GameParticipationRepository participationRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserStatsService userStatsService;
    private final RealTimeEventService realTimeEventService;

    /**
     * Get comprehensive dashboard data for a user.
     */
    @Transactional(readOnly = true)
    public DashboardSummary getUserDashboard(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        UserStats stats = userStatsService.getUserStats(user.getId());
        
        return DashboardSummary.builder()
                .user(UserSummary.fromUser(user))
                .statistics(PersonalStatistics.fromUserStats(stats, user.getId()))
                .recentActivity(getRecentActivity(user.getId(), 10))
                .achievements(getAchievementProgress(user.getId()))
                .skillProgression(getSkillProgression(user.getId()))
                .socialInsights(getSocialInsights(user.getId()))
                .upcomingGames(getUpcomingGames(user.getId(), 5))
                .recommendations(getDashboardRecommendations(user.getId()))
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    /**
     * Get detailed game history for a user.
     */
    @Transactional(readOnly = true)
    public Page<GameHistoryItem> getUserGameHistory(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        Page<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return participations.map(this::convertToGameHistoryItem);
    }

    /**
     * Get performance analytics for a user over time.
     */
    @Transactional(readOnly = true)
    public PerformanceAnalytics getUserPerformanceAnalytics(String username, int days) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        
        List<GameParticipation> recentParticipations = participationRepository
                .findByUserIdAndCreatedAtAfter(user.getId(), since);

        return PerformanceAnalytics.builder()
                .userId(user.getId())
                .username(username)
                .periodDays(days)
                .totalGames(recentParticipations.size())
                .winRate(calculateWinRate(recentParticipations))
                .averageRating(calculateAverageRating(recentParticipations))
                .sportsBreakdown(getSportsBreakdown(recentParticipations))
                .performanceTrend(calculatePerformanceTrend(recentParticipations))
                .skillLevelChanges(getSkillLevelChanges(user.getId(), since))
                .socialMetrics(calculateSocialMetrics(recentParticipations))
                .build();
    }

    /**
     * Get achievement progress and recommendations.
     */
    @Transactional(readOnly = true)
    public AchievementProgress getAchievementProgress(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        return getAchievementProgress(user.getId());
    }

    /**
     * Get user's skill progression across different sports.
     */
    @Transactional(readOnly = true)
    public List<SkillProgression> getSkillProgression(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        return getSkillProgression(user.getId());
    }

    /**
     * Get social insights and connection analytics.
     */
    @Transactional(readOnly = true)
    public SocialInsights getSocialInsights(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        return getSocialInsights(user.getId());
    }

    /**
     * Update user stats after game completion and trigger real-time updates.
     */
    @Transactional
    public void updateUserStatsAfterGame(Long userId, Long gameId, GameParticipation.GameResult result, 
                                       Double performanceRating, Double sportsmanshipRating) {
        try {
            // Update basic stats
            boolean won = result == GameParticipation.GameResult.WIN;
            userStatsService.updateStatsAfterGame(userId, gameId, won, 2.0); // Assume 2 hour games
            
            // Update performance rating if provided
            if (performanceRating != null) {
                userStatsService.updateUserRating(userId, performanceRating);
            }
            
            // Check for new achievements
            List<Achievement> newAchievements = checkForNewAchievements(userId);
            
            // Send real-time updates for new achievements
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                for (Achievement achievement : newAchievements) {
                    sendAchievementNotification(user.getUsername(), achievement);
                }
                
                // Send dashboard update notification
                sendDashboardUpdateNotification(user.getUsername(), "stats_updated");
            }
            
            log.info("Updated stats for user {} after game {}: result={}, rating={}", 
                    userId, gameId, result, performanceRating);
                    
        } catch (Exception e) {
            log.error("Error updating user stats for user {} after game {}: {}", 
                     userId, gameId, e.getMessage());
        }
    }

    // Private helper methods

    private List<RecentActivityItem> getRecentActivity(Long userId, int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<GameParticipation> recentParticipations = participationRepository
                .findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, since);

        return recentParticipations.stream()
                .limit(limit)
                .map(this::convertToActivityItem)
                .collect(Collectors.toList());
    }

    private AchievementProgress getAchievementProgress(Long userId) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        List<Achievement> availableAchievements = achievementRepository.findByIsActiveTrue();
        
        Map<Long, UserAchievement> achievementMap = userAchievements.stream()
                .collect(Collectors.toMap(ua -> ua.getAchievement().getId(), ua -> ua));

        List<AchievementItem> completed = new ArrayList<>();
        List<AchievementItem> inProgress = new ArrayList<>();
        List<AchievementItem> available = new ArrayList<>();

        for (Achievement achievement : availableAchievements) {
            UserAchievement userAchievement = achievementMap.get(achievement.getId());
            AchievementItem item = AchievementItem.fromAchievement(achievement, userAchievement);
            
            if (userAchievement != null && userAchievement.isCompleted()) {
                completed.add(item);
            } else if (userAchievement != null) {
                inProgress.add(item);
            } else {
                available.add(item);
            }
        }

        int totalPoints = userAchievements.stream()
                .filter(UserAchievement::isCompleted)
                .mapToInt(ua -> ua.getPointsEarned() != null ? ua.getPointsEarned() : 0)
                .sum();

        return AchievementProgress.builder()
                .totalPoints(totalPoints)
                .completedCount(completed.size())
                .inProgressCount(inProgress.size())
                .availableCount(available.size())
                .completed(completed)
                .inProgress(inProgress)
                .available(available.stream().limit(5).collect(Collectors.toList())) // Show top 5 available
                .build();
    }

    private List<SkillProgression> getSkillProgression(Long userId) {
        // Group participations by sport and calculate progression
        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, List<GameParticipation>> sportGroups = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(p -> p.getGame().getSport()));

        return sportGroups.entrySet().stream()
                .map(entry -> calculateSkillProgressionForSport(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private SocialInsights getSocialInsights(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<GameParticipation> recentParticipations = participationRepository
                .findByUserIdAndCreatedAtAfter(userId, since);

        // Calculate social metrics
        Set<Long> uniqueGames = recentParticipations.stream()
                .map(p -> p.getGame().getId())
                .collect(Collectors.toSet());

        int totalConnections = recentParticipations.stream()
                .mapToInt(p -> p.getNewConnectionsMade() != null ? p.getNewConnectionsMade() : 0)
                .sum();

        double avgTeamChemistry = recentParticipations.stream()
                .filter(p -> p.getTeamChemistryRating() != null)
                .mapToDouble(GameParticipation::getTeamChemistryRating)
                .average()
                .orElse(0.0);

        return SocialInsights.builder()
                .totalGamesPlayed(uniqueGames.size())
                .newConnectionsMade(totalConnections)
                .averageTeamChemistry(avgTeamChemistry)
                .favoritePlaymates(getFavoritePlaymates(userId, 5))
                .socialScore(userStatsService.getUserStats(userId).getSocialScore())
                .build();
    }

    private List<Game> getUpcomingGames(Long userId, int limit) {
        return gameRepository.findUpcomingGamesByUserId(userId)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<DashboardRecommendation> getDashboardRecommendations(Long userId) {
        List<DashboardRecommendation> recommendations = new ArrayList<>();
        
        UserStats stats = userStatsService.getUserStats(userId);
        
        // Recommend based on user patterns
        if (stats.getTotalGamesPlayed() > 0) {
            LocalDateTime lastGame = stats.getLastGameDate();
            if (lastGame != null && ChronoUnit.DAYS.between(lastGame, LocalDateTime.now()) > 7) {
                recommendations.add(new DashboardRecommendation(
                    "GAME_SUGGESTION",
                    "Time for another game!",
                    "You haven't played in a week. Check out some new games nearby.",
                    "/games/search",
                    DashboardRecommendation.Priority.MEDIUM
                ));
            }
        }
        
        // Achievement recommendations
        List<Achievement> nearCompletion = findNearCompletionAchievements(userId);
        for (Achievement achievement : nearCompletion) {
            recommendations.add(new DashboardRecommendation(
                "ACHIEVEMENT_PROGRESS",
                "Almost there! " + achievement.getName(),
                "You're close to earning this achievement. Keep it up!",
                "/achievements/" + achievement.getId(),
                DashboardRecommendation.Priority.HIGH
            ));
        }

        return recommendations;
    }

    private GameHistoryItem convertToGameHistoryItem(GameParticipation participation) {
        Game game = participation.getGame();
        
        return GameHistoryItem.builder()
                .gameId(game.getId())
                .sport(game.getSport())
                .location(game.getLocation())
                .gameDate(game.getTime() != null ? game.getTime().toLocalDateTime() : null)
                .participationType(participation.getParticipationType())
                .result(participation.getGameResult())
                .performanceRating(participation.getPerformanceRating())
                .sportsmanshipRating(participation.getSportsmanshipRating())
                .enjoymentLevel(participation.getEnjoymentLevel())
                .durationMinutes(participation.getParticipationDurationMinutes())
                .wasPresent(participation.getWasPresent())
                .build();
    }

    private RecentActivityItem convertToActivityItem(GameParticipation participation) {
        Game game = participation.getGame();
        
        return RecentActivityItem.builder()
                .activityType("GAME_PARTICIPATION")
                .title(participation.getParticipationType() + " in " + game.getSport())
                .description("Played " + game.getSport() + " at " + game.getLocation())
                .timestamp(participation.getCreatedAt())
                .relatedEntityId(game.getId())
                .relatedEntityType("GAME")
                .metadata(Map.of(
                    "sport", game.getSport(),
                    "location", game.getLocation(),
                    "result", participation.getGameResult() != null ? 
                             participation.getGameResult().toString() : "UNKNOWN"
                ))
                .build();
    }

    private double calculateWinRate(List<GameParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        
        long wins = participations.stream()
                .filter(p -> p.getGameResult() == GameParticipation.GameResult.WIN)
                .count();
        
        long totalCompleted = participations.stream()
                .filter(p -> p.getGameResult() != null && 
                            p.getGameResult() != GameParticipation.GameResult.CANCELLED)
                .count();
        
        return totalCompleted > 0 ? (double) wins / totalCompleted * 100 : 0.0;
    }

    private double calculateAverageRating(List<GameParticipation> participations) {
        return participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);
    }

    private Map<String, SportStatistics> getSportsBreakdown(List<GameParticipation> participations) {
        Map<String, List<GameParticipation>> sportGroups = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(p -> p.getGame().getSport()));

        return sportGroups.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> SportStatistics.fromParticipations(entry.getValue())
                ));
    }

    private List<PerformanceDataPoint> calculatePerformanceTrend(List<GameParticipation> participations) {
        return participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .map(p -> new PerformanceDataPoint(
                    p.getCreatedAt(),
                    p.getPerformanceRating(),
                    p.getGame().getSport()
                ))
                .collect(Collectors.toList());
    }

    private List<SkillLevelChange> getSkillLevelChanges(Long userId, LocalDateTime since) {
        // This would track skill level changes over time
        // For now, return empty list as placeholder
        return List.of();
    }

    private SocialMetrics calculateSocialMetrics(List<GameParticipation> participations) {
        int totalConnections = participations.stream()
                .mapToInt(p -> p.getNewConnectionsMade() != null ? p.getNewConnectionsMade() : 0)
                .sum();

        double avgTeamChemistry = participations.stream()
                .filter(p -> p.getTeamChemistryRating() != null)
                .mapToDouble(GameParticipation::getTeamChemistryRating)
                .average()
                .orElse(0.0);

        return SocialMetrics.builder()
                .newConnectionsMade(totalConnections)
                .averageTeamChemistry(avgTeamChemistry)
                .totalGamesWithFeedback(participations.stream()
                        .mapToInt(p -> p.getFeedbackReceived() != null ? 1 : 0)
                        .sum())
                .build();
    }

    private SkillProgression calculateSkillProgressionForSport(String sport, 
                                                             List<GameParticipation> participations) {
        List<GameParticipation> chronological = participations.stream()
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        double currentRating = chronological.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        // Calculate improvement over time
        List<Double> ratings = chronological.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        double improvement = 0.0;
        if (ratings.size() > 1) {
            improvement = ratings.get(ratings.size() - 1) - ratings.get(0);
        }

        return SkillProgression.builder()
                .sport(sport)
                .currentRating(currentRating)
                .gamesPlayed(participations.size())
                .improvement(improvement)
                .ratingHistory(ratings)
                .build();
    }

    private List<String> getFavoritePlaymates(Long userId, int limit) {
        // This would analyze co-participation patterns
        // For now, return empty list as placeholder
        return List.of();
    }

    private List<Achievement> checkForNewAchievements(Long userId) {
        // Check if user has earned any new achievements
        UserStats stats = userStatsService.getUserStats(userId);
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        
        Set<Long> earnedAchievementIds = userAchievements.stream()
                .filter(UserAchievement::isCompleted)
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        List<Achievement> newAchievements = new ArrayList<>();
        
        for (Achievement achievement : allAchievements) {
            if (!earnedAchievementIds.contains(achievement.getId()) && 
                checkAchievementRequirement(achievement, stats)) {
                
                // Award the achievement
                UserAchievement userAchievement = UserAchievement.builder()
                        .user(userRepository.findById(userId).orElse(null))
                        .achievement(achievement)
                        .progressPercentage(100)
                        .earnedAt(LocalDateTime.now())
                        .pointsEarned(achievement.getBasePoints())
                        .build();
                
                userAchievementRepository.save(userAchievement);
                newAchievements.add(achievement);
            }
        }
        
        return newAchievements;
    }

    private boolean checkAchievementRequirement(Achievement achievement, UserStats stats) {
        String metric = achievement.getRequirementMetric();
        int required = achievement.getRequirementValue();
        
        return switch (metric) {
            case "games_played" -> stats.getTotalGamesPlayed() >= required;
            case "games_won" -> stats.getTotalGamesWon() >= required;
            case "current_streak" -> stats.getCurrentStreak() >= required;
            case "games_created" -> stats.getTotalGamesCreated() >= required;
            case "rating" -> stats.getAverageRating() != null && stats.getAverageRating() >= required;
            case "social_score" -> stats.getSocialScore() >= required;
            default -> false;
        };
    }

    private List<Achievement> findNearCompletionAchievements(Long userId) {
        UserStats stats = userStatsService.getUserStats(userId);
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        
        Set<Long> earnedAchievementIds = userAchievements.stream()
                .filter(UserAchievement::isCompleted)
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        return allAchievements.stream()
                .filter(achievement -> !earnedAchievementIds.contains(achievement.getId()))
                .filter(achievement -> isNearCompletion(achievement, stats))
                .limit(3)
                .collect(Collectors.toList());
    }

    private boolean isNearCompletion(Achievement achievement, UserStats stats) {
        String metric = achievement.getRequirementMetric();
        int required = achievement.getRequirementValue();
        
        double progress = switch (metric) {
            case "games_played" -> (double) stats.getTotalGamesPlayed() / required;
            case "games_won" -> (double) stats.getTotalGamesWon() / required;
            case "current_streak" -> (double) stats.getCurrentStreak() / required;
            case "games_created" -> (double) stats.getTotalGamesCreated() / required;
            case "rating" -> stats.getAverageRating() != null ? stats.getAverageRating() / required : 0.0;
            case "social_score" -> (double) stats.getSocialScore() / required;
            default -> 0.0;
        };
        
        return progress >= 0.8 && progress < 1.0; // 80% or more complete
    }

    private void sendAchievementNotification(String username, Achievement achievement) {
        try {
            NotificationEvent notification = new NotificationEvent(
                username,
                "🏆 Achievement Unlocked!",
                "You've earned: " + achievement.getName(),
                "ACHIEVEMENT_EARNED",
                "/achievements/" + achievement.getId()
            );
            
            realTimeEventService.publishEvent(notification);
            log.debug("Sent achievement notification to user {}: {}", username, achievement.getName());
            
        } catch (Exception e) {
            log.error("Error sending achievement notification: {}", e.getMessage());
        }
    }

    private void sendDashboardUpdateNotification(String username, String updateType) {
        try {
            NotificationEvent notification = new NotificationEvent(
                username,
                "Dashboard Updated",
                "Your stats and progress have been updated",
                "DASHBOARD_UPDATE",
                "/dashboard"
            );
            
            realTimeEventService.publishEvent(notification);
            log.debug("Sent dashboard update notification to user {}", username);
            
        } catch (Exception e) {
            log.error("Error sending dashboard update notification: {}", e.getMessage());
        }
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class DashboardSummary {
        private UserSummary user;
        private PersonalStatistics statistics;
        private List<RecentActivityItem> recentActivity;
        private AchievementProgress achievements;
        private List<SkillProgression> skillProgression;
        private SocialInsights socialInsights;
        private List<Game> upcomingGames;
        private List<DashboardRecommendation> recommendations;
        private LocalDateTime lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private LocalDateTime joinDate;
        private String mostActiveSport;
        private String skillLevel;
        
        public static UserSummary fromUser(User user) {
            return UserSummary.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getUsername() + "@example.com") // Placeholder since User entity doesn't have email
                    .joinDate(user.getCreatedAt().toLocalDateTime())
                    .build();
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class PersonalStatistics {
        private int totalGamesPlayed;
        private int totalGamesWon;
        private double winRate;
        private int currentStreak;
        private int longestStreak;
        private int totalGamesCreated;
        private double averageRating;
        private int socialScore;
        private double totalPlayTimeHours;
        private LocalDateTime lastGameDate;
        private String mostActiveSport;
        private int rank;
        
        public static PersonalStatistics fromUserStats(UserStats stats, Long userId) {
            return PersonalStatistics.builder()
                    .totalGamesPlayed(stats.getTotalGamesPlayed())
                    .totalGamesWon(stats.getTotalGamesWon())
                    .winRate(stats.getTotalGamesPlayed() > 0 ? 
                            (double) stats.getTotalGamesWon() / stats.getTotalGamesPlayed() * 100 : 0.0)
                    .currentStreak(stats.getCurrentStreak())
                    .longestStreak(stats.getLongestStreak())
                    .totalGamesCreated(stats.getTotalGamesCreated())
                    .averageRating(stats.getAverageRating())
                    .socialScore(stats.getSocialScore())
                    .totalPlayTimeHours(stats.getTotalPlayTimeHours())
                    .lastGameDate(stats.getLastGameDate())
                    .mostActiveSport(stats.getMostActiveSport())
                    .build();
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class RecentActivityItem {
        private String activityType;
        private String title;
        private String description;
        private LocalDateTime timestamp;
        private Long relatedEntityId;
        private String relatedEntityType;
        private Map<String, Object> metadata;
    }

    @lombok.Data
    @lombok.Builder
    public static class AchievementProgress {
        private int totalPoints;
        private int completedCount;
        private int inProgressCount;
        private int availableCount;
        private List<AchievementItem> completed;
        private List<AchievementItem> inProgress;
        private List<AchievementItem> available;
    }

    @lombok.Data
    @lombok.Builder
    public static class AchievementItem {
        private Long id;
        private String name;
        private String description;
        private Achievement.AchievementCategory category;
        private String badgeIcon;
        private String badgeColor;
        private int pointsValue;
        private double progress; // 0.0 to 1.0
        private boolean isCompleted;
        private LocalDateTime completedAt;
        
        public static AchievementItem fromAchievement(Achievement achievement, UserAchievement userAchievement) {
            return AchievementItem.builder()
                    .id(achievement.getId())
                    .name(achievement.getName())
                    .description(achievement.getDescription())
                    .category(achievement.getCategory())
                    .badgeIcon(achievement.getBadgeIcon())
                    .badgeColor(achievement.getBadgeColor())
                    .pointsValue(achievement.getBasePoints())
                                    .progress(userAchievement != null ? 
                         userAchievement.getProgressPercentage() / 100.0 : 0.0)
                .isCompleted(userAchievement != null && userAchievement.isCompleted())
                .completedAt(userAchievement != null ? userAchievement.getEarnedAt() : null)
                    .build();
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class SkillProgression {
        private String sport;
        private double currentRating;
        private int gamesPlayed;
        private double improvement;
        private List<Double> ratingHistory;
    }

    @lombok.Data
    @lombok.Builder
    public static class SocialInsights {
        private int totalGamesPlayed;
        private int newConnectionsMade;
        private double averageTeamChemistry;
        private List<String> favoritePlaymates;
        private int socialScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class GameHistoryItem {
        private Long gameId;
        private String sport;
        private String location;
        private LocalDateTime gameDate;
        private GameParticipation.ParticipationType participationType;
        private GameParticipation.GameResult result;
        private Double performanceRating;
        private Double sportsmanshipRating;
        private Integer enjoymentLevel;
        private long durationMinutes;
        private Boolean wasPresent;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceAnalytics {
        private Long userId;
        private String username;
        private int periodDays;
        private int totalGames;
        private double winRate;
        private double averageRating;
        private Map<String, SportStatistics> sportsBreakdown;
        private List<PerformanceDataPoint> performanceTrend;
        private List<SkillLevelChange> skillLevelChanges;
        private SocialMetrics socialMetrics;
    }

    @lombok.Data
    @lombok.Builder
    public static class SportStatistics {
        private int gamesPlayed;
        private double winRate;
        private double averageRating;
        private int currentStreak;
        
        public static SportStatistics fromParticipations(List<GameParticipation> participations) {
            long wins = participations.stream()
                    .filter(p -> p.getGameResult() == GameParticipation.GameResult.WIN)
                    .count();
            
            double winRate = participations.size() > 0 ? (double) wins / participations.size() * 100 : 0.0;
            
            double avgRating = participations.stream()
                    .filter(p -> p.getPerformanceRating() != null)
                    .mapToDouble(GameParticipation::getPerformanceRating)
                    .average()
                    .orElse(0.0);
            
            return SportStatistics.builder()
                    .gamesPlayed(participations.size())
                    .winRate(winRate)
                    .averageRating(avgRating)
                    .currentStreak(0) // Would calculate actual streak
                    .build();
        }
    }

    @lombok.Data
    public static class PerformanceDataPoint {
        private final LocalDateTime timestamp;
        private final double rating;
        private final String sport;
        
        public PerformanceDataPoint(LocalDateTime timestamp, double rating, String sport) {
            this.timestamp = timestamp;
            this.rating = rating;
            this.sport = sport;
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class SkillLevelChange {
        private LocalDateTime timestamp;
        private String sport;
        private String oldLevel;
        private String newLevel;
        private String reason;
    }

    @lombok.Data
    @lombok.Builder
    public static class SocialMetrics {
        private int newConnectionsMade;
        private double averageTeamChemistry;
        private int totalGamesWithFeedback;
    }

    @lombok.Data
    public static class DashboardRecommendation {
        private final String type;
        private final String title;
        private final String description;
        private final String actionUrl;
        private final Priority priority;
        
        public DashboardRecommendation(String type, String title, String description, 
                                     String actionUrl, Priority priority) {
            this.type = type;
            this.title = title;
            this.description = description;
            this.actionUrl = actionUrl;
            this.priority = priority;
        }
        
        public enum Priority {
            LOW, MEDIUM, HIGH, URGENT
        }
    }
}
