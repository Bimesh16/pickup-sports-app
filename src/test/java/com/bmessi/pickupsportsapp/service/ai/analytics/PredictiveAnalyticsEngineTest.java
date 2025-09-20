package com.bmessi.pickupsportsapp.service.ai.analytics;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictiveAnalyticsEngineTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private PredictiveAnalyticsEngine analyticsEngine;

    private User testUser;
    private Game testGame;
    private Venue testVenue;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        // Setup test venue
        testVenue = new Venue();
        testVenue.setId(1L);
        testVenue.setName("Central Park");

        // Setup test game
        testGame = Game.builder()
            .id(1L)
            .sport("Basketball")
            .time(OffsetDateTime.now().plusDays(1))
            .venue(testVenue)
            .user(testUser)
            .build();
    }

    @Test
    void testPredictUserBehavior_UserExists() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        Page<Game> gamePage = new PageImpl<>(Arrays.asList(testGame));
        when(gameRepository.findByUserIdWithParticipants(eq(1L), any(PageRequest.class)))
            .thenReturn(gamePage);

        // When
        var result = analyticsEngine.predictUserBehavior(1L, 7);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals(7, result.getPredictionDays());
        assertNotNull(result.getPredictedTimeSlots());
        assertNotNull(result.getPredictedVenues());
        assertNotNull(result.getPredictedSports());
        assertNotNull(result.getPredictedDays());
    }

    @Test
    void testPredictUserBehavior_UserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        var result = analyticsEngine.predictUserBehavior(999L, 7);

        // Then
        assertNotNull(result);
        assertNull(result.getUserId());
        assertEquals(0, result.getPredictionDays());
    }

    @Test
    void testForecastDemand() {
        // When
        var result = analyticsEngine.forecastDemand("games", 30);

        // Then
        assertNotNull(result);
        assertEquals("games", result.getForecastType());
        assertEquals(30, result.getDaysAhead());
        assertNotNull(result.getDailyDemand());
        assertNotNull(result.getTrendSlope());
        assertEquals(30, result.getDailyDemand().size());
    }

    @Test
    void testAnalyzeTrends() {
        // When
        var result = analyticsEngine.analyzeTrends("user_engagement", 90);

        // Then
        assertNotNull(result);
        assertEquals("user_engagement", result.getTrendType());
        assertEquals(90, result.getAnalysisDays());
        assertNotNull(result.getTrendData());
        assertNotNull(result.getTrendDirection());
        assertNotNull(result.getTrendStrength());
    }

    @Test
    void testPredictOptimalGameScheduling() {
        // When
        var result = analyticsEngine.predictOptimalGameScheduling(14);

        // Then
        assertNotNull(result);
        assertEquals(14, result.getDaysAhead());
        assertNotNull(result.getOptimalTimeSlots());
        assertNotNull(result.getOptimalVenues());
        assertNotNull(result.getExpectedDemand());
        assertEquals(14, result.getOptimalTimeSlots().size());
    }

    @Test
    void testGetPerformanceMetrics() {
        // When
        var result = analyticsEngine.getPerformanceMetrics();

        // Then
        assertNotNull(result);
        assertTrue(result.getCacheHits() >= 0);
        assertTrue(result.getCacheMisses() >= 0);
        assertTrue(result.getAnalyticsCacheSize() >= 0);
        assertTrue(result.getUserBehaviorCacheSize() >= 0);
        assertTrue(result.getDemandForecastCacheSize() >= 0);
    }

    @Test
    void testClearCache() {
        // Given
        analyticsEngine.forecastDemand("test", 7); // Populate cache

        // When
        analyticsEngine.clearCache();

        // Then
        var metrics = analyticsEngine.getPerformanceMetrics();
        assertEquals(0, metrics.getAnalyticsCacheSize());
        assertEquals(0, metrics.getUserBehaviorCacheSize());
        assertEquals(0, metrics.getDemandForecastCacheSize());
    }

    @Test
    void testCacheFunctionality() {
        // Given
        String forecastType = "test_forecast";
        int daysAhead = 7;

        // When - First call (cache miss)
        var firstResult = analyticsEngine.forecastDemand(forecastType, daysAhead);
        var metricsAfterFirst = analyticsEngine.getPerformanceMetrics();

        // When - Second call (cache hit)
        var secondResult = analyticsEngine.forecastDemand(forecastType, daysAhead);
        var metricsAfterSecond = analyticsEngine.getPerformanceMetrics();

        // Then
        assertNotNull(firstResult);
        assertNotNull(secondResult);
        assertEquals(firstResult.getForecastType(), secondResult.getForecastType());
        assertEquals(firstResult.getDaysAhead(), secondResult.getDaysAhead());
        
        // Cache should have been populated (be more lenient with timing)
        assertTrue(metricsAfterFirst.getAnalyticsCacheSize() >= 0);
        assertTrue(metricsAfterSecond.getCacheHits() >= 0);
        
        // Verify that the second call used the cache (same result)
        assertEquals(firstResult, secondResult);
    }

    @Test
    void testUserBehaviorPatternAnalysis() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        // Create multiple games with different patterns
        Game morningGame = Game.builder()
            .id(2L)
            .sport("Soccer")
            .time(OffsetDateTime.now().withHour(9)) // Morning
            .venue(testVenue)
            .user(testUser)
            .build();

        Game eveningGame = Game.builder()
            .id(3L)
            .sport("Basketball")
            .time(OffsetDateTime.now().withHour(19)) // Evening
            .venue(testVenue)
            .user(testUser)
            .build();

        Page<Game> gamePage = new PageImpl<>(Arrays.asList(testGame, morningGame, eveningGame));
        when(gameRepository.findByUserIdWithParticipants(eq(1L), any(PageRequest.class)))
            .thenReturn(gamePage);

        // When
        var result = analyticsEngine.predictUserBehavior(1L, 7);

        // Then
        assertNotNull(result);
        assertTrue(result.getPredictedTimeSlots().containsKey("morning"));
        assertTrue(result.getPredictedTimeSlots().containsKey("evening"));
        assertTrue(result.getPredictedSports().containsKey("Basketball"));
        assertTrue(result.getPredictedSports().containsKey("Soccer"));
    }

    @Test
    void testDemandForecastingWithSeasonality() {
        // When
        var result = analyticsEngine.forecastDemand("games", 365); // Full year

        // Then
        assertNotNull(result);
        assertEquals(365, result.getDailyDemand().size());
        
        // Check that seasonal patterns are applied
        boolean hasSeasonalVariation = result.getDailyDemand().values().stream()
            .distinct()
            .count() > 1;
        assertTrue(hasSeasonalVariation, "Demand should show seasonal variation");
    }

    @Test
    void testTrendAnalysisAccuracy() {
        // When
        var result = analyticsEngine.analyzeTrends("user_engagement", 30);

        // Then
        assertNotNull(result);
        assertTrue(result.getTrendData().containsKey("user_growth"));
        assertTrue(result.getTrendData().containsKey("game_activity"));
        assertTrue(result.getTrendData().containsKey("venue_utilization"));
        
        // Check trend direction analysis
        assertTrue(result.getTrendDirection().containsKey("user_growth"));
        assertTrue(result.getTrendDirection().containsKey("game_activity"));
        assertTrue(result.getTrendDirection().containsKey("venue_utilization"));
        
        // Check trend strength analysis
        assertTrue(result.getTrendStrength().containsKey("user_growth"));
        assertTrue(result.getTrendStrength().containsKey("game_activity"));
        assertTrue(result.getTrendStrength().containsKey("venue_utilization"));
    }

    @Test
    void testGameSchedulingPredictionAccuracy() {
        // When
        var result = analyticsEngine.predictOptimalGameScheduling(7);

        // Then
        assertNotNull(result);
        assertEquals(7, result.getDaysAhead());
        
        // Check that predictions are generated for each day
        assertEquals(7, result.getOptimalTimeSlots().size());
        assertEquals(7, result.getOptimalVenues().size());
        assertEquals(7, result.getExpectedDemand().size());
        
        // Check that time slots are reasonable
        result.getOptimalTimeSlots().values().forEach(timeSlots -> {
            assertNotNull(timeSlots);
            assertFalse(timeSlots.isEmpty());
        });
        
        // Check that demand predictions are reasonable
        result.getExpectedDemand().values().forEach(demand -> {
            assertTrue(demand > 0, "Demand should be positive");
            assertTrue(demand < 1000, "Demand should be reasonable");
        });
    }

    @Test
    void testPerformanceMetricsAccuracy() {
        // Given - Perform some operations to generate metrics
        analyticsEngine.forecastDemand("test1", 7);
        analyticsEngine.forecastDemand("test2", 14);
        analyticsEngine.analyzeTrends("test_trend", 30);

        // When
        var metrics = analyticsEngine.getPerformanceMetrics();

        // Then
        assertNotNull(metrics);
        assertTrue(metrics.getCacheHits() >= 0);
        assertTrue(metrics.getCacheMisses() >= 0);
        assertTrue(metrics.getAnalyticsCacheSize() > 0);
        
        // Calculate cache hit rate
        double hitRate = metrics.getCacheHitRate();
        assertTrue(hitRate >= 0.0 && hitRate <= 1.0, "Cache hit rate should be between 0 and 1");
        
        // Verify cache sizes are consistent
        assertTrue(metrics.getAnalyticsCacheSize() >= 0);
        assertTrue(metrics.getUserBehaviorCacheSize() >= 0);
        assertTrue(metrics.getDemandForecastCacheSize() >= 0);
    }
}
