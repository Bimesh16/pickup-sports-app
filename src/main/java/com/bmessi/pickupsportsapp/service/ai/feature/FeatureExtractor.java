package com.bmessi.pickupsportsapp.service.ai.feature;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Feature Extraction Service for AI recommendations.
 * 
 * Features:
 * - User preference extraction
 * - Behavioral pattern analysis
 * - Location-based features
 * - Temporal pattern analysis
 * - Skill level assessment
 * - Social interaction features
 * 
 * Best Practices:
 * - Efficient feature computation
 * - Caching for performance
 * - Feature normalization
 * - Missing value handling
 * - Feature importance scoring
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureExtractor {

    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;

    // Feature extraction constants
    private static final int MAX_HISTORY_DAYS = 365;
    private static final int MAX_LOCATION_RADIUS_KM = 50;
    private static final double DEFAULT_SKILL_LEVEL = 0.5;

    /**
     * Extract comprehensive user features for AI recommendations.
     * Implements multi-dimensional feature extraction.
     */
    @Cacheable(value = "user_features", key = "#user.id")
    public Map<String, Object> extractUserFeatures(User user) {
        log.debug("Extracting features for user: {}", user.getUsername());
        
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Basic user features
            features.putAll(extractBasicUserFeatures(user));
            
            // Preference-based features
            features.putAll(extractPreferenceFeatures(user));
            
            // Behavioral features
            features.putAll(extractBehavioralFeatures(user));
            
            // Location-based features
            features.putAll(extractLocationFeatures(user));
            
            // Temporal features
            features.putAll(extractTemporalFeatures(user));
            
            // Social features
            features.putAll(extractSocialFeatures(user));
            
            // Skill and performance features
            features.putAll(extractSkillFeatures(user));
            
            // Feature normalization and validation
            features = normalizeAndValidateFeatures(features);
            
            log.debug("Successfully extracted {} features for user: {}", features.size(), user.getUsername());
            
        } catch (Exception e) {
            log.error("Error extracting features for user: {}", user.getUsername(), e);
            // Return basic features as fallback
            features = extractBasicFallbackFeatures(user);
        }
        
        return features;
    }

    /**
     * Extract basic user demographic and profile features.
     */
    private Map<String, Object> extractBasicUserFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        features.put("user_id", user.getId());
        features.put("username", user.getUsername());
        features.put("age_group", calculateAgeGroup(user));
        features.put("gender", "unknown"); // Gender field not available in User entity
        features.put("location", user.getLocation());
        features.put("preferred_sport", user.getPreferredSport() != null ? 
            user.getPreferredSport().getDisplayName() : "Unknown");
        features.put("skill_level", user.getSkillLevel() != null ? 
            user.getSkillLevel().name() : "INTERMEDIATE");
        features.put("account_age_days", calculateAccountAge(user));
        features.put("verification_status", user.isVerified() ? "verified" : "unverified");
        
        return features;
    }

    /**
     * Extract user preference features based on profile and history.
     */
    private Map<String, Object> extractPreferenceFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        // Sport preferences
        features.put("preferred_sport", user.getPreferredSport() != null ? 
            user.getPreferredSport().getDisplayName() : "Soccer");
        features.put("secondary_sports", extractSecondarySports(user));
        features.put("sport_interest_level", calculateSportInterestLevel(user));
        
        // Time preferences
        features.put("preferred_game_time", extractPreferredGameTime(user));
        features.put("preferred_days", extractPreferredDays(user));
        features.put("preferred_duration", extractPreferredDuration(user));
        
        // Group size preferences
        features.put("preferred_group_size", extractPreferredGroupSize(user));
        features.put("team_preference", extractTeamPreference(user));
        
        // Venue preferences
        features.put("preferred_venue_type", extractPreferredVenueType(user));
        features.put("preferred_facilities", extractPreferredFacilities(user));
        
        return features;
    }

    /**
     * Extract behavioral features based on user activity patterns.
     */
    private Map<String, Object> extractBehavioralFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Game participation patterns - using available methods
            List<Game> userGames = gameRepository.findByUserIdWithParticipants(user.getId(), PageRequest.of(0, 100)).getContent();
            features.put("total_games_played", userGames.size());
            features.put("games_per_month", calculateGamesPerMonth(userGames));
            features.put("participation_rate", calculateParticipationRate(userGames));
            features.put("rsvp_behavior", analyzeRsvpBehavior(userGames, user));
            
            // Venue usage patterns - simplified approach
            List<Venue> userVenues = new ArrayList<>(); // Placeholder for venue extraction
            features.put("favorite_venues", extractFavoriteVenues(userVenues));
            features.put("venue_loyalty", calculateVenueLoyalty(userVenues, user));
            
            // Social interaction patterns
            features.put("social_connections", calculateSocialConnections(user));
            features.put("group_formation_behavior", analyzeGroupFormation(user));
            
            // Activity patterns
            features.put("peak_activity_hours", calculatePeakActivityHours(userGames));
            features.put("seasonal_activity", calculateSeasonalActivity(userGames));
            
        } catch (Exception e) {
            log.warn("Error extracting behavioral features for user: {}", user.getUsername(), e);
            features.put("total_games_played", 0);
            features.put("games_per_month", 0.0);
            features.put("participation_rate", 0.0);
        }
        
        return features;
    }

    /**
     * Extract location-based features for geographic recommendations.
     */
    private Map<String, Object> extractLocationFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            features.put("user_location", user.getLocation());
            features.put("location_precision", calculateLocationPrecision(user));
            features.put("travel_willingness", calculateTravelWillingness(user));
            features.put("preferred_radius_km", calculatePreferredRadius(user));
            features.put("location_flexibility", calculateLocationFlexibility(user));
            
            // Nearby venues and games
            if (user.getLocation() != null) {
                features.put("nearby_venues_count", countNearbyVenues(user));
                features.put("nearby_games_count", countNearbyGames(user));
                features.put("location_optimization_score", calculateLocationOptimizationScore(user));
            }
            
        } catch (Exception e) {
            log.warn("Error extracting location features for user: {}", user.getUsername(), e);
            features.put("user_location", "Unknown");
            features.put("travel_willingness", 0.5);
        }
        
        return features;
    }

    /**
     * Extract temporal features for time-based recommendations.
     */
    private Map<String, Object> extractTemporalFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Time-based patterns
            features.put("current_time", OffsetDateTime.now());
            features.put("day_of_week", OffsetDateTime.now().getDayOfWeek());
            features.put("month", OffsetDateTime.now().getMonth());
            features.put("season", getCurrentSeason());
            
            // User time preferences
            features.put("morning_player", isMorningPlayer(user));
            features.put("evening_player", isEveningPlayer(user));
            features.put("weekend_player", isWeekendPlayer(user));
            features.put("weekday_player", isWeekdayPlayer(user));
            
            // Seasonal preferences
            features.put("summer_player", isSummerPlayer(user));
            features.put("winter_player", isWinterPlayer(user));
            features.put("indoor_preference", hasIndoorPreference(user));
            features.put("outdoor_preference", hasOutdoorPreference(user));
            
        } catch (Exception e) {
            log.warn("Error extracting temporal features for user: {}", user.getUsername(), e);
        }
        
        return features;
    }

    /**
     * Extract social interaction features for collaborative filtering.
     */
    private Map<String, Object> extractSocialFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Social network features
            features.put("friend_count", calculateFriendCount(user));
            features.put("team_membership", calculateTeamMembership(user));
            features.put("social_influence", calculateSocialInfluence(user));
            features.put("collaboration_preference", calculateCollaborationPreference(user));
            
            // Communication patterns
            features.put("chat_activity", calculateChatActivity(user));
            features.put("rating_behavior", analyzeRatingBehavior(user));
            features.put("feedback_provided", calculateFeedbackProvided(user));
            
        } catch (Exception e) {
            log.warn("Error extracting social features for user: {}", user.getUsername(), e);
            features.put("friend_count", 0);
            features.put("social_influence", 0.5);
        }
        
        return features;
    }

    /**
     * Extract skill and performance features for matching algorithms.
     */
    private Map<String, Object> extractSkillFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Skill assessment
                    features.put("skill_level", user.getSkillLevel() != null ? 
            user.getSkillLevel().name() : "INTERMEDIATE");
            features.put("skill_confidence", calculateSkillConfidence(user));
            features.put("skill_progression", calculateSkillProgression(user));
            features.put("versatility_score", calculateVersatilityScore(user));
            
            // Performance metrics
            features.put("win_rate", calculateWinRate(user));
            features.put("participation_consistency", calculateParticipationConsistency(user));
            features.put("improvement_rate", calculateImprovementRate(user));
            
            // Learning preferences
            features.put("learning_style", determineLearningStyle(user));
            features.put("mentorship_preference", hasMentorshipPreference(user));
            features.put("competitive_level", determineCompetitiveLevel(user));
            
        } catch (Exception e) {
            log.warn("Error extracting skill features for user: {}", user.getUsername(), e);
            features.put("skill_level", "Intermediate");
            features.put("skill_confidence", 0.5);
        }
        
        return features;
    }

    // Helper methods for feature extraction

    private String calculateAgeGroup(User user) {
        // This would calculate age group based on birth date
        // For now, return a default value
        return "25-34";
    }

    private long calculateAccountAge(User user) {
        if (user.getCreatedAt() != null) {
            return ChronoUnit.DAYS.between(user.getCreatedAt(), OffsetDateTime.now());
        }
        return 0;
    }

    private List<String> extractSecondarySports(User user) {
        // This would extract secondary sports from user history
        // For now, return default values
        return Arrays.asList("Basketball", "Tennis");
    }

    private double calculateSportInterestLevel(User user) {
        // This would calculate interest level based on engagement
        // For now, return a default value
        return 0.8;
    }

    private String extractPreferredGameTime(User user) {
        // This would analyze user's preferred game times
        // For now, return a default value
        return "weekend_morning";
    }

    private List<String> extractPreferredDays(User user) {
        // This would analyze user's preferred days
        // For now, return default values
        return Arrays.asList("Saturday", "Sunday");
    }

    private String extractPreferredDuration(User user) {
        // This would analyze user's preferred game duration
        // For now, return a default value
        return "2_hours";
    }

    private String extractPreferredGroupSize(User user) {
        // This would analyze user's preferred group sizes
        // For now, return a default value
        return "8-12";
    }

    private String extractTeamPreference(User user) {
        // This would analyze user's team preferences
        // For now, return a default value
        return "balanced";
    }

    private String extractPreferredVenueType(User user) {
        // This would analyze user's venue preferences
        // For now, return a default value
        return "outdoor_field";
    }

    private List<String> extractPreferredFacilities(User user) {
        // This would analyze user's facility preferences
        // For now, return default values
        return Arrays.asList("parking", "showers", "equipment");
    }

    private double calculateGamesPerMonth(List<Game> userGames) {
        if (userGames.isEmpty()) return 0.0;
        
        // Calculate average games per month over the last year
        long totalDays = userGames.stream()
            .mapToLong(game -> ChronoUnit.DAYS.between(game.getTime(), OffsetDateTime.now()))
            .sum();
        
        return totalDays > 0 ? (double) userGames.size() / (totalDays / 30.0) : 0.0;
    }

    private double calculateParticipationRate(List<Game> userGames) {
        if (userGames.isEmpty()) return 0.0;
        
        // Calculate participation rate based on RSVP vs actual participation
        long participatedGames = userGames.stream()
            .filter(game -> game.getParticipants() != null && !game.getParticipants().isEmpty())
            .count();
        
        return (double) participatedGames / userGames.size();
    }

    private Map<String, Object> analyzeRsvpBehavior(List<Game> userGames, User user) {
        Map<String, Object> behavior = new HashMap<>();
        
        // This would analyze RSVP patterns
        // For now, return default values
        behavior.put("rsvp_consistency", 0.8);
        behavior.put("late_cancellations", 0.1);
        behavior.put("no_shows", 0.05);
        
        return behavior;
    }

    private List<String> extractFavoriteVenues(List<Venue> userVenues) {
        // This would extract favorite venues based on frequency
        // For now, return default values
        return Arrays.asList("Central Park", "Riverside Field");
    }

    private double calculateVenueLoyalty(List<Venue> userVenues, User user) {
        // This would calculate venue loyalty score
        // For now, return a default value
        return 0.7;
    }

    private int calculateSocialConnections(User user) {
        // This would calculate social connections
        // For now, return a default value
        return 15;
    }

    private Map<String, Object> analyzeGroupFormation(User user) {
        Map<String, Object> analysis = new HashMap<>();
        
        // This would analyze group formation behavior
        // For now, return default values
        analysis.put("group_leader", 0.3);
        analysis.put("team_player", 0.8);
        analysis.put("solo_player", 0.2);
        
        return analysis;
    }

    private List<String> calculatePeakActivityHours(List<Game> userGames) {
        // This would calculate peak activity hours
        // For now, return default values
        return Arrays.asList("09:00", "18:00");
    }

    private Map<String, Double> calculateSeasonalActivity(List<Game> userGames) {
        Map<String, Double> seasonal = new HashMap<>();
        
        // This would calculate seasonal activity patterns
        // For now, return default values
        seasonal.put("spring", 0.25);
        seasonal.put("summer", 0.35);
        seasonal.put("fall", 0.25);
        seasonal.put("winter", 0.15);
        
        return seasonal;
    }

    private double calculateLocationPrecision(User user) {
        // This would calculate location precision
        // For now, return a default value
        return 0.9;
    }

    private double calculateTravelWillingness(User user) {
        // This would calculate travel willingness
        // For now, return a default value
        return 0.6;
    }

    private int calculatePreferredRadius(User user) {
        // This would calculate preferred travel radius
        // For now, return a default value
        return 10;
    }

    private double calculateLocationFlexibility(User user) {
        // This would calculate location flexibility
        // For now, return a default value
        return 0.7;
    }

    private int countNearbyVenues(User user) {
        // This would count nearby venues
        // For now, return a default value
        return 25;
    }

    private int countNearbyGames(User user) {
        // This would count nearby games
        // For now, return a default value
        return 15;
    }

    private double calculateLocationOptimizationScore(User user) {
        // This would calculate location optimization score
        // For now, return a default value
        return 0.8;
    }

    private String getCurrentSeason() {
        int month = OffsetDateTime.now().getMonthValue();
        if (month >= 3 && month <= 5) return "SPRING";
        if (month >= 6 && month <= 8) return "SUMMER";
        if (month >= 9 && month <= 11) return "FALL";
        return "WINTER";
    }

    private boolean isMorningPlayer(User user) {
        // This would analyze if user is a morning player
        // For now, return a default value
        return true;
    }

    private boolean isEveningPlayer(User user) {
        // This would analyze if user is an evening player
        // For now, return a default value
        return false;
    }

    private boolean isWeekendPlayer(User user) {
        // This would analyze if user is a weekend player
        // For now, return a default value
        return true;
    }

    private boolean isWeekdayPlayer(User user) {
        // This would analyze if user is a weekday player
        // For now, return a default value
        return false;
    }

    private boolean isSummerPlayer(User user) {
        // This would analyze if user is a summer player
        // For now, return a default value
        return true;
    }

    private boolean isWinterPlayer(User user) {
        // This would analyze if user is a winter player
        // For now, return a default value
        return false;
    }

    private boolean hasIndoorPreference(User user) {
        // This would analyze indoor preference
        // For now, return a default value
        return false;
    }

    private boolean hasOutdoorPreference(User user) {
        // This would analyze outdoor preference
        // For now, return a default value
        return true;
    }

    private int calculateFriendCount(User user) {
        // This would calculate friend count
        // For now, return a default value
        return 20;
    }

    private double calculateTeamMembership(User user) {
        // This would calculate team membership
        // For now, return a default value
        return 0.6;
    }

    private double calculateSocialInfluence(User user) {
        // This would calculate social influence
        // For now, return a default value
        return 0.7;
    }

    private double calculateCollaborationPreference(User user) {
        // This would calculate collaboration preference
        // For now, return a default value
        return 0.8;
    }

    private double calculateChatActivity(User user) {
        // This would calculate chat activity
        // For now, return a default value
        return 0.6;
    }

    private Map<String, Object> analyzeRatingBehavior(User user) {
        Map<String, Object> behavior = new HashMap<>();
        
        // This would analyze rating behavior
        // For now, return default values
        behavior.put("rating_frequency", 0.7);
        behavior.put("rating_consistency", 0.8);
        behavior.put("positive_bias", 0.1);
        
        return behavior;
    }

    private double calculateFeedbackProvided(User user) {
        // This would calculate feedback provided
        // For now, return a default value
        return 0.5;
    }

    private double calculateSkillConfidence(User user) {
        // This would calculate skill confidence
        // For now, return a default value
        return 0.7;
    }

    private double calculateSkillProgression(User user) {
        // This would calculate skill progression
        // For now, return a default value
        return 0.6;
    }

    private double calculateVersatilityScore(User user) {
        // This would calculate versatility score
        // For now, return a default value
        return 0.8;
    }

    private double calculateWinRate(User user) {
        // This would calculate win rate
        // For now, return a default value
        return 0.6;
    }

    private double calculateParticipationConsistency(User user) {
        // This would calculate participation consistency
        // For now, return a default value
        return 0.8;
    }

    private double calculateImprovementRate(User user) {
        // This would calculate improvement rate
        // For now, return a default value
        return 0.5;
    }

    private String determineLearningStyle(User user) {
        // This would determine learning style
        // For now, return a default value
        return "visual";
    }

    private boolean hasMentorshipPreference(User user) {
        // This would analyze mentorship preference
        // For now, return a default value
        return true;
    }

    private String determineCompetitiveLevel(User user) {
        // This would determine competitive level
        // For now, return a default value
        return "moderate";
    }

    /**
     * Normalize and validate extracted features.
     */
    private Map<String, Object> normalizeAndValidateFeatures(Map<String, Object> features) {
        Map<String, Object> normalized = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : features.entrySet()) {
            Object value = entry.getValue();
            
            // Handle null values
            if (value == null) {
                normalized.put(entry.getKey(), getDefaultValue(entry.getKey()));
                continue;
            }
            
            // Normalize numeric values
            if (value instanceof Number) {
                double numValue = ((Number) value).doubleValue();
                if (numValue < 0) numValue = 0;
                if (numValue > 1 && entry.getKey().contains("rate")) {
                    numValue = Math.min(numValue, 1.0);
                }
                normalized.put(entry.getKey(), numValue);
            } else {
                normalized.put(entry.getKey(), value);
            }
        }
        
        return normalized;
    }

    /**
     * Get default value for a feature type.
     */
    private Object getDefaultValue(String featureName) {
        if (featureName.contains("rate") || featureName.contains("score")) {
            return 0.5;
        } else if (featureName.contains("count")) {
            return 0;
        } else if (featureName.contains("preference")) {
            return "neutral";
        } else {
            return "unknown";
        }
    }

    /**
     * Extract basic fallback features when extraction fails.
     */
    private Map<String, Object> extractBasicFallbackFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        features.put("user_id", user.getId());
        features.put("username", user.getUsername());
        features.put("preferred_sport", "Soccer");
        features.put("skill_level", "Intermediate");
        features.put("location", "Unknown");
        features.put("total_games_played", 0);
        features.put("participation_rate", 0.5);
        features.put("travel_willingness", 0.5);
        
        return features;
    }

    /**
     * Get feature extraction statistics for monitoring.
     */
    public Map<String, Object> getFeatureExtractionStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("max_history_days", MAX_HISTORY_DAYS);
        stats.put("max_location_radius_km", MAX_LOCATION_RADIUS_KM);
        stats.put("default_skill_level", DEFAULT_SKILL_LEVEL);
        stats.put("extraction_version", "v1.0");
        return stats;
    }
}
