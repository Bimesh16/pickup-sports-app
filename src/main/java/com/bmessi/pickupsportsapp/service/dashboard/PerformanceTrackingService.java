package com.bmessi.pickupsportsapp.service.dashboard;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.entity.GameParticipation;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameParticipationRepository;
import com.bmessi.pickupsportsapp.service.UserStatsService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced performance tracking service for user skill development and analytics.
 * 
 * Features:
 * - Multi-sport skill tracking
 * - Performance prediction and goals
 * - Skill development recommendations
 * - Performance milestones and alerts
 * - Comparative analysis with peers
 * - Real-time performance updates
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceTrackingService {

    private final UserRepository userRepository;
    private final GameParticipationRepository participationRepository;
    private final UserStatsService userStatsService;
    private final RealTimeEventService realTimeEventService;

    /**
     * Get comprehensive performance tracking data for a user.
     */
    @Transactional(readOnly = true)
    public PerformanceProfile getPerformanceProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<GameParticipation> allParticipations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        return PerformanceProfile.builder()
                .userId(user.getId())
                .username(username)
                .overallPerformance(calculateOverallPerformance(allParticipations))
                .sportSpecificPerformance(calculateSportSpecificPerformance(allParticipations))
                .skillDevelopmentTrends(calculateSkillTrends(allParticipations))
                .performanceGoals(getPerformanceGoals(user.getId()))
                .milestoneProgress(calculateMilestoneProgress(allParticipations))
                .improvementRecommendations(generateImprovementRecommendations(allParticipations))
                .performancePredictions(generatePerformancePredictions(allParticipations))
                .peerComparison(calculatePeerComparison(user.getId(), allParticipations))
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    /**
     * Track performance after a game and update metrics.
     */
    @Transactional
    public PerformanceUpdate recordGamePerformance(Long userId, Long gameId, 
                                                 PerformanceMetrics metrics) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            // Update or create game participation record
            GameParticipation participation = participationRepository
                    .findByUserIdAndGameId(userId, gameId)
                    .orElse(null);

            if (participation == null) {
                log.warn("No participation record found for user {} and game {}", userId, gameId);
                return PerformanceUpdate.builder()
                        .success(false)
                        .message("Participation record not found")
                        .build();
            }

            // Update performance metrics
            participation.setPerformanceRating(metrics.getPerformanceRating());
            participation.setSportsmanshipRating(metrics.getSportsmanshipRating());
            participation.setGameResult(metrics.getGameResult());
            participation.setEnjoymentLevel(metrics.getEnjoymentLevel());
            participation.setWouldPlayAgain(metrics.getWouldPlayAgain());
            participation.setTeamChemistryRating(metrics.getTeamChemistryRating());
            participation.setNewConnectionsMade(metrics.getNewConnectionsMade());
            participation.setIndividualContribution(metrics.getIndividualContribution());
            
            GameParticipation saved = participationRepository.save(participation);

            // Update user stats
            boolean won = metrics.getGameResult() == GameParticipation.GameResult.WIN;
            userStatsService.updateStatsAfterGame(userId, gameId, won, 2.0);

            if (metrics.getPerformanceRating() != null) {
                userStatsService.updateUserRating(userId, metrics.getPerformanceRating());
            }

            // Check for performance milestones
            List<PerformanceMilestone> newMilestones = checkForPerformanceMilestones(userId, saved);
            
            // Send real-time notifications for milestones
            for (PerformanceMilestone milestone : newMilestones) {
                sendPerformanceMilestoneNotification(user.getUsername(), milestone);
            }

            // Calculate skill level changes
            SkillLevelChange skillChange = checkForSkillLevelChange(userId, saved);
            if (skillChange != null) {
                sendSkillLevelChangeNotification(user.getUsername(), skillChange);
            }

            log.info("Recorded performance for user {} in game {}: rating={}, result={}", 
                    userId, gameId, metrics.getPerformanceRating(), metrics.getGameResult());

            return PerformanceUpdate.builder()
                    .success(true)
                    .message("Performance recorded successfully")
                    .newMilestones(newMilestones)
                    .skillLevelChange(skillChange)
                    .updatedParticipation(saved)
                    .build();

        } catch (Exception e) {
            log.error("Error recording performance for user {} in game {}: {}", 
                     userId, gameId, e.getMessage());
            return PerformanceUpdate.builder()
                    .success(false)
                    .message("Error recording performance: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Set performance goals for a user.
     */
    @Transactional
    public void setPerformanceGoals(Long userId, List<PerformanceGoal> goals) {
        try {
            // In a real implementation, you'd store these in a database table
            // For now, we'll just log them and send a notification
            
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                sendGoalsSetNotification(user.getUsername(), goals.size());
            }
            
            log.info("Set {} performance goals for user {}", goals.size(), userId);
            
        } catch (Exception e) {
            log.error("Error setting performance goals for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Get skill development recommendations for a user.
     */
    @Transactional(readOnly = true)
    public List<SkillRecommendation> getSkillRecommendations(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        return generateImprovementRecommendations(participations);
    }

    // Private helper methods

    private OverallPerformance calculateOverallPerformance(List<GameParticipation> participations) {
        if (participations.isEmpty()) {
            return OverallPerformance.builder()
                    .averageRating(0.0)
                    .totalGames(0)
                    .winRate(0.0)
                    .trend("NO_DATA")
                    .build();
        }

        double avgRating = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        long wins = participations.stream()
                .filter(p -> p.getGameResult() == GameParticipation.GameResult.WIN)
                .count();

        long totalCompleted = participations.stream()
                .filter(p -> p.getGameResult() != null && 
                            p.getGameResult() != GameParticipation.GameResult.CANCELLED)
                .count();

        double winRate = totalCompleted > 0 ? (double) wins / totalCompleted * 100 : 0.0;

        String trend = calculateOverallTrend(participations);

        return OverallPerformance.builder()
                .averageRating(avgRating)
                .totalGames(participations.size())
                .winRate(winRate)
                .trend(trend)
                .gamesWithRating(participations.stream()
                        .mapToInt(p -> p.getPerformanceRating() != null ? 1 : 0)
                        .sum())
                .consistencyScore(calculateConsistencyScore(participations))
                .build();
    }

    private Map<String, SportSpecificPerformance> calculateSportSpecificPerformance(
            List<GameParticipation> participations) {
        
        Map<String, List<GameParticipation>> sportGroups = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(p -> p.getGame().getSport()));

        return sportGroups.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> calculateSportPerformance(entry.getKey(), entry.getValue())
                ));
    }

    private SportSpecificPerformance calculateSportPerformance(String sport, 
                                                             List<GameParticipation> participations) {
        List<GameParticipation> chronological = participations.stream()
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        double currentRating = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        double improvement = calculateSportImprovement(chronological);
        String skillLevel = determineSkillLevel(currentRating);
        int gamesUntilNextLevel = calculateGamesUntilNextLevel(currentRating, improvement);

        return SportSpecificPerformance.builder()
                .sport(sport)
                .currentRating(currentRating)
                .skillLevel(skillLevel)
                .improvement(improvement)
                .gamesPlayed(participations.size())
                .gamesUntilNextLevel(gamesUntilNextLevel)
                .performanceHistory(chronological.stream()
                        .filter(p -> p.getPerformanceRating() != null)
                        .map(p -> PerformanceHistoryPoint.builder()
                                .timestamp(p.getCreatedAt())
                                .rating(p.getPerformanceRating())
                                .gameResult(p.getGameResult())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private List<SkillTrend> calculateSkillTrends(List<GameParticipation> participations) {
        Map<String, List<GameParticipation>> sportGroups = participations.stream()
                .filter(p -> p.getGame().getSport() != null && p.getPerformanceRating() != null)
                .collect(Collectors.groupingBy(p -> p.getGame().getSport()));

        return sportGroups.entrySet().stream()
                .map(entry -> calculateSkillTrendForSport(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private SkillTrend calculateSkillTrendForSport(String sport, List<GameParticipation> participations) {
        List<GameParticipation> chronological = participations.stream()
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        if (chronological.size() < 3) {
            return SkillTrend.builder()
                    .sport(sport)
                    .trend("INSUFFICIENT_DATA")
                    .confidence(0.0)
                    .build();
        }

        // Calculate linear regression for trend
        List<Double> ratings = chronological.stream()
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        double slope = calculateTrendSlope(ratings);
        String trendDirection = slope > 0.05 ? "IMPROVING" : 
                               slope < -0.05 ? "DECLINING" : "STABLE";
        
        double confidence = calculateTrendConfidence(ratings);

        return SkillTrend.builder()
                .sport(sport)
                .trend(trendDirection)
                .slope(slope)
                .confidence(confidence)
                .dataPoints(ratings.size())
                .timeSpan(ChronoUnit.DAYS.between(
                    chronological.get(0).getCreatedAt(),
                    chronological.get(chronological.size() - 1).getCreatedAt()))
                .build();
    }

    private List<PerformanceGoal> getPerformanceGoals(Long userId) {
        // In a real implementation, this would query a performance_goals table
        // For now, return some default goals based on current performance
        
        UserStats stats = userStatsService.getUserStats(userId);
        List<PerformanceGoal> goals = new ArrayList<>();

        if (stats.getAverageRating() != null && stats.getAverageRating() > 0) {
            goals.add(PerformanceGoal.builder()
                    .id(1L)
                    .type("RATING_IMPROVEMENT")
                    .title("Improve Average Rating")
                    .description("Reach an average rating of " + (stats.getAverageRating() + 0.5))
                    .targetValue(stats.getAverageRating() + 0.5)
                    .currentValue(stats.getAverageRating())
                    .targetDate(LocalDateTime.now().plusMonths(3))
                    .isActive(true)
                    .build());
        }

        if (stats.getCurrentStreak() >= 0) {
            goals.add(PerformanceGoal.builder()
                    .id(2L)
                    .type("WIN_STREAK")
                    .title("Extend Win Streak")
                    .description("Achieve a " + (stats.getCurrentStreak() + 5) + " game win streak")
                    .targetValue((double) (stats.getCurrentStreak() + 5))
                    .currentValue((double) stats.getCurrentStreak())
                    .targetDate(LocalDateTime.now().plusMonths(2))
                    .isActive(true)
                    .build());
        }

        return goals;
    }

    private MilestoneProgress calculateMilestoneProgress(List<GameParticipation> participations) {
        List<PerformanceMilestone> milestones = new ArrayList<>();
        
        // Rating milestones
        double currentAvgRating = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        for (double target : Arrays.asList(3.0, 3.5, 4.0, 4.5, 5.0)) {
            milestones.add(PerformanceMilestone.builder()
                    .type("RATING_MILESTONE")
                    .title("Reach " + target + " Average Rating")
                    .targetValue(target)
                    .currentValue(currentAvgRating)
                    .progress(Math.min(100.0, currentAvgRating / target * 100))
                    .isCompleted(currentAvgRating >= target)
                    .category("SKILL")
                    .build());
        }

        // Game count milestones
        int totalGames = participations.size();
        for (int target : Arrays.asList(10, 25, 50, 100, 200, 500)) {
            milestones.add(PerformanceMilestone.builder()
                    .type("GAMES_MILESTONE")
                    .title("Play " + target + " Games")
                    .targetValue((double) target)
                    .currentValue((double) totalGames)
                    .progress(Math.min(100.0, (double) totalGames / target * 100))
                    .isCompleted(totalGames >= target)
                    .category("PARTICIPATION")
                    .build());
        }

        return MilestoneProgress.builder()
                .milestones(milestones)
                .completedCount(milestones.stream()
                        .mapToInt(m -> m.isCompleted() ? 1 : 0)
                        .sum())
                .nextMilestone(milestones.stream()
                        .filter(m -> !m.isCompleted())
                        .min(Comparator.comparing(m -> m.getTargetValue() - m.getCurrentValue()))
                        .orElse(null))
                .build();
    }

    private List<SkillRecommendation> generateImprovementRecommendations(
            List<GameParticipation> participations) {
        
        List<SkillRecommendation> recommendations = new ArrayList<>();

        // Analyze weaknesses and suggest improvements
        Map<String, List<GameParticipation>> sportGroups = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(p -> p.getGame().getSport()));

        for (Map.Entry<String, List<GameParticipation>> entry : sportGroups.entrySet()) {
            String sport = entry.getKey();
            List<GameParticipation> sportParticipations = entry.getValue();
            
            double avgRating = sportParticipations.stream()
                    .filter(p -> p.getPerformanceRating() != null)
                    .mapToDouble(GameParticipation::getPerformanceRating)
                    .average()
                    .orElse(0.0);

            if (avgRating < 3.5 && sportParticipations.size() >= 3) {
                recommendations.add(SkillRecommendation.builder()
                        .type("SKILL_IMPROVEMENT")
                        .sport(sport)
                        .title("Focus on " + sport + " fundamentals")
                        .description("Your " + sport + " performance could improve with more practice")
                        .priority(SkillRecommendation.Priority.HIGH)
                        .actionItems(Arrays.asList(
                            "Practice basic " + sport + " skills",
                            "Watch tutorial videos",
                            "Join beginner-friendly games"
                        ))
                        .build());
            }
        }

        // Sportsmanship recommendations
        double avgSportsmanship = participations.stream()
                .filter(p -> p.getSportsmanshipRating() != null)
                .mapToDouble(GameParticipation::getSportsmanshipRating)
                .average()
                .orElse(0.0);

        if (avgSportsmanship < 4.0 && participations.size() >= 5) {
            recommendations.add(SkillRecommendation.builder()
                    .type("SPORTSMANSHIP")
                    .title("Improve sportsmanship")
                    .description("Focus on positive team interactions and fair play")
                    .priority(SkillRecommendation.Priority.MEDIUM)
                    .actionItems(Arrays.asList(
                        "Encourage teammates",
                        "Respect opponents",
                        "Follow game rules closely"
                    ))
                    .build());
        }

        return recommendations;
    }

    private PerformancePredictions generatePerformancePredictions(List<GameParticipation> participations) {
        if (participations.size() < 5) {
            return PerformancePredictions.builder()
                    .confidence(0.0)
                    .message("Need more game data for predictions")
                    .build();
        }

        List<GameParticipation> recent = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        if (recent.size() < 3) {
            return PerformancePredictions.builder()
                    .confidence(0.0)
                    .message("Need more rated games for predictions")
                    .build();
        }

        // Simple linear trend prediction
        List<Double> ratings = recent.stream()
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        double slope = calculateTrendSlope(ratings);
        double currentRating = ratings.get(ratings.size() - 1);
        
        // Predict rating in 30 days (assuming 2 games per week)
        double predicted30Day = currentRating + (slope * 8); // 8 games in 30 days
        predicted30Day = Math.max(1.0, Math.min(5.0, predicted30Day)); // Clamp to valid range

        return PerformancePredictions.builder()
                .currentRating(currentRating)
                .predicted30DayRating(predicted30Day)
                .predictedImprovement(predicted30Day - currentRating)
                .confidence(calculatePredictionConfidence(ratings))
                .recommendedGamesPerWeek(calculateRecommendedFrequency(slope))
                .build();
    }

    private PeerComparison calculatePeerComparison(Long userId, List<GameParticipation> participations) {
        // This would compare with users of similar experience level
        // For now, return basic comparison data
        
        double userAvgRating = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        return PeerComparison.builder()
                .userRating(userAvgRating)
                .peerAverageRating(3.5) // Placeholder
                .percentileRank(75.0) // Placeholder
                .rankPosition(150) // Placeholder
                .totalPlayers(1000) // Placeholder
                .similarExperiencePlayers(50) // Placeholder
                .build();
    }

    private List<PerformanceMilestone> checkForPerformanceMilestones(Long userId, 
                                                                   GameParticipation participation) {
        List<PerformanceMilestone> newMilestones = new ArrayList<>();
        
        // Check if this game performance hit any milestones
        Double rating = participation.getPerformanceRating();
        if (rating != null) {
            if (rating >= 4.5) {
                newMilestones.add(PerformanceMilestone.builder()
                        .type("EXCELLENCE")
                        .title("Excellent Performance")
                        .description("Achieved a " + rating + " rating!")
                        .category("SKILL")
                        .isCompleted(true)
                        .build());
            }
        }

        return newMilestones;
    }

    private SkillLevelChange checkForSkillLevelChange(Long userId, GameParticipation participation) {
        // Check if user's skill level changed based on recent performance
        // This is a simplified implementation
        
        String sport = participation.getGame().getSport();
        List<GameParticipation> recentSportGames = participationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(p -> sport.equals(p.getGame().getSport()))
                .filter(p -> p.getPerformanceRating() != null)
                .limit(5)
                .collect(Collectors.toList());

        if (recentSportGames.size() < 5) return null;

        double avgRating = recentSportGames.stream()
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        String newLevel = determineSkillLevel(avgRating);
        String oldLevel = "INTERMEDIATE"; // Would get from previous calculation
        
        if (!newLevel.equals(oldLevel)) {
            return SkillLevelChange.builder()
                    .sport(sport)
                    .oldLevel(oldLevel)
                    .newLevel(newLevel)
                    .trigger("PERFORMANCE_AVERAGE")
                    .confidence(0.85)
                    .timestamp(LocalDateTime.now())
                    .build();
        }
        
        return null;
    }

    private void sendPerformanceMilestoneNotification(String username, PerformanceMilestone milestone) {
        try {
            NotificationEvent notification = new NotificationEvent(
                username,
                "🎯 Milestone Achieved!",
                milestone.getTitle() + " - " + milestone.getDescription(),
                "PERFORMANCE_MILESTONE",
                "/dashboard/performance"
            );
            
            realTimeEventService.publishEvent(notification);
            log.debug("Sent milestone notification to {}: {}", username, milestone.getTitle());
            
        } catch (Exception e) {
            log.error("Error sending milestone notification: {}", e.getMessage());
        }
    }

    private void sendSkillLevelChangeNotification(String username, SkillLevelChange change) {
        try {
            String message = String.format("Your %s skill level changed from %s to %s!", 
                    change.getSport(), change.getOldLevel(), change.getNewLevel());
            
            NotificationEvent notification = new NotificationEvent(
                username,
                "📈 Skill Level Update!",
                message,
                "SKILL_LEVEL_CHANGE",
                "/dashboard/skills"
            );
            
            realTimeEventService.publishEvent(notification);
            log.debug("Sent skill level change notification to {}: {}", username, message);
            
        } catch (Exception e) {
            log.error("Error sending skill level change notification: {}", e.getMessage());
        }
    }

    private void sendGoalsSetNotification(String username, int goalCount) {
        try {
            NotificationEvent notification = new NotificationEvent(
                username,
                "🎯 Goals Set!",
                "You've set " + goalCount + " new performance goals. Let's achieve them!",
                "GOALS_SET",
                "/dashboard/goals"
            );
            
            realTimeEventService.publishEvent(notification);
            
        } catch (Exception e) {
            log.error("Error sending goals set notification: {}", e.getMessage());
        }
    }

    // Utility calculation methods

    private String calculateOverallTrend(List<GameParticipation> participations) {
        List<GameParticipation> withRatings = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        if (withRatings.size() < 3) return "INSUFFICIENT_DATA";

        List<Double> ratings = withRatings.stream()
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        double slope = calculateTrendSlope(ratings);
        
        if (slope > 0.1) return "IMPROVING";
        if (slope < -0.1) return "DECLINING";
        return "STABLE";
    }

    private double calculateConsistencyScore(List<GameParticipation> participations) {
        List<Double> ratings = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        if (ratings.size() < 2) return 0.0;

        double mean = ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = ratings.stream()
                .mapToDouble(rating -> Math.pow(rating - mean, 2))
                .average()
                .orElse(0.0);

        double standardDeviation = Math.sqrt(variance);
        
        // Lower standard deviation = higher consistency
        return Math.max(0.0, 100.0 - (standardDeviation * 20));
    }

    private double calculateSportImprovement(List<GameParticipation> chronological) {
        List<Double> ratings = chronological.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        if (ratings.size() < 2) return 0.0;
        
        return ratings.get(ratings.size() - 1) - ratings.get(0);
    }

    private String determineSkillLevel(double rating) {
        if (rating >= 4.5) return "EXPERT";
        if (rating >= 4.0) return "ADVANCED";
        if (rating >= 3.0) return "INTERMEDIATE";
        if (rating >= 2.0) return "BEGINNER";
        return "NOVICE";
    }

    private int calculateGamesUntilNextLevel(double currentRating, double improvement) {
        if (improvement <= 0) return -1; // No improvement trend
        
        double nextLevelThreshold = getNextLevelThreshold(currentRating);
        double ratingNeeded = nextLevelThreshold - currentRating;
        
        return improvement > 0 ? (int) Math.ceil(ratingNeeded / improvement) : -1;
    }

    private double getNextLevelThreshold(double currentRating) {
        if (currentRating < 2.0) return 2.0;
        if (currentRating < 3.0) return 3.0;
        if (currentRating < 4.0) return 4.0;
        if (currentRating < 4.5) return 4.5;
        return 5.0;
    }

    private double calculateTrendSlope(List<Double> values) {
        if (values.size() < 2) return 0.0;
        
        int n = values.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += values.get(i);
            sumXY += i * values.get(i);
            sumXX += i * i;
        }
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    private double calculateTrendConfidence(List<Double> values) {
        // Calculate R-squared for trend confidence
        if (values.size() < 3) return 0.0;
        
        double slope = calculateTrendSlope(values);
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        
        double ssTotal = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .sum();
        
        double ssRes = 0.0;
        for (int i = 0; i < values.size(); i++) {
            double predicted = mean + slope * (i - values.size() / 2.0);
            ssRes += Math.pow(values.get(i) - predicted, 2);
        }
        
        return ssTotal > 0 ? 1.0 - (ssRes / ssTotal) : 0.0;
    }

    private double calculatePredictionConfidence(List<Double> ratings) {
        return Math.min(1.0, ratings.size() / 10.0); // More data = higher confidence
    }

    private int calculateRecommendedFrequency(double slope) {
        // Recommend frequency based on improvement rate
        if (slope > 0.2) return 3; // 3 games per week if improving fast
        if (slope > 0.1) return 2; // 2 games per week if improving
        return 1; // 1 game per week if stable/declining
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class PerformanceProfile {
        private Long userId;
        private String username;
        private OverallPerformance overallPerformance;
        private Map<String, SportSpecificPerformance> sportSpecificPerformance;
        private List<SkillTrend> skillDevelopmentTrends;
        private List<PerformanceGoal> performanceGoals;
        private MilestoneProgress milestoneProgress;
        private List<SkillRecommendation> improvementRecommendations;
        private PerformancePredictions performancePredictions;
        private PeerComparison peerComparison;
        private LocalDateTime lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    public static class OverallPerformance {
        private double averageRating;
        private int totalGames;
        private double winRate;
        private String trend;
        private int gamesWithRating;
        private double consistencyScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class SportSpecificPerformance {
        private String sport;
        private double currentRating;
        private String skillLevel;
        private double improvement;
        private int gamesPlayed;
        private int gamesUntilNextLevel;
        private List<PerformanceHistoryPoint> performanceHistory;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceHistoryPoint {
        private LocalDateTime timestamp;
        private double rating;
        private GameParticipation.GameResult gameResult;
    }

    @lombok.Data
    @lombok.Builder
    public static class SkillTrend {
        private String sport;
        private String trend;
        private double slope;
        private double confidence;
        private int dataPoints;
        private long timeSpan;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceGoal {
        private Long id;
        private String type;
        private String title;
        private String description;
        private double targetValue;
        private double currentValue;
        private LocalDateTime targetDate;
        private boolean isActive;
        private String sport;
    }

    @lombok.Data
    @lombok.Builder
    public static class MilestoneProgress {
        private List<PerformanceMilestone> milestones;
        private int completedCount;
        private PerformanceMilestone nextMilestone;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceMilestone {
        private String type;
        private String title;
        private String description;
        private double targetValue;
        private double currentValue;
        private double progress;
        private boolean isCompleted;
        private String category;
    }

    @lombok.Data
    @lombok.Builder
    public static class SkillRecommendation {
        private String type;
        private String sport;
        private String title;
        private String description;
        private Priority priority;
        private List<String> actionItems;
        
        public enum Priority {
            LOW, MEDIUM, HIGH, URGENT
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformancePredictions {
        private double currentRating;
        private double predicted30DayRating;
        private double predictedImprovement;
        private double confidence;
        private int recommendedGamesPerWeek;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class PeerComparison {
        private double userRating;
        private double peerAverageRating;
        private double percentileRank;
        private int rankPosition;
        private int totalPlayers;
        private int similarExperiencePlayers;
    }

    @lombok.Data
    @lombok.Builder
    public static class SkillLevelChange {
        private String sport;
        private String oldLevel;
        private String newLevel;
        private String trigger;
        private double confidence;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceUpdate {
        private boolean success;
        private String message;
        private List<PerformanceMilestone> newMilestones;
        private SkillLevelChange skillLevelChange;
        private GameParticipation updatedParticipation;
    }

    @lombok.Data
    public static class PerformanceMetrics {
        private Double performanceRating;
        private Double sportsmanshipRating;
        private GameParticipation.GameResult gameResult;
        private Integer enjoymentLevel;
        private Boolean wouldPlayAgain;
        private Double teamChemistryRating;
        private Integer newConnectionsMade;
        private String individualContribution;
        
        // Getters and setters
        public Double getPerformanceRating() { return performanceRating; }
        public void setPerformanceRating(Double performanceRating) { this.performanceRating = performanceRating; }
        
        public Double getSportsmanshipRating() { return sportsmanshipRating; }
        public void setSportsmanshipRating(Double sportsmanshipRating) { this.sportsmanshipRating = sportsmanshipRating; }
        
        public GameParticipation.GameResult getGameResult() { return gameResult; }
        public void setGameResult(GameParticipation.GameResult gameResult) { this.gameResult = gameResult; }
        
        public Integer getEnjoymentLevel() { return enjoymentLevel; }
        public void setEnjoymentLevel(Integer enjoymentLevel) { this.enjoymentLevel = enjoymentLevel; }
        
        public Boolean getWouldPlayAgain() { return wouldPlayAgain; }
        public void setWouldPlayAgain(Boolean wouldPlayAgain) { this.wouldPlayAgain = wouldPlayAgain; }
        
        public Double getTeamChemistryRating() { return teamChemistryRating; }
        public void setTeamChemistryRating(Double teamChemistryRating) { this.teamChemistryRating = teamChemistryRating; }
        
        public Integer getNewConnectionsMade() { return newConnectionsMade; }
        public void setNewConnectionsMade(Integer newConnectionsMade) { this.newConnectionsMade = newConnectionsMade; }
        
        public String getIndividualContribution() { return individualContribution; }
        public void setIndividualContribution(String individualContribution) { this.individualContribution = individualContribution; }
    }
}
