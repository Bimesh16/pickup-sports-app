package com.bmessi.pickupsportsapp.service.ai.feature;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for extracting features from users and games for ML models.
 * Converts domain objects into numerical and categorical features.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureExtractor {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    /**
     * Extract comprehensive features from a user for ML models.
     */
    public Map<String, Object> extractUserFeatures(User user) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Basic user features
            features.put("user_id", user.getId());
            features.put("account_age_days", calculateAccountAge(user));
            features.put("preferred_sport", user.getPreferredSport() != null ? user.getPreferredSport().getDisplayName() : "unknown");
            features.put("location", user.getLocation() != null ? user.getLocation() : "unknown");
            
            // Behavioral features
            features.put("total_games_joined", getTotalGamesJoined(user));
            features.put("total_games_created", getTotalGamesCreated(user));
            features.put("avg_games_per_week", getAverageGamesPerWeek(user));
            features.put("preferred_game_time", getPreferredGameTime(user));
            features.put("preferred_skill_level", getPreferredSkillLevel(user));
            
            // Social features
            features.put("total_connections", getTotalConnections(user));
            features.put("response_rate", getResponseRate(user));
            features.put("reliability_score", getReliabilityScore(user));
            
            // Temporal features
            features.put("day_of_week_preference", getDayOfWeekPreference(user));
            features.put("time_of_day_preference", getTimeOfDayPreference(user));
            features.put("seasonal_preference", getSeasonalPreference(user));
            
            // Location features
            features.put("travel_distance_preference", getTravelDistancePreference(user));
            features.put("venue_type_preference", getVenueTypePreference(user));
            
            log.debug("Extracted {} features for user: {}", features.size(), user.getUsername());
            
        } catch (Exception e) {
            log.warn("Error extracting features for user: {}", user.getUsername(), e);
            // Return basic features on error
            features.put("user_id", user.getId());
            features.put("preferred_sport", "unknown");
            features.put("location", "unknown");
        }
        
        return features;
    }

    /**
     * Extract features from a game for ML models.
     */
    public Map<String, Object> extractGameFeatures(Game game) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Basic game features
            features.put("game_id", game.getId());
            features.put("sport", game.getSport());
            features.put("location", game.getLocation());
            features.put("skill_level", game.getSkillLevel());
            features.put("game_type", game.getGameType() != null ? game.getGameType().name() : "unknown");
            
            // Capacity features
            features.put("capacity", game.getCapacity() != null ? game.getCapacity() : 0);
            features.put("current_participants", game.getParticipants() != null ? game.getParticipants().size() : 0);
            features.put("fill_rate", calculateFillRate(game));
            
            // Temporal features
            features.put("game_time", game.getTime() != null ? game.getTime().toEpochSecond() : 0);
            features.put("days_until_game", calculateDaysUntilGame(game));
            features.put("time_of_day", extractTimeOfDay(game));
            features.put("day_of_week", extractDayOfWeek(game));
            
            // Location features
            features.put("latitude", game.getLatitude());
            features.put("longitude", game.getLongitude());
            features.put("is_indoors", isIndoorGame(game));
            
            // Pricing features
            features.put("price_per_player", game.getPricePerPlayer() != null ? game.getPricePerPlayer().doubleValue() : 0.0);
            features.put("is_free", game.getPricePerPlayer() == null || game.getPricePerPlayer().doubleValue() == 0.0);
            
            // Game rules and settings
            features.put("is_private", game.getIsPrivate() != null ? game.getIsPrivate() : false);
            features.put("requires_approval", game.getRequiresApproval() != null ? game.getRequiresApproval() : false);
            features.put("waitlist_enabled", game.getWaitlistEnabled() != null ? game.getWaitlistEnabled() : false);
            
            log.debug("Extracted {} features for game: {}", features.size(), game.getId());
            
        } catch (Exception e) {
            log.warn("Error extracting features for game: {}", game.getId(), e);
            // Return basic features on error
            features.put("game_id", game.getId());
            features.put("sport", "unknown");
            features.put("location", "unknown");
        }
        
        return features;
    }

    /**
     * Extract contextual features based on current time and conditions.
     */
    public Map<String, Object> extractContextualFeatures(User user, OffsetDateTime currentTime) {
        Map<String, Object> features = new HashMap<>();
        
        try {
            // Time-based features
            features.put("current_hour", currentTime.getHour());
            features.put("current_day_of_week", currentTime.getDayOfWeek().getValue());
            features.put("current_month", currentTime.getMonthValue());
            features.put("is_weekend", isWeekend(currentTime));
            features.put("is_holiday", isHoliday(currentTime));
            
            // User availability features
            features.put("user_available_now", isUserAvailableNow(user, currentTime));
            features.put("user_preferred_time_slot", getUserPreferredTimeSlot(user, currentTime));
            
            // Weather features (placeholder for future weather API integration)
            features.put("weather_condition", "unknown");
            features.put("temperature", 0.0);
            features.put("precipitation_chance", 0.0);
            
            // Location-specific features
            features.put("current_location", user.getLocation());
            features.put("timezone_offset", currentTime.getOffset().getTotalSeconds() / 3600);
            
            log.debug("Extracted {} contextual features for user: {}", features.size(), user.getUsername());
            
        } catch (Exception e) {
            log.warn("Error extracting contextual features for user: {}", user.getUsername(), e);
        }
        
        return features;
    }

    // Helper methods for feature extraction
    private long calculateAccountAge(User user) {
        // Placeholder implementation
        return 30; // Default to 30 days
    }

    private int getTotalGamesJoined(User user) {
        // Placeholder implementation
        return 10; // Default value
    }

    private int getTotalGamesCreated(User user) {
        // Placeholder implementation
        return 5; // Default value
    }

    private double getAverageGamesPerWeek(User user) {
        // Placeholder implementation
        return 2.5; // Default value
    }

    private String getPreferredGameTime(User user) {
        // Placeholder implementation
        return "evening";
    }

    private String getPreferredSkillLevel(User user) {
        // Placeholder implementation
        return "intermediate";
    }

    private int getTotalConnections(User user) {
        // Placeholder implementation
        return 15; // Default value
    }

    private double getResponseRate(User user) {
        // Placeholder implementation
        return 0.85; // Default value
    }

    private double getReliabilityScore(User user) {
        // Placeholder implementation
        return 0.9; // Default value
    }

    private String getDayOfWeekPreference(User user) {
        // Placeholder implementation
        return "saturday";
    }

    private String getTimeOfDayPreference(User user) {
        // Placeholder implementation
        return "afternoon";
    }

    private String getSeasonalPreference(User user) {
        // Placeholder implementation
        return "spring";
    }

    private double getTravelDistancePreference(User user) {
        // Placeholder implementation
        return 5.0; // Default 5km
    }

    private String getVenueTypePreference(User user) {
        // Placeholder implementation
        return "outdoor";
    }

    private double calculateFillRate(Game game) {
        if (game.getCapacity() == null || game.getCapacity() == 0) {
            return 0.0;
        }
        int currentParticipants = game.getParticipants() != null ? game.getParticipants().size() : 0;
        return (double) currentParticipants / game.getCapacity();
    }

    private long calculateDaysUntilGame(Game game) {
        if (game.getTime() == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(OffsetDateTime.now(), game.getTime());
    }

    private int extractTimeOfDay(Game game) {
        if (game.getTime() == null) {
            return 12; // Default to noon
        }
        return game.getTime().getHour();
    }

    private int extractDayOfWeek(Game game) {
        if (game.getTime() == null) {
            return 1; // Default to Monday
        }
        return game.getTime().getDayOfWeek().getValue();
    }

    private boolean isIndoorGame(Game game) {
        // Placeholder implementation
        return false; // Default to outdoor
    }

    private boolean isWeekend(OffsetDateTime time) {
        int dayOfWeek = time.getDayOfWeek().getValue();
        return dayOfWeek == 6 || dayOfWeek == 7; // Saturday or Sunday
    }

    private boolean isHoliday(OffsetDateTime time) {
        // Placeholder implementation for holiday detection
        return false;
    }

    private boolean isUserAvailableNow(User user, OffsetDateTime currentTime) {
        // Placeholder implementation
        return true; // Default to available
    }

    private String getUserPreferredTimeSlot(User user, OffsetDateTime currentTime) {
        // Placeholder implementation
        return "anytime";
    }
}
