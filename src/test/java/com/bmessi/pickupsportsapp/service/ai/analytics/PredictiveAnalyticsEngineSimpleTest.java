package com.bmessi.pickupsportsapp.service.ai.analytics;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PredictiveAnalyticsEngineSimpleTest {

    private PredictiveAnalyticsEngine analyticsEngine = new PredictiveAnalyticsEngine();

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
