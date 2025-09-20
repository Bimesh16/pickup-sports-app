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
import static org.mockito.ArgumentMatchers.eq;

/**
 * Comprehensive test suite for EnhancedAiRecommendationEngine.
 * Tests all algorithms, optimization features, and error handling.
 */
@ExtendWith(MockitoExtension.class)
class EnhancedAiRecommendationEngineTest {

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
    void testGenerateComprehensiveRecommendations_Success() {
        // Arrange
        when(featureExtractor.extractUserFeatures(any())).thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockGameRecommendations(5));
        when(playerRecommendationService.getPlayerRecommendations(any(), any(), anyInt()))
            .thenReturn(createMockPlayerRecommendations(5));
        when(venueRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockVenueRecommendations(5));
        when(recommendationOptimizer.optimizeGameRecommendations(anyList(), anyMap()))
            .thenReturn(createMockGameRecommendations(5));
        when(recommendationOptimizer.optimizePlayerRecommendations(anyList(), anyMap()))
            .thenReturn(createMockPlayerRecommendations(5));
        when(recommendationOptimizer.optimizeVenueRecommendations(anyList(), anyMap()))
            .thenReturn(createMockVenueRecommendations(5));

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 10, "hybrid");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("game_recommendations"));
        assertTrue(result.containsKey("player_recommendations"));
        assertTrue(result.containsKey("venue_recommendations"));
        assertTrue(result.containsKey("ml_insights"));
        assertTrue(result.containsKey("confidence_scores"));
        assertTrue(result.containsKey("algorithm_metadata"));
        assertTrue(result.containsKey("feature_importance"));
        assertTrue(result.containsKey("recommendation_reasoning"));
        assertTrue(result.containsKey("processing_time_ms"));
        assertTrue(result.containsKey("model_version"));
        assertTrue(result.containsKey("cache_status"));

        assertEquals("v2.0-enhanced", result.get("model_version"));
        assertEquals("HIT", result.get("cache_status"));

        verify(featureExtractor, times(3)).extractUserFeatures(testUser); // Called for comprehensive + collaborative + content-based
        verify(recommendationOptimizer).optimizeGameRecommendations(anyList(), anyMap());
        verify(recommendationOptimizer).optimizePlayerRecommendations(anyList(), anyMap());
        verify(recommendationOptimizer).optimizeVenueRecommendations(anyList(), anyMap());
    }

    @Test
    void testGenerateComprehensiveRecommendations_WithCollaborativeAlgorithm() {
        // Arrange
        when(featureExtractor.extractUserFeatures(any())).thenReturn(testUserFeatures);

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 10, "collaborative");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("algorithm_metadata"));
        Map<String, String> metadata = (Map<String, String>) result.get("algorithm_metadata");
        assertEquals("collaborative", metadata.get("algorithm"));
    }

    @Test
    void testGenerateComprehensiveRecommendations_WithContentAlgorithm() {
        // Arrange
        when(featureExtractor.extractUserFeatures(any())).thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockGameRecommendations(5));
        when(playerRecommendationService.getPlayerRecommendations(any(), any(), anyInt()))
            .thenReturn(createMockPlayerRecommendations(5));
        when(venueRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockVenueRecommendations(5));
        when(recommendationOptimizer.optimizeGameRecommendations(anyList(), anyMap()))
            .thenReturn(createMockGameRecommendations(5));
        when(recommendationOptimizer.optimizePlayerRecommendations(anyList(), anyMap()))
            .thenReturn(createMockPlayerRecommendations(5));
        when(recommendationOptimizer.optimizeVenueRecommendations(anyList(), anyMap()))
            .thenReturn(createMockVenueRecommendations(5));

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 10, "content");

        // Assert
        assertNotNull(result);
        Map<String, String> metadata = (Map<String, String>) result.get("algorithm_metadata");
        assertEquals("content", metadata.get("algorithm"));
    }

    @Test
    void testGenerateComprehensiveRecommendations_WithContextualAlgorithm() {
        // Arrange
        when(featureExtractor.extractUserFeatures(any())).thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockGameRecommendations(5));
        when(playerRecommendationService.getPlayerRecommendations(any(), any(), anyInt()))
            .thenReturn(createMockPlayerRecommendations(5));
        when(venueRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockVenueRecommendations(5));
        when(recommendationOptimizer.optimizeGameRecommendations(anyList(), anyMap()))
            .thenReturn(createMockGameRecommendations(5));
        when(recommendationOptimizer.optimizePlayerRecommendations(anyList(), anyMap()))
            .thenReturn(createMockPlayerRecommendations(5));
        when(recommendationOptimizer.optimizeVenueRecommendations(anyList(), anyMap()))
            .thenReturn(createMockVenueRecommendations(5));

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 10, "contextual");

        // Assert
        assertNotNull(result);
        Map<String, String> metadata = (Map<String, String>) result.get("algorithm_metadata");
        assertEquals("contextual", metadata.get("algorithm"));
    }

    @Test
    void testGenerateComprehensiveRecommendations_WithFallbackOnError() {
        // Arrange
        when(featureExtractor.extractUserFeatures(testUser))
            .thenThrow(new RuntimeException("Feature extraction failed"));

        // Act
        Map<String, Object> result = enhancedEngine.generateComprehensiveRecommendations(testUser, 10, "hybrid");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertTrue(result.containsKey("fallback_reason"));
        assertEquals("ML algorithm failure", result.get("fallback_reason"));
        assertTrue(result.containsKey("game_recommendations"));
        assertTrue(result.containsKey("player_recommendations"));
        assertTrue(result.containsKey("venue_recommendations"));

        // Verify fallback recommendations are generated
        List<GameRecommendationDTO> fallbackGames = (List<GameRecommendationDTO>) result.get("game_recommendations");
        assertFalse(fallbackGames.isEmpty());
        assertTrue(fallbackGames.get(0).reason().contains("Fallback"));
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_Collaborative() {
        // Arrange
        when(featureExtractor.extractUserFeatures(any())).thenReturn(testUserFeatures);

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 10, "collaborative");

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty()); // Should be empty when feature extraction fails
        verify(featureExtractor).extractUserFeatures(any());
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_Content() {
        // Arrange
        when(featureExtractor.extractUserFeatures(testUser)).thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(eq(testUser), eq(20)))
            .thenReturn(createMockGameRecommendations(10));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 10, "content");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(featureExtractor).extractUserFeatures(testUser); // Content-based uses feature extraction
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_Hybrid() {
        // Arrange
        when(featureExtractor.extractUserFeatures(testUser)).thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockGameRecommendations(5));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 10, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(featureExtractor, times(2)).extractUserFeatures(testUser); // Hybrid = collaborative + content-based
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_Contextual() {
        // Arrange
        when(gameRecommendationService.getPersonalizedRecommendations(eq(testUser), eq(20)))
            .thenReturn(createMockGameRecommendations(10));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 10, "contextual");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(featureExtractor, never()).extractUserFeatures(testUser); // Contextual doesn't use feature extraction
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_DefaultToHybrid() {
        // Arrange
        when(featureExtractor.extractUserFeatures(testUser)).thenReturn(testUserFeatures);
        when(gameRecommendationService.getPersonalizedRecommendations(any(), anyInt()))
            .thenReturn(createMockGameRecommendations(5));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 10, "unknown");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(featureExtractor, times(2)).extractUserFeatures(testUser); // Hybrid calls it twice
    }

    @Test
    void testGenerateGameRecommendationsByAlgorithm_FallbackOnError() {
        // Arrange
        when(featureExtractor.extractUserFeatures(testUser))
            .thenThrow(new RuntimeException("Feature extraction failed"));

        // Act
        List<GameRecommendationDTO> result = enhancedEngine.generateGameRecommendationsByAlgorithm(testUser, 10, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertTrue(result.get(0).reason().contains("Fallback"));
    }

    @Test
    void testGeneratePlayerRecommendationsByAlgorithm() {
        // Arrange
        when(playerRecommendationService.getPlayerRecommendations(any(), eq(testUser), eq(10)))
            .thenReturn(createMockPlayerRecommendations(5));

        // Act
        List<PlayerRecommendationDTO> result = enhancedEngine.generatePlayerRecommendationsByAlgorithm(testUser, 10, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(playerRecommendationService).getPlayerRecommendations(any(), eq(testUser), eq(10));
    }

    @Test
    void testGenerateVenueRecommendationsByAlgorithm() {
        // Arrange
        when(venueRecommendationService.getPersonalizedRecommendations(eq(testUser), eq(10)))
            .thenReturn(createMockVenueRecommendations(5));

        // Act
        List<VenueRecommendationDTO> result = enhancedEngine.generateVenueRecommendationsByAlgorithm(testUser, 10, "hybrid");

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(venueRecommendationService).getPersonalizedRecommendations(eq(testUser), eq(10));
    }

    @Test
    void testUpdateModelsWithFeedback() {
        // Arrange
        Long recommendationId = 1L;
        String feedback = "positive";
        String recommendationType = "game";

        // Act
        assertDoesNotThrow(() -> 
            enhancedEngine.updateModelsWithFeedback(recommendationId, feedback, recommendationType));

        // Verify
        verify(gameRecommendationService).updateWithFeedback(recommendationId, feedback);
    }

    @Test
    void testUpdateModelsWithFeedback_UnknownType() {
        // Arrange
        Long recommendationId = 1L;
        String feedback = "positive";
        String recommendationType = "unknown";

        // Act
        assertDoesNotThrow(() -> 
            enhancedEngine.updateModelsWithFeedback(recommendationId, feedback, recommendationType));

        // Verify - should not call any service for unknown type
        verify(gameRecommendationService, never()).updateWithFeedback(any(), any());
        verify(venueRecommendationService, never()).updateWithFeedback(any(), any());
        verify(playerRecommendationService, never()).updateWithFeedback(any(), any());
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
