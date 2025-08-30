package com.bmessi.pickupsportsapp.service.dashboard;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.entity.GameParticipation;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameParticipationRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.service.UserStatsService;
import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced user insights and recommendation engine.
 * 
 * Provides intelligent analysis and personalized recommendations based on:
 * - User behavior patterns
 * - Performance trends
 * - Social interactions
 * - Game preferences
 * - Machine learning insights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserInsightsService {

    private final UserRepository userRepository;
    private final GameParticipationRepository participationRepository;
    private final GameRepository gameRepository;
    private final UserStatsService userStatsService;
    private final AiRecommendationResilientService aiRecommendationService;

    /**
     * Get comprehensive user insights and recommendations.
     */
    @Transactional(readOnly = true)
    public UserInsights getUserInsights(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        UserStats stats = userStatsService.getUserStats(user.getId());
        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        return UserInsights.builder()
                .userId(user.getId())
                .username(username)
                .behaviorAnalysis(analyzeBehaviorPatterns(participations))
                .personalizedRecommendations(generatePersonalizedRecommendations(user.getId(), participations))
                .gamePreferences(analyzeGamePreferences(participations))
                .socialInsights(analyzeSocialBehavior(participations))
                .performanceInsights(analyzePerformancePatterns(participations))
                .engagementMetrics(calculateEngagementMetrics(participations, stats))
                .predictiveInsights(generatePredictiveInsights(participations))
                .improvementOpportunities(identifyImprovementOpportunities(participations))
                .lastAnalyzed(LocalDateTime.now())
                .build();
    }

    /**
     * Get game recommendations based on user insights.
     */
    @Transactional(readOnly = true)
    public GameRecommendations getGameRecommendations(String username, int limit) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        // Analyze user preferences
        GamePreferences preferences = analyzeGamePreferences(participations);
        
        // Get AI-powered recommendations if available
        List<Game> aiRecommendations = getAiRecommendations(user.getId(), preferences);
        
        // Generate rule-based recommendations
        List<Game> ruleBasedRecommendations = generateRuleBasedRecommendations(preferences, limit);
        
        // Combine and rank recommendations
        List<RecommendedGame> finalRecommendations = combineAndRankRecommendations(
                aiRecommendations, ruleBasedRecommendations, preferences, limit);

        return GameRecommendations.builder()
                .userId(user.getId())
                .username(username)
                .recommendations(finalRecommendations)
                .basedOnPreferences(preferences)
                .recommendationReason("Based on your activity patterns and preferences")
                .confidence(calculateRecommendationConfidence(participations))
                .build();
    }

    /**
     * Get personalized training and improvement plan.
     */
    @Transactional(readOnly = true)
    public PersonalizedTrainingPlan getTrainingPlan(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        // Analyze weaknesses and strengths
        SkillAnalysis skillAnalysis = analyzeSkills(participations);
        
        // Generate training recommendations
        List<TrainingRecommendation> recommendations = generateTrainingRecommendations(skillAnalysis);
        
        // Create practice schedule
        PracticeSchedule schedule = generatePracticeSchedule(skillAnalysis, recommendations);

        return PersonalizedTrainingPlan.builder()
                .userId(user.getId())
                .username(username)
                .skillAnalysis(skillAnalysis)
                .trainingRecommendations(recommendations)
                .practiceSchedule(schedule)
                .estimatedTimeToImprove(calculateImprovementTimeframe(skillAnalysis))
                .focusAreas(identifyFocusAreas(skillAnalysis))
                .build();
    }

    /**
     * Get user engagement and retention insights.
     */
    @Transactional(readOnly = true)
    public EngagementInsights getEngagementInsights(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<GameParticipation> participations = participationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        return EngagementInsights.builder()
                .userId(user.getId())
                .username(username)
                .engagementScore(calculateEngagementScore(participations))
                .activityLevel(determineActivityLevel(participations))
                .retentionRisk(assessRetentionRisk(participations))
                .motivationalFactors(identifyMotivationalFactors(participations))
                .engagementTrends(analyzeEngagementTrends(participations))
                .recommendedActions(generateEngagementRecommendations(participations))
                .build();
    }

    // Private helper methods

    private BehaviorAnalysis analyzeBehaviorPatterns(List<GameParticipation> participations) {
        if (participations.isEmpty()) {
            return BehaviorAnalysis.builder()
                    .playingStyle("UNKNOWN")
                    .commitmentLevel("UNKNOWN")
                    .socialLevel("UNKNOWN")
                    .build();
        }

        // Analyze playing patterns
        Map<String, Long> dayPattern = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getTime().getDayOfWeek().toString(),
                    Collectors.counting()
                ));

        boolean weekendPlayer = dayPattern.getOrDefault("SATURDAY", 0L) + 
                               dayPattern.getOrDefault("SUNDAY", 0L) > 
                               participations.size() * 0.6;

        // Analyze commitment level
        long attended = participations.stream()
                .filter(p -> p.getWasPresent())
                .count();
        
        double attendanceRate = participations.size() > 0 ? 
                               (double) attended / participations.size() : 0.0;

        String commitmentLevel = attendanceRate > 0.9 ? "HIGH" :
                                attendanceRate > 0.7 ? "MEDIUM" : "LOW";

        // Analyze social behavior
        double avgTeamChemistry = participations.stream()
                .filter(p -> p.getTeamChemistryRating() != null)
                .mapToDouble(GameParticipation::getTeamChemistryRating)
                .average()
                .orElse(0.0);

        String socialLevel = avgTeamChemistry > 4.0 ? "HIGH" :
                            avgTeamChemistry > 3.0 ? "MEDIUM" : "LOW";

        return BehaviorAnalysis.builder()
                .playingStyle(weekendPlayer ? "WEEKEND_WARRIOR" : "REGULAR_PLAYER")
                .commitmentLevel(commitmentLevel)
                .socialLevel(socialLevel)
                .attendanceRate(attendanceRate)
                .averageTeamChemistry(avgTeamChemistry)
                .preferredDays(dayPattern.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .map(Map.Entry::getKey)
                        .limit(3)
                        .collect(Collectors.toList()))
                .build();
    }

    private List<PersonalizedRecommendation> generatePersonalizedRecommendations(
            Long userId, List<GameParticipation> participations) {
        
        List<PersonalizedRecommendation> recommendations = new ArrayList<>();
        
        // Analyze user patterns and generate recommendations
        Map<String, Long> sportFrequency = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getSport(),
                    Collectors.counting()
                ));

        // Recommend trying new sports
        if (sportFrequency.size() < 3) {
            recommendations.add(PersonalizedRecommendation.builder()
                    .type("SPORT_EXPLORATION")
                    .title("Try a new sport")
                    .description("Expand your horizons by trying different sports")
                    .confidence(0.8)
                    .priority(PersonalizedRecommendation.Priority.MEDIUM)
                    .actionUrl("/games/search?new_sports=true")
                    .reasoning("You've primarily played " + sportFrequency.keySet() + 
                              ". Trying new sports can improve overall fitness and skills.")
                    .build());
        }

        // Recommend social connections
        int totalConnections = participations.stream()
                .mapToInt(p -> p.getNewConnectionsMade() != null ? p.getNewConnectionsMade() : 0)
                .sum();

        if (totalConnections < participations.size() * 0.3) {
            recommendations.add(PersonalizedRecommendation.builder()
                    .type("SOCIAL_ENGAGEMENT")
                    .title("Connect with more players")
                    .description("Engage more with fellow players to build your network")
                    .confidence(0.7)
                    .priority(PersonalizedRecommendation.Priority.LOW)
                    .actionUrl("/dashboard/social")
                    .reasoning("Building connections enhances the social aspect of sports and " +
                              "can lead to more game opportunities.")
                    .build());
        }

        return recommendations;
    }

    private GamePreferences analyzeGamePreferences(List<GameParticipation> participations) {
        if (participations.isEmpty()) {
            return GamePreferences.builder().build();
        }

        Map<String, Long> sportPreferences = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getSport(),
                    Collectors.counting()
                ));

        Map<String, Long> locationPreferences = participations.stream()
                .filter(p -> p.getGame().getLocation() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getLocation(),
                    Collectors.counting()
                ));

        Map<String, Long> timePreferences = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> getTimeSlot(p.getGame().getTime().getHour()),
                    Collectors.counting()
                ));

        String favoriteSport = sportPreferences.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");

        return GamePreferences.builder()
                .favoriteSports(sportPreferences.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .map(Map.Entry::getKey)
                        .limit(3)
                        .collect(Collectors.toList()))
                .preferredLocations(locationPreferences.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .map(Map.Entry::getKey)
                        .limit(3)
                        .collect(Collectors.toList()))
                .preferredTimeSlots(timePreferences.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .map(Map.Entry::getKey)
                        .limit(2)
                        .collect(Collectors.toList()))
                .averageGameFrequency(calculateAverageFrequency(participations))
                .preferredGameSize(calculatePreferredGameSize(participations))
                .competitivenessLevel(calculateCompetitivenessLevel(participations))
                .build();
    }

    private SocialBehavior analyzeSocialBehavior(List<GameParticipation> participations) {
        double avgTeamChemistry = participations.stream()
                .filter(p -> p.getTeamChemistryRating() != null)
                .mapToDouble(GameParticipation::getTeamChemistryRating)
                .average()
                .orElse(0.0);

        int totalConnections = participations.stream()
                .mapToInt(p -> p.getNewConnectionsMade() != null ? p.getNewConnectionsMade() : 0)
                .sum();

        double networkingScore = calculateNetworkingScore(participations);
        String socialPersonality = determineSocialPersonality(avgTeamChemistry, totalConnections, participations.size());

        return SocialBehavior.builder()
                .averageTeamChemistry(avgTeamChemistry)
                .totalNewConnections(totalConnections)
                .networkingScore(networkingScore)
                .socialPersonality(socialPersonality)
                .collaborationStyle(determineCollaborationStyle(participations))
                .leadershipTendency(calculateLeadershipTendency(participations))
                .build();
    }

    private PerformancePatterns analyzePerformancePatterns(List<GameParticipation> participations) {
        List<GameParticipation> withRatings = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        if (withRatings.isEmpty()) {
            return PerformancePatterns.builder()
                    .pattern("INSUFFICIENT_DATA")
                    .build();
        }

        String pattern = identifyPerformancePattern(withRatings);
        double volatility = calculatePerformanceVolatility(withRatings);
        List<String> strengthSports = identifyStrengthSports(participations);
        List<String> improvementSports = identifyImprovementSports(participations);

        return PerformancePatterns.builder()
                .pattern(pattern)
                .volatility(volatility)
                .strengthSports(strengthSports)
                .improvementSports(improvementSports)
                .peakPerformanceFactors(identifyPeakPerformanceFactors(withRatings))
                .consistencyScore(calculatePerformanceConsistency(withRatings))
                .build();
    }

    private EngagementMetrics calculateEngagementMetrics(List<GameParticipation> participations, 
                                                       UserStats stats) {
        if (participations.isEmpty()) {
            return EngagementMetrics.builder()
                    .engagementScore(0.0)
                    .activityLevel("INACTIVE")
                    .build();
        }

        // Calculate various engagement factors
        double attendanceRate = participations.stream()
                .filter(p -> p.getWasPresent())
                .count() / (double) participations.size();

        double feedbackParticipation = participations.stream()
                .filter(p -> p.getFeedbackGiven() != null || p.getFeedbackReceived() != null)
                .count() / (double) participations.size();

        LocalDateTime lastActivity = participations.get(0).getCreatedAt();
        long daysSinceLastActivity = ChronoUnit.DAYS.between(lastActivity, LocalDateTime.now());

        double recencyScore = Math.max(0, 1.0 - (daysSinceLastActivity / 30.0)); // Decay over 30 days

        // Calculate overall engagement score
        double engagementScore = (attendanceRate * 0.4 + 
                                 feedbackParticipation * 0.2 + 
                                 recencyScore * 0.4) * 100;

        String activityLevel = engagementScore > 80 ? "HIGHLY_ACTIVE" :
                              engagementScore > 60 ? "ACTIVE" :
                              engagementScore > 30 ? "MODERATE" : "LOW";

        return EngagementMetrics.builder()
                .engagementScore(engagementScore)
                .activityLevel(activityLevel)
                .attendanceRate(attendanceRate * 100)
                .feedbackParticipationRate(feedbackParticipation * 100)
                .daysSinceLastActivity((int) daysSinceLastActivity)
                .recencyScore(recencyScore * 100)
                .trendDirection(calculateEngagementTrend(participations))
                .build();
    }

    private PredictiveInsights generatePredictiveInsights(List<GameParticipation> participations) {
        if (participations.size() < 5) {
            return PredictiveInsights.builder()
                    .confidence(0.0)
                    .message("Need more data for predictions")
                    .build();
        }

        // Predict future activity level
        String activityTrend = calculateActivityTrend(participations);
        double churnRisk = calculateChurnRisk(participations);
        int predictedGamesNextMonth = predictNextMonthActivity(participations);

        List<String> riskFactors = identifyRiskFactors(participations);
        List<String> growthOpportunities = identifyGrowthOpportunities(participations);

        return PredictiveInsights.builder()
                .activityTrend(activityTrend)
                .churnRisk(churnRisk)
                .predictedGamesNextMonth(predictedGamesNextMonth)
                .riskFactors(riskFactors)
                .growthOpportunities(growthOpportunities)
                .confidence(Math.min(1.0, participations.size() / 20.0))
                .build();
    }

    private List<ImprovementOpportunity> identifyImprovementOpportunities(
            List<GameParticipation> participations) {
        
        List<ImprovementOpportunity> opportunities = new ArrayList<>();

        // Analyze performance gaps
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
                opportunities.add(ImprovementOpportunity.builder()
                        .area(sport + " Performance")
                        .currentLevel(avgRating)
                        .targetLevel(4.0)
                        .priority(ImprovementOpportunity.Priority.HIGH)
                        .estimatedTimeToImprove("2-3 months")
                        .actionItems(Arrays.asList(
                            "Focus on fundamental skills",
                            "Practice regularly",
                            "Seek feedback from experienced players"
                        ))
                        .build());
            }
        }

        // Check attendance opportunities
        long attended = participations.stream()
                .filter(p -> p.getWasPresent())
                .count();
        
        if (participations.size() > 0 && attended / (double) participations.size() < 0.8) {
            opportunities.add(ImprovementOpportunity.builder()
                    .area("Game Attendance")
                    .currentLevel(attended / (double) participations.size() * 100)
                    .targetLevel(90.0)
                    .priority(ImprovementOpportunity.Priority.MEDIUM)
                    .estimatedTimeToImprove("1-2 months")
                    .actionItems(Arrays.asList(
                        "Better schedule management",
                        "Only commit to games you can attend",
                        "Set calendar reminders"
                    ))
                    .build());
        }

        return opportunities;
    }

    private List<Game> getAiRecommendations(Long userId, GamePreferences preferences) {
        try {
            // Use existing AI recommendation service if available
            return List.of(); // Placeholder - would integrate with AI service
        } catch (Exception e) {
            log.warn("AI recommendations not available, falling back to rule-based: {}", e.getMessage());
            return List.of();
        }
    }

    private List<Game> generateRuleBasedRecommendations(GamePreferences preferences, int limit) {
        // Generate recommendations based on preferences
        List<Game> availableGames = gameRepository.findAll(); // Placeholder - would implement findUpcomingGames()
        
        return availableGames.stream()
                .filter(game -> preferences.getFavoriteSports().contains(game.getSport()) ||
                               preferences.getPreferredLocations().contains(game.getLocation()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<RecommendedGame> combineAndRankRecommendations(List<Game> aiRecs, 
                                                              List<Game> ruleRecs,
                                                              GamePreferences preferences, 
                                                              int limit) {
        // Combine and rank all recommendations
        Set<Long> seen = new HashSet<>();
        List<RecommendedGame> combined = new ArrayList<>();
        
        // Add AI recommendations first (higher priority)
        for (Game game : aiRecs) {
            if (!seen.contains(game.getId()) && combined.size() < limit) {
                combined.add(RecommendedGame.builder()
                        .game(game)
                        .recommendationScore(0.9)
                        .reason("AI-powered recommendation based on your preferences")
                        .source("AI")
                        .build());
                seen.add(game.getId());
            }
        }
        
        // Add rule-based recommendations
        for (Game game : ruleRecs) {
            if (!seen.contains(game.getId()) && combined.size() < limit) {
                double score = calculateRecommendationScore(game, preferences);
                combined.add(RecommendedGame.builder()
                        .game(game)
                        .recommendationScore(score)
                        .reason(generateRecommendationReason(game, preferences))
                        .source("RULE_BASED")
                        .build());
                seen.add(game.getId());
            }
        }
        
        return combined.stream()
                .sorted((a, b) -> Double.compare(b.getRecommendationScore(), a.getRecommendationScore()))
                .collect(Collectors.toList());
    }

    // Utility methods for calculations

    private String getTimeSlot(int hour) {
        if (hour >= 6 && hour < 12) return "MORNING";
        if (hour >= 12 && hour < 17) return "AFTERNOON";
        if (hour >= 17 && hour < 21) return "EVENING";
        return "NIGHT";
    }

    private double calculateAverageFrequency(List<GameParticipation> participations) {
        if (participations.size() < 2) return 0.0;
        
        LocalDateTime earliest = participations.stream()
                .map(GameParticipation::getCreatedAt)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
        
        long weeks = ChronoUnit.WEEKS.between(earliest, LocalDateTime.now());
        return weeks > 0 ? (double) participations.size() / weeks : participations.size();
    }

    private String calculatePreferredGameSize(List<GameParticipation> participations) {
        // This would analyze the capacity of games user prefers
        return "MEDIUM"; // Placeholder
    }

    private String calculateCompetitivenessLevel(List<GameParticipation> participations) {
        // Analyze based on game types, performance focus, etc.
        return "MODERATE"; // Placeholder
    }

    private double calculateNetworkingScore(List<GameParticipation> participations) {
        return participations.stream()
                .mapToInt(p -> p.getNewConnectionsMade() != null ? p.getNewConnectionsMade() : 0)
                .average()
                .orElse(0.0) * 20; // Scale to 0-100
    }

    private String determineSocialPersonality(double teamChemistry, int connections, int totalGames) {
        if (teamChemistry > 4.0 && connections > totalGames * 0.3) return "SOCIAL_CONNECTOR";
        if (teamChemistry > 3.5) return "TEAM_PLAYER";
        if (connections > totalGames * 0.2) return "NETWORKER";
        return "FOCUSED_PLAYER";
    }

    private String determineCollaborationStyle(List<GameParticipation> participations) {
        // Analyze feedback patterns, team chemistry, etc.
        return "COLLABORATIVE"; // Placeholder
    }

    private double calculateLeadershipTendency(List<GameParticipation> participations) {
        long creatorRoles = participations.stream()
                .filter(p -> p.getParticipationType() == GameParticipation.ParticipationType.CREATOR)
                .count();
        
        return participations.size() > 0 ? (double) creatorRoles / participations.size() * 100 : 0.0;
    }

    private String identifyPerformancePattern(List<GameParticipation> participations) {
        List<Double> ratings = participations.stream()
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        if (ratings.size() < 3) return "INSUFFICIENT_DATA";

        // Simple pattern recognition
        boolean improving = ratings.get(ratings.size() - 1) > ratings.get(0);
        double volatility = calculatePerformanceVolatility(participations);

        if (improving && volatility < 0.5) return "STEADY_IMPROVEMENT";
        if (improving && volatility >= 0.5) return "INCONSISTENT_IMPROVEMENT";
        if (!improving && volatility < 0.5) return "STABLE";
        return "VOLATILE";
    }

    private double calculatePerformanceVolatility(List<GameParticipation> participations) {
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

        return Math.sqrt(variance);
    }

    private List<String> identifyStrengthSports(List<GameParticipation> participations) {
        Map<String, Double> sportRatings = participations.stream()
                .filter(p -> p.getGame().getSport() != null && p.getPerformanceRating() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getSport(),
                    Collectors.averagingDouble(GameParticipation::getPerformanceRating)
                ));

        return sportRatings.entrySet().stream()
                .filter(entry -> entry.getValue() >= 4.0)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private List<String> identifyImprovementSports(List<GameParticipation> participations) {
        Map<String, Double> sportRatings = participations.stream()
                .filter(p -> p.getGame().getSport() != null && p.getPerformanceRating() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getSport(),
                    Collectors.averagingDouble(GameParticipation::getPerformanceRating)
                ));

        return sportRatings.entrySet().stream()
                .filter(entry -> entry.getValue() < 3.5)
                .sorted(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private List<String> identifyPeakPerformanceFactors(List<GameParticipation> participations) {
        // Analyze when user performs best
        List<String> factors = new ArrayList<>();
        
        // Analyze by day of week
        Map<String, Double> dayPerformance = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getTime().getDayOfWeek().toString(),
                    Collectors.averagingDouble(GameParticipation::getPerformanceRating)
                ));

        String bestDay = dayPerformance.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (bestDay != null) {
            factors.add("Performs best on " + bestDay);
        }

        return factors;
    }

    private double calculatePerformanceConsistency(List<GameParticipation> participations) {
        List<Double> ratings = participations.stream()
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());

        if (ratings.size() < 2) return 0.0;

        double volatility = calculatePerformanceVolatility(participations);
        return Math.max(0.0, 100.0 - (volatility * 20)); // Convert volatility to consistency score
    }

    // Additional utility methods (placeholders for complex calculations)

    private SkillAnalysis analyzeSkills(List<GameParticipation> participations) {
        return SkillAnalysis.builder().build(); // Placeholder
    }

    private List<TrainingRecommendation> generateTrainingRecommendations(SkillAnalysis analysis) {
        return List.of(); // Placeholder
    }

    private PracticeSchedule generatePracticeSchedule(SkillAnalysis analysis, 
                                                    List<TrainingRecommendation> recommendations) {
        return PracticeSchedule.builder().build(); // Placeholder
    }

    private String calculateImprovementTimeframe(SkillAnalysis analysis) {
        return "2-3 months"; // Placeholder
    }

    private List<String> identifyFocusAreas(SkillAnalysis analysis) {
        return List.of("Consistency", "Team Chemistry"); // Placeholder
    }

    private double calculateEngagementScore(List<GameParticipation> participations) {
        return 75.0; // Placeholder
    }

    private String determineActivityLevel(List<GameParticipation> participations) {
        return "ACTIVE"; // Placeholder
    }

    private double assessRetentionRisk(List<GameParticipation> participations) {
        return 0.2; // Placeholder - 20% risk
    }

    private List<String> identifyMotivationalFactors(List<GameParticipation> participations) {
        return List.of("Social connections", "Skill improvement"); // Placeholder
    }

    private String analyzeEngagementTrends(List<GameParticipation> participations) {
        return "STABLE"; // Placeholder
    }

    private List<String> generateEngagementRecommendations(List<GameParticipation> participations) {
        return List.of("Try new sports", "Connect with more players"); // Placeholder
    }

    private String calculateEngagementTrend(List<GameParticipation> participations) {
        return "STABLE"; // Placeholder
    }

    private String calculateActivityTrend(List<GameParticipation> participations) {
        return "STABLE"; // Placeholder
    }

    private double calculateChurnRisk(List<GameParticipation> participations) {
        return 0.15; // Placeholder
    }

    private int predictNextMonthActivity(List<GameParticipation> participations) {
        return 4; // Placeholder
    }

    private List<String> identifyRiskFactors(List<GameParticipation> participations) {
        return List.of(); // Placeholder
    }

    private List<String> identifyGrowthOpportunities(List<GameParticipation> participations) {
        return List.of("Leadership opportunities", "New sport exploration"); // Placeholder
    }

    private double calculateRecommendationScore(Game game, GamePreferences preferences) {
        double score = 0.0;
        
        if (preferences.getFavoriteSports().contains(game.getSport())) {
            score += 0.5;
        }
        
        if (preferences.getPreferredLocations().contains(game.getLocation())) {
            score += 0.3;
        }
        
        return Math.min(1.0, score);
    }

    private String generateRecommendationReason(Game game, GamePreferences preferences) {
        List<String> reasons = new ArrayList<>();
        
        if (preferences.getFavoriteSports().contains(game.getSport())) {
            reasons.add("matches your favorite sport");
        }
        
        if (preferences.getPreferredLocations().contains(game.getLocation())) {
            reasons.add("at your preferred location");
        }
        
        return reasons.isEmpty() ? "recommended based on your activity" : 
               "Recommended because it " + String.join(" and ", reasons);
    }

    private double calculateRecommendationConfidence(List<GameParticipation> participations) {
        return Math.min(1.0, participations.size() / 10.0);
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class UserInsights {
        private Long userId;
        private String username;
        private BehaviorAnalysis behaviorAnalysis;
        private List<PersonalizedRecommendation> personalizedRecommendations;
        private GamePreferences gamePreferences;
        private SocialBehavior socialInsights;
        private PerformancePatterns performanceInsights;
        private EngagementMetrics engagementMetrics;
        private PredictiveInsights predictiveInsights;
        private List<ImprovementOpportunity> improvementOpportunities;
        private LocalDateTime lastAnalyzed;
    }

    @lombok.Data
    @lombok.Builder
    public static class BehaviorAnalysis {
        private String playingStyle;
        private String commitmentLevel;
        private String socialLevel;
        private double attendanceRate;
        private double averageTeamChemistry;
        private List<String> preferredDays;
    }

    @lombok.Data
    @lombok.Builder
    public static class PersonalizedRecommendation {
        private String type;
        private String title;
        private String description;
        private double confidence;
        private Priority priority;
        private String actionUrl;
        private String reasoning;
        
        public enum Priority {
            LOW, MEDIUM, HIGH, URGENT
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class GamePreferences {
        private List<String> favoriteSports;
        private List<String> preferredLocations;
        private List<String> preferredTimeSlots;
        private double averageGameFrequency;
        private String preferredGameSize;
        private String competitivenessLevel;
    }

    @lombok.Data
    @lombok.Builder
    public static class SocialBehavior {
        private double averageTeamChemistry;
        private int totalNewConnections;
        private double networkingScore;
        private String socialPersonality;
        private String collaborationStyle;
        private double leadershipTendency;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformancePatterns {
        private String pattern;
        private double volatility;
        private List<String> strengthSports;
        private List<String> improvementSports;
        private List<String> peakPerformanceFactors;
        private double consistencyScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class EngagementMetrics {
        private double engagementScore;
        private String activityLevel;
        private double attendanceRate;
        private double feedbackParticipationRate;
        private int daysSinceLastActivity;
        private double recencyScore;
        private String trendDirection;
    }

    @lombok.Data
    @lombok.Builder
    public static class PredictiveInsights {
        private String activityTrend;
        private double churnRisk;
        private int predictedGamesNextMonth;
        private List<String> riskFactors;
        private List<String> growthOpportunities;
        private double confidence;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class ImprovementOpportunity {
        private String area;
        private double currentLevel;
        private double targetLevel;
        private Priority priority;
        private String estimatedTimeToImprove;
        private List<String> actionItems;
        
        public enum Priority {
            LOW, MEDIUM, HIGH, CRITICAL
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class GameRecommendations {
        private Long userId;
        private String username;
        private List<RecommendedGame> recommendations;
        private GamePreferences basedOnPreferences;
        private String recommendationReason;
        private double confidence;
    }

    @lombok.Data
    @lombok.Builder
    public static class RecommendedGame {
        private Game game;
        private double recommendationScore;
        private String reason;
        private String source;
    }

    @lombok.Data
    @lombok.Builder
    public static class PersonalizedTrainingPlan {
        private Long userId;
        private String username;
        private SkillAnalysis skillAnalysis;
        private List<TrainingRecommendation> trainingRecommendations;
        private PracticeSchedule practiceSchedule;
        private String estimatedTimeToImprove;
        private List<String> focusAreas;
    }

    @lombok.Data
    @lombok.Builder
    public static class EngagementInsights {
        private Long userId;
        private String username;
        private double engagementScore;
        private String activityLevel;
        private double retentionRisk;
        private List<String> motivationalFactors;
        private String engagementTrends;
        private List<String> recommendedActions;
    }

    // Placeholder classes for complex data structures
    @lombok.Data
    @lombok.Builder
    public static class SkillAnalysis {
        // Placeholder for skill analysis data
    }

    @lombok.Data
    @lombok.Builder
    public static class TrainingRecommendation {
        // Placeholder for training recommendation data
    }

    @lombok.Data
    @lombok.Builder
    public static class PracticeSchedule {
        // Placeholder for practice schedule data
    }
}
