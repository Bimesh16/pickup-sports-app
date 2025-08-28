package com.bmessi.pickupsportsapp.controller.ai.monitoring;

import com.bmessi.pickupsportsapp.service.ai.monitoring.AiPerformanceMonitoringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test suite for AI Performance Monitoring Controller.
 * 
 * Tests all endpoints for:
 * - Successful responses
 * - Error handling
 * - Authentication integration
 * - Data transformation
 * - Service integration
 */
@ExtendWith(MockitoExtension.class)
class AiPerformanceMonitoringControllerTest {

    @Mock
    private AiPerformanceMonitoringService monitoringService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AiPerformanceMonitoringController controller;

    private Map<String, Object> mockDashboard;
    private Map<String, Object> mockReport;

    @BeforeEach
    void setUp() {
        // Setup mock dashboard data
        mockDashboard = new HashMap<>();
        mockDashboard.put("last_updated", System.currentTimeMillis());
        
        // System health
        Map<String, Object> health = new HashMap<>();
        health.put("overall_status", "HEALTHY");
        health.put("health_score", 0.95);
        health.put("alerts", List.of("High memory usage detected"));
        health.put("last_check", System.currentTimeMillis());
        mockDashboard.put("system_health", health);
        
        // Algorithm performance
        Map<String, Object> performance = new HashMap<>();
        Map<String, Object> algo1 = new HashMap<>();
        algo1.put("performance_score", 0.92);
        algo1.put("response_time_avg", 150.0);
        algo1.put("success_rate", 0.98);
        performance.put("collaborative_filtering", algo1);
        
        Map<String, Object> algo2 = new HashMap<>();
        algo2.put("performance_score", 0.88);
        algo2.put("response_time_avg", 200.0);
        algo2.put("success_rate", 0.95);
        performance.put("content_based", algo2);
        mockDashboard.put("algorithm_performance", performance);
        
        // User analytics
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total_users", 1500);
        analytics.put("active_users", 1200);
        analytics.put("engagement_rate", 0.85);
        mockDashboard.put("user_analytics", analytics);
        
        // A/B testing results
        Map<String, Object> abResults = new HashMap<>();
        abResults.put("total_tests", 25);
        abResults.put("winning_algorithm", "collaborative_filtering");
        abResults.put("confidence_level", 0.95);
        mockDashboard.put("ab_testing_results", abResults);
        
        // Performance trends
        Map<String, Object> trends = new HashMap<>();
        trends.put("response_time_trend", "decreasing");
        trends.put("success_rate_trend", "stable");
        trends.put("user_engagement_trend", "increasing");
        mockDashboard.put("performance_trends", trends);
        
        // Real-time metrics
        Map<String, Object> realtime = new HashMap<>();
        realtime.put("current_load", 0.65);
        realtime.put("cache_hit_rate", 0.88);
        realtime.put("memory_usage", 0.72);
        mockDashboard.put("real_time_metrics", realtime);
        
        // System overview
        Map<String, Object> overview = new HashMap<>();
        overview.put("total_recommendations", 15000);
        overview.put("avg_response_time", 175.0);
        overview.put("overall_success_rate", 0.96);
        mockDashboard.put("system_overview", overview);
        
        // Setup mock report
        mockReport = new HashMap<>();
        mockReport.put("report_generated", System.currentTimeMillis());
        mockReport.put("recommendations", List.of(
            "Optimize collaborative filtering algorithm",
            "Increase cache size for better performance",
            "Monitor memory usage closely"
        ));
        
        // Setup security context
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testGetPerformanceDashboard_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getPerformanceDashboard();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mockDashboard, response.getBody());
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetPerformanceDashboard_Error() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenThrow(new RuntimeException("Service error"));
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getPerformanceDashboard();
        
        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Failed to retrieve dashboard", response.getBody().get("error"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetSystemHealth_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getSystemHealth();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("HEALTHY", response.getBody().get("overall_status"));
        assertEquals(0.95, response.getBody().get("health_score"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetAlgorithmPerformance_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getAlgorithmPerformance();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("collaborative_filtering"));
        assertTrue(response.getBody().containsKey("content_based"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetUserAnalytics_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getUserAnalytics();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1500, response.getBody().get("total_users"));
        assertEquals(0.85, response.getBody().get("engagement_rate"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetAbTestingResults_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getAbTestingResults();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("collaborative_filtering", response.getBody().get("winning_algorithm"));
        assertEquals(25, response.getBody().get("total_tests"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetPerformanceTrends_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getPerformanceTrends();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("decreasing", response.getBody().get("response_time_trend"));
        assertEquals("increasing", response.getBody().get("user_engagement_trend"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetRealTimeMetrics_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getRealTimeMetrics();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0.65, response.getBody().get("current_load"));
        assertEquals(0.88, response.getBody().get("cache_hit_rate"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGeneratePerformanceReport_Success() {
        // Given
        when(monitoringService.generatePerformanceReport()).thenReturn(mockReport);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.generatePerformanceReport();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mockReport, response.getBody());
        verify(monitoringService).generatePerformanceReport();
    }

    @Test
    void testGeneratePerformanceReport_Error() {
        // Given
        when(monitoringService.generatePerformanceReport()).thenThrow(new RuntimeException("Report generation failed"));
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.generatePerformanceReport();
        
        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Failed to generate performance report", response.getBody().get("error"));
        verify(monitoringService).generatePerformanceReport();
    }

    @Test
    void testRecordAbTestResult_Success() {
        // Given
        doNothing().when(monitoringService).recordAlgorithmComparison(
            anyString(), anyString(), anyDouble(), anyDouble(), anyString(), anyString()
        );
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.recordAbTestResult(
            "algo_a", "algo_b", 0.85, 0.78, "algo_a", "test_123", authentication
        );
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("A/B test result recorded successfully", response.getBody().get("message"));
        assertEquals("test_123", response.getBody().get("test_id"));
        assertEquals("algo_a", response.getBody().get("winner"));
        assertEquals("testuser", response.getBody().get("recorded_by"));
        
        verify(monitoringService).recordAlgorithmComparison("algo_a", "algo_b", 0.85, 0.78, "algo_a", "test_123");
    }

    @Test
    void testRecordAbTestResult_Error() {
        // Given
        doThrow(new RuntimeException("Recording failed")).when(monitoringService).recordAlgorithmComparison(
            anyString(), anyString(), anyDouble(), anyDouble(), anyString(), anyString()
        );
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.recordAbTestResult(
            "algo_a", "algo_b", 0.85, 0.78, "algo_a", "test_123", authentication
        );
        
        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Failed to record A/B test result", response.getBody().get("error"));
        verify(monitoringService).recordAlgorithmComparison("algo_a", "algo_b", 0.85, 0.78, "algo_a", "test_123");
    }

    @Test
    void testRecordPerformanceMetrics_Success() {
        // Given
        doNothing().when(monitoringService).recordRecommendationRequest(
            anyString(), anyString(), anyLong(), anyBoolean(), anyDouble()
        );
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.recordPerformanceMetrics(
            "collaborative_filtering", "user123", 150L, true, 0.92, authentication
        );
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Performance metrics recorded successfully", response.getBody().get("message"));
        assertEquals("collaborative_filtering", response.getBody().get("algorithm"));
        assertEquals(150L, response.getBody().get("response_time_ms"));
        assertEquals(true, response.getBody().get("success"));
        assertEquals("testuser", response.getBody().get("recorded_by"));
        
        verify(monitoringService).recordRecommendationRequest("collaborative_filtering", "user123", 150L, true, 0.92);
    }

    @Test
    void testRecordPerformanceMetrics_Error() {
        // Given
        doThrow(new RuntimeException("Metrics recording failed")).when(monitoringService).recordRecommendationRequest(
            anyString(), anyString(), anyLong(), anyBoolean(), anyDouble()
        );
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.recordPerformanceMetrics(
            "collaborative_filtering", "user123", 150L, true, 0.92, authentication
        );
        
        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Failed to record performance metrics", response.getBody().get("error"));
        verify(monitoringService).recordRecommendationRequest("collaborative_filtering", "user123", 150L, true, 0.92);
    }

    @Test
    void testGetSystemOverview_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getSystemOverview();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(15000, response.getBody().get("total_recommendations"));
        assertEquals(175.0, response.getBody().get("avg_response_time"));
        assertEquals(0.96, response.getBody().get("overall_success_rate"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetTopAlgorithms_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getTopAlgorithms();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("top_algorithms"));
        assertTrue(response.getBody().containsKey("total_algorithms"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topAlgorithms = (List<Map<String, Object>>) response.getBody().get("top_algorithms");
        assertNotNull(topAlgorithms);
        assertFalse(topAlgorithms.isEmpty());
        
        // Verify sorting (collaborative_filtering should be first with higher score)
        assertEquals("collaborative_filtering", topAlgorithms.get(0).get("algorithm"));
        assertEquals(0.92, topAlgorithms.get(0).get("performance_score"));
        
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetSystemAlerts_Success() {
        // Given
        when(monitoringService.getPerformanceDashboard()).thenReturn(mockDashboard);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getSystemAlerts();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("HEALTHY", response.getBody().get("overall_status"));
        assertEquals(0.95, response.getBody().get("health_score"));
        assertTrue(response.getBody().containsKey("active_alerts"));
        verify(monitoringService).getPerformanceDashboard();
    }

    @Test
    void testGetPerformanceRecommendations_Success() {
        // Given
        when(monitoringService.generatePerformanceReport()).thenReturn(mockReport);
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getPerformanceRecommendations();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("recommendations"));
        assertEquals(3, response.getBody().get("total_recommendations"));
        verify(monitoringService).generatePerformanceReport();
    }

    @Test
    void testGetPerformanceRecommendations_Error() {
        // Given
        when(monitoringService.generatePerformanceReport()).thenThrow(new RuntimeException("Report generation failed"));
        
        // When
        ResponseEntity<Map<String, Object>> response = controller.getPerformanceRecommendations();
        
        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Failed to retrieve recommendations", response.getBody().get("error"));
        verify(monitoringService).generatePerformanceReport();
    }

    @Test
    void testGetMonitoringConfiguration_Success() {
        // When
        ResponseEntity<Map<String, Object>> response = controller.getMonitoringConfiguration();
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("AI Performance Monitoring Service", response.getBody().get("service_name"));
        assertEquals("v1.0", response.getBody().get("version"));
        assertEquals(24, response.getBody().get("metrics_retention_hours"));
        assertEquals(0.8, response.getBody().get("performance_threshold"));
        assertTrue(response.getBody().containsKey("features"));
    }

    @Test
    void testGetMonitoringConfiguration_Features() {
        // When
        ResponseEntity<Map<String, Object>> response = controller.getMonitoringConfiguration();
        
        // Then
        @SuppressWarnings("unchecked")
        List<String> features = (List<String>) response.getBody().get("features");
        assertNotNull(features);
        assertTrue(features.contains("Real-time metrics collection"));
        assertTrue(features.contains("Algorithm performance comparison"));
        assertTrue(features.contains("System health monitoring"));
        assertTrue(features.contains("A/B testing analytics"));
        assertTrue(features.contains("Performance trend analysis"));
        assertTrue(features.contains("Alert generation"));
    }
}
