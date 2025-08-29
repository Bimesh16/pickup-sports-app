package com.bmessi.pickupsportsapp.service.ai;

import com.bmessi.pickupsportsapp.dto.ai.GameRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.PlayerRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.VenueRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.service.ai.optimization.RecommendationOptimizer;
import com.bmessi.pickupsportsapp.service.ai.feature.FeatureExtractor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Simplified test suite for EnhancedAiRecommendationEngine.
 * Focuses on core functionality without complex Mockito configurations.
 */
@ExtendWith(MockitoExtension.class)
class EnhancedAiRecommendationEngineSimpleTest {

    @Mock
    private PlayerRecommendationService playerRecommendationService;

    @Mock
    private GameRecommendationService gameRecommendationService;

    @Mock
    private VenueRecommendationService venueRecommendationService;

    @Mock
    private DemandForecastingService demandForecastingService;

    @Mock
    private FeatureExtractor featureExtractor;

    @Mock
    private RecommendationOptimizer recommendationOptimizer;

    @InjectMocks
    private EnhancedAiRecommendationEngine enhancedEngine;

    private User testUser;
    private Map<String, Object> testUserFeatures;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .username("testuser")
            .build();

        testUserFeatures = Map.of(
            "preferred_sport", "Soccer",
            "location", "New York",
            "preferred_game_time", "weekend_morning",
            "preferred_skill_level", "Intermediate"
        );
    }

    @Test
    void testEnhancedEngineCreation() {
        // Simple test to ensure the engine is created
        assertNotNull(enhancedEngine);
    }

    @Test
    void testGenerateComprehensiveRecommendations_BasicStructure() {
        // Arrange - use simple mocks
        when(featureExtractor.extractUserFeatures(any(User.class)))
            .thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(User.class), anyInt()))
            .thenReturn(createMockGameRecommendations(3));
        when(playerRecommendationService.getPlayerRecommendations(any(), any(User.class), anyInt()))
            .thenReturn(createMockPlayerRecommendations(3));
        when(venueRecommendationService.getPersonalizedRecommendations(any(User.class), anyInt()))
            .thenReturn(createMockVenueRecommendations(3));
        when(recommendationOptimizer.optimizeGameRecommendations(anyList(), anyMap()))
            .thenReturn(createMockGameRecommendations(3));
        when(recommendationOptimizer.optimizePlayerRecommendations(anyList(), anyMap()))
            .thenReturn(createMockPlayerRecommendations(3));
        when(recommendationOptimizer.optimizeVenueRecommendations(anyList(), anyMap()))
            .thenReturn(createMockVenueRecommendations(3));

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 5, "hybrid");

        // Assert - basic structure validation
        assertNotNull(result);
        assertTrue(result.containsKey("game_recommendations"));
        assertTrue(result.containsKey("player_recommendations"));
        assertTrue(result.containsKey("venue_recommendations"));
        assertTrue(result.containsKey("model_version"));
        assertEquals("v2.0-enhanced", result.get("model_version"));
    }

    @Test
    void testGenerateComprehensiveRecommendations_FallbackOnError() {
        // Arrange - simulate feature extraction failure
        when(featureExtractor.extractUserFeatures(any(User.class)))
            .thenThrow(new RuntimeException("Feature extraction failed"));

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 5, "hybrid");

        // Assert - fallback should work
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertTrue(result.containsKey("fallback_reason"));
        assertEquals("ML algorithm failure", result.get("fallback_reason"));
        
        // Should have fallback recommendations
        assertTrue(result.containsKey("game_recommendations"));
        assertTrue(result.containsKey("player_recommendations"));
        assertTrue(result.containsKey("venue_recommendations"));
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_DefaultBehavior() {
        // Arrange - simple mock setup
        when(featureExtractor.extractUserFeatures(any(User.class)))
            .thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(User.class), anyInt()))
            .thenReturn(createMockGameRecommendations(3));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 5, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_FallbackOnError() {
        // Arrange - simulate failure
        when(featureExtractor.extractUserFeatures(any(User.class)))
            .thenThrow(new RuntimeException("Feature extraction failed"));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 5, "hybrid");

        // Assert - should use fallback
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertTrue(result.get(0).reason().contains("Fallback"));
    }

    @Test
    void testGeneratePlayerRecommendationsByAlgorithm() {
        // Arrange
        when(playerRecommendationService.getPlayerRecommendations(any(), any(User.class), anyInt()))
            .thenReturn(createMockPlayerRecommendations(3));

        // Act
        List<PlayerRecommendationDTO> result = enhancedEngine.generatePlayerRecommendationsByAlgorithm(testUser, 5, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    @Test
    void testGenerateVenueRecommendationsByAlgorithm() {
        // Arrange
        when(venueRecommendationService.getPersonalizedRecommendations(any(User.class), anyInt()))
            .thenReturn(createMockVenueRecommendations(3));

        // Act
        List<VenueRecommendationDTO> result = enhancedEngine.generateVenueRecommendationsByAlgorithm(testUser, 5, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    @Test
    void testUpdateModelsWithFeedback() {
        // Arrange
        Long recommendationId = 1L;
        String feedback = "positive";
        String recommendationType = "game";

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> 
            enhancedEngine.updateModelsWithFeedback(recommendationId, feedback, recommendationType));
    }

    @Test
    void testGenerateBatchRecommendationsAsync() {
        // Act
        var result = enhancedEngine.generateBatchRecommendationsAsync();

        // Assert
        assertNotNull(result);
        assertFalse(result.isCompletedExceptionally());
    }

    // Helper methods to create mock data

    private List<GameRecommendationDTO> createMockGameRecommendations(int count) {
        return java.util.stream.IntStream.range(0, count)
            .mapToObj(i -> new GameRecommendationDTO(
                1000L + i,
                null,
                new BigDecimal("0.8"),
                "Test game recommendation " + i,
                com.bmessi.pickupsportsapp.entity.ai.GameRecommendation.RecommendationStatus.ACTIVE,
                "v2.0",
                OffsetDateTime.now()
            ))
            .toList();
    }

    private List<PlayerRecommendationDTO> createMockPlayerRecommendations(int count) {
        return java.util.stream.IntStream.range(0, count)
            .mapToObj(i -> new PlayerRecommendationDTO(
                2000L + i,
                1L,
                null,
                null,
                new BigDecimal("0.75"),
                "Test player recommendation " + i,
                com.bmessi.pickupsportsapp.entity.ai.PlayerRecommendation.RecommendationStatus.PENDING,
                "v2.0",
                OffsetDateTime.now()
            ))
            .toList();
    }

    private List<VenueRecommendationDTO> createMockVenueRecommendations(int count) {
        return java.util.stream.IntStream.range(0, count)
            .mapToObj(i -> new VenueRecommendationDTO(
                3000L + i,
                null,
                new BigDecimal("0.7"),
                "Test venue recommendation " + i,
                com.bmessi.pickupsportsapp.entity.ai.VenueRecommendation.RecommendationStatus.ACTIVE,
                "v2.0",
                OffsetDateTime.now()
            ))
            .toList();
    }
}
