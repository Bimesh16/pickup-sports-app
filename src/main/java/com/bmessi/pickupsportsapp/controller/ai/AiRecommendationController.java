package com.bmessi.pickupsportsapp.controller.ai;

import com.bmessi.pickupsportsapp.dto.ai.GameRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.PlayerRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.VenueRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.service.ai.SimplifiedAiRecommendationEngine;
import com.bmessi.pickupsportsapp.service.ai.model.MlModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for AI-powered recommendations.
 * Provides endpoints for game, player, and venue recommendations using ML models.
 */
@RestController
@RequestMapping("/api/v1/ai/recommendations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Recommendations", description = "AI-powered recommendation endpoints")
public class AiRecommendationController {

    private final SimplifiedAiRecommendationEngine simplifiedEngine;
    private final MlModelService mlModelService;

    /**
     * Get comprehensive AI-powered recommendations for a user.
     */
    @GetMapping("/comprehensive")
    @Operation(summary = "Get comprehensive AI recommendations", 
               description = "Get personalized game, player, and venue recommendations using ML models")
    public ResponseEntity<Map<String, Object>> getComprehensiveRecommendations(
            @Parameter(description = "Number of recommendations to return") 
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        try {
            // Extract user from authentication
            String username = authentication.getName();
            log.info("Generating comprehensive AI recommendations for user: {} with limit: {}", username, limit);
            
            // Get user entity (this would need to be implemented)
            // User user = userService.findByUsername(username);
            
            // For now, create a mock user
            User mockUser = User.builder()
                .id(1L)
                .username(username)
                .build();
            
            // Generate comprehensive recommendations using the simplified engine
            Map<String, Object> recommendations = simplifiedEngine.generateComprehensiveRecommendations(mockUser, limit);
            
            log.info("Successfully generated comprehensive recommendations for user: {}", username);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Failed to generate comprehensive recommendations", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to generate recommendations", "message", e.getMessage()));
        }
    }

    /**
     * Get AI-powered game recommendations.
     */
    @GetMapping("/games")
    @Operation(summary = "Get AI game recommendations", 
               description = "Get personalized game recommendations using ML models")
    public ResponseEntity<List<GameRecommendationDTO>> getGameRecommendations(
            @Parameter(description = "Number of recommendations to return") 
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Generating AI game recommendations for user: {} with limit: {}", username, limit);
            
            User mockUser = User.builder()
                .id(1L)
                .username(username)
                .build();
            List<GameRecommendationDTO> recommendations = simplifiedEngine.generateGameRecommendations(mockUser, limit);
            
            log.info("Successfully generated {} game recommendations for user: {}", recommendations.size(), username);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Failed to generate game recommendations", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI-powered player recommendations for a specific game.
     */
    @GetMapping("/players")
    @Operation(summary = "Get AI player recommendations", 
               description = "Get player recommendations for a game using ML models")
    public ResponseEntity<List<PlayerRecommendationDTO>> getPlayerRecommendations(
            @Parameter(description = "Game ID to find players for") 
            @RequestParam Long gameId,
            @Parameter(description = "Number of recommendations to return") 
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Generating AI player recommendations for game: {} requested by user: {} with limit: {}", 
                    gameId, username, limit);
            
            User mockUser = User.builder()
                .id(1L)
                .username(username)
                .build();
            List<PlayerRecommendationDTO> recommendations = simplifiedEngine.generatePlayerRecommendations(mockUser, limit);
            
            log.info("Successfully generated {} player recommendations for game: {}", recommendations.size(), gameId);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Failed to generate player recommendations", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI-powered venue recommendations.
     */
    @GetMapping("/venues")
    @Operation(summary = "Get AI venue recommendations", 
               description = "Get personalized venue recommendations using ML models")
    public ResponseEntity<List<VenueRecommendationDTO>> getVenueRecommendations(
            @Parameter(description = "Number of recommendations to return") 
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Generating AI venue recommendations for user: {} with limit: {}", username, limit);
            
            User mockUser = User.builder()
                .id(1L)
                .username(username)
                .build();
            List<VenueRecommendationDTO> recommendations = simplifiedEngine.generateVenueRecommendations(mockUser, limit);
            
            log.info("Successfully generated {} venue recommendations for user: {}", recommendations.size(), username);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Failed to generate venue recommendations", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get ML model performance metrics.
     */
    @GetMapping("/models/performance")
    @Operation(summary = "Get ML model performance", 
               description = "Get performance metrics for all ML models")
    public ResponseEntity<Map<String, Object>> getModelPerformance() {
        try {
            log.info("Retrieving ML model performance metrics");
            
            Map<String, Object> performance = mlModelService.getModelPerformance();
            
            log.info("Successfully retrieved model performance metrics");
            return ResponseEntity.ok(performance);
            
        } catch (Exception e) {
            log.error("Failed to retrieve model performance", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve model performance", "message", e.getMessage()));
        }
    }

    /**
     * Retrain ML models with new data.
     */
    @PostMapping("/models/retrain")
    @Operation(summary = "Retrain ML models", 
               description = "Trigger retraining of all ML models with new data")
    public ResponseEntity<Map<String, Object>> retrainModels() {
        try {
            log.info("Starting ML model retraining process");
            
            mlModelService.retrainModels();
            
            Map<String, Object> result = Map.of(
                "status", "started",
                "message", "Model retraining process initiated",
                "timestamp", System.currentTimeMillis()
            );
            
            log.info("Successfully initiated model retraining");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to start model retraining", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to start model retraining", "message", e.getMessage()));
        }
    }

    /**
     * Run A/B test for different model versions.
     */
    @PostMapping("/models/ab-test")
    @Operation(summary = "Run A/B test", 
               description = "Set up A/B testing for different model versions")
    public ResponseEntity<Map<String, Object>> runAbTest(
            @Parameter(description = "Type of model to test") 
            @RequestParam String modelType,
            @Parameter(description = "First version to test") 
            @RequestParam String versionA,
            @Parameter(description = "Second version to test") 
            @RequestParam String versionB,
            @Parameter(description = "Traffic split (0.0 to 1.0)") 
            @RequestParam(defaultValue = "0.5") double trafficSplit) {
        
        try {
            log.info("Setting up A/B test for model: {} versions: {} vs {} (split: {})", 
                    modelType, versionA, versionB, trafficSplit);
            
            Map<String, Object> result = mlModelService.runAbTest(modelType, versionA, versionB, trafficSplit);
            
            log.info("Successfully set up A/B test for model: {}", modelType);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to set up A/B test", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to set up A/B test", "message", e.getMessage()));
        }
    }

    /**
     * Get contextual recommendations based on current time and conditions.
     */
    @GetMapping("/contextual")
    @Operation(summary = "Get contextual recommendations", 
               description = "Get recommendations based on current context (time, weather, etc.)")
    public ResponseEntity<Map<String, Object>> getContextualRecommendations(
            @Parameter(description = "Number of recommendations to return") 
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Generating contextual AI recommendations for user: {} with limit: {}", username, limit);
            
            User mockUser = User.builder()
                .id(1L)
                .username(username)
                .build();

            List<GameRecommendationDTO> contextualRecs = simplifiedEngine.generateContextualRecommendations(mockUser, limit);
            
            Map<String, Object> result = Map.of(
                "recommendations", contextualRecs,
                "context", Map.of(
                    "current_time", System.currentTimeMillis(),
                    "user", username,
                    "recommendation_count", contextualRecs.size()
                )
            );
            
            log.info("Successfully generated {} contextual recommendations for user: {}", contextualRecs.size(), username);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to generate contextual recommendations", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to generate contextual recommendations", "message", e.getMessage()));
        }
    }
}
