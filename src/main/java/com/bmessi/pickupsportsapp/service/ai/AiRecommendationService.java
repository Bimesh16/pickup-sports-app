package com.bmessi.pickupsportsapp.service.ai;

import com.bmessi.pickupsportsapp.dto.ai.GameRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.PlayerRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.VenueRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Main service for AI-powered recommendations.
 * Orchestrates player matching, game recommendations, and venue suggestions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AiRecommendationService {

    private final PlayerRecommendationService playerRecommendationService;
    private final GameRecommendationService gameRecommendationService;
    private final VenueRecommendationService venueRecommendationService;
    private final DemandForecastingService demandForecastingService;

    /**
     * Get personalized game recommendations for a user.
     */
    public List<GameRecommendationDTO> getGameRecommendations(User user, int limit) {
        log.debug("Getting game recommendations for user: {}", user.getId());
        return gameRecommendationService.getPersonalizedRecommendations(user, limit);
    }

    /**
     * Get player recommendations for a specific game.
     */
    public List<PlayerRecommendationDTO> getPlayerRecommendations(Game game, User requestingUser, int limit) {
        log.debug("Getting player recommendations for game: {} requested by user: {}", game.getId(), requestingUser.getId());
        return playerRecommendationService.getPlayerRecommendations(game, requestingUser, limit);
    }

    /**
     * Get venue recommendations for a user based on their preferences and location.
     */
    public List<VenueRecommendationDTO> getVenueRecommendations(User user, int limit) {
        log.debug("Getting venue recommendations for user: {}", user.getId());
        return venueRecommendationService.getPersonalizedRecommendations(user, limit);
    }

    /**
     * Get demand forecast for a specific sport in a location.
     */
    public double getDemandForecast(String sport, String city, int daysAhead) {
        log.debug("Getting demand forecast for sport: {} in city: {} for {} days ahead", sport, city, daysAhead);
        return demandForecastingService.forecastDemand(sport, city, daysAhead);
    }

    /**
     * Generate recommendations for all active users (batch processing).
     */
    public void generateBatchRecommendations() {
        log.info("Starting batch recommendation generation");
        
        try {
            gameRecommendationService.generateBatchRecommendations();
            venueRecommendationService.generateBatchRecommendations();
            log.info("Batch recommendation generation completed successfully");
        } catch (Exception e) {
            log.error("Error during batch recommendation generation", e);
            throw new RuntimeException("Failed to generate batch recommendations", e);
        }
    }

    /**
     * Update recommendation models with user feedback.
     */
    public void updateModelsWithFeedback(Long recommendationId, String feedback, String recommendationType) {
        log.debug("Updating models with feedback for {} recommendation: {}", recommendationType, recommendationId);
        
        switch (recommendationType.toLowerCase()) {
            case "game" -> gameRecommendationService.updateWithFeedback(recommendationId, feedback);
            case "venue" -> venueRecommendationService.updateWithFeedback(recommendationId, feedback);
            case "player" -> playerRecommendationService.updateWithFeedback(recommendationId, feedback);
            default -> log.warn("Unknown recommendation type: {}", recommendationType);
        }
    }

    /**
     * Get recommendation insights and analytics.
     */
    public RecommendationInsights getRecommendationInsights() {
        log.debug("Getting recommendation insights");
        
        return RecommendationInsights.builder()
                .totalRecommendationsGenerated(gameRecommendationService.getTotalRecommendationsGenerated() +
                        venueRecommendationService.getTotalRecommendationsGenerated() +
                        playerRecommendationService.getTotalRecommendationsGenerated())
                .averageClickThroughRate(gameRecommendationService.getAverageClickThroughRate())
                .modelAccuracy(gameRecommendationService.getModelAccuracy())
                .lastModelUpdate(gameRecommendationService.getLastModelUpdate())
                .build();
    }

    /**
     * Data class for recommendation insights.
     */
    public record RecommendationInsights(
            long totalRecommendationsGenerated,
            double averageClickThroughRate,
            double modelAccuracy,
            String lastModelUpdate
    ) {
        public static RecommendationInsightsBuilder builder() {
            return new RecommendationInsightsBuilder();
        }
        
        public static class RecommendationInsightsBuilder {
            private long totalRecommendationsGenerated;
            private double averageClickThroughRate;
            private double modelAccuracy;
            private String lastModelUpdate;
            
            public RecommendationInsightsBuilder totalRecommendationsGenerated(long totalRecommendationsGenerated) {
                this.totalRecommendationsGenerated = totalRecommendationsGenerated;
                return this;
            }
            
            public RecommendationInsightsBuilder averageClickThroughRate(double averageClickThroughRate) {
                this.averageClickThroughRate = averageClickThroughRate;
                return this;
            }
            
            public RecommendationInsightsBuilder modelAccuracy(double modelAccuracy) {
                this.modelAccuracy = modelAccuracy;
                return this;
            }
            
            public RecommendationInsightsBuilder lastModelUpdate(String lastModelUpdate) {
                this.lastModelUpdate = lastModelUpdate;
                return this;
            }
            
            public RecommendationInsights build() {
                return new RecommendationInsights(totalRecommendationsGenerated, averageClickThroughRate, modelAccuracy, lastModelUpdate);
            }
        }
    }
}
