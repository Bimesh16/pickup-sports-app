package com.bmessi.pickupsportsapp.controller.system;

import com.bmessi.pickupsportsapp.service.system.AdvancedMonitoringService;
import com.bmessi.pickupsportsapp.service.system.LoadBalancingService;
import com.bmessi.pickupsportsapp.service.system.PerformanceOptimizationEngine;
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

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemIntegrationControllerTest {

    @Mock
    private PerformanceOptimizationEngine performanceEngine;

    @Mock
    private LoadBalancingService loadBalancingService;

    @Mock
    private AdvancedMonitoringService monitoringService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private SystemIntegrationController controller;

    @BeforeEach
    void setUp() {
        lenient().when(authentication.getName()).thenReturn("testuser");
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
    }

    // ===== PERFORMANCE OPTIMIZATION TESTS =====

    @Test
    void testGetSystemPerformanceMetrics_Success() {
        // Arrange
        var metrics = new PerformanceOptimizationEngine.SystemPerformanceMetrics(
            1000L, 800L, 200L, 50L, 25, 100, 20, 0.8, 0.25, OffsetDateTime.now()
        );
        when(performanceEngine.getSystemPerformanceMetrics()).thenReturn(metrics);

        // Act
        ResponseEntity<?> response = controller.getSystemPerformanceMetrics();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(performanceEngine).getSystemPerformanceMetrics();
    }

    @Test
    void testGetSystemPerformanceMetrics_Error() {
        // Arrange
        when(performanceEngine.getSystemPerformanceMetrics()).thenThrow(new RuntimeException("Service error"));

        // Act
        ResponseEntity<?> response = controller.getSystemPerformanceMetrics();

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> errorBody = (Map<?, ?>) response.getBody();
        assertEquals("Service error", errorBody.get("error"));
    }

    @Test
    void testOptimizeCacheConfiguration_Success() {
        // Arrange
        var result = new PerformanceOptimizationEngine.CacheOptimizationResult();
        when(performanceEngine.optimizeCacheConfiguration()).thenReturn(result);

        // Act
        ResponseEntity<?> response = controller.optimizeCacheConfiguration();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(performanceEngine).optimizeCacheConfiguration();
    }

    @Test
    void testUpdatePerformanceThresholds_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("maxQueryExecutionTime", 1000);
        request.put("minCacheHitRate", 0.8);
        request.put("maxConnectionUtilization", 0.9);
        request.put("maxResponseTime", 500);

        // Act
        ResponseEntity<?> response = controller.updatePerformanceThresholds(request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Performance thresholds updated successfully", successBody.get("message"));
        verify(performanceEngine).updatePerformanceThresholds(any(PerformanceOptimizationEngine.PerformanceThresholds.class));
    }

    @Test
    void testRecordCachePerformance_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("cacheName", "userCache");
        request.put("hit", true);
        request.put("responseTime", 50L);

        // Act
        ResponseEntity<?> response = controller.recordCachePerformance(request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Cache performance recorded successfully", successBody.get("message"));
        verify(performanceEngine).recordCachePerformance("userCache", true, 50L);
    }

    @Test
    void testRecordQueryPerformance_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("queryName", "findUserById");
        request.put("executionTime", 150L);
        request.put("success", true);

        // Act
        ResponseEntity<?> response = controller.recordQueryPerformance(request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Query performance recorded successfully", successBody.get("message"));
        verify(performanceEngine).recordQueryPerformance("findUserById", 150L, true);
    }

    // ===== LOAD BALANCING TESTS =====

    @Test
    void testGetLoadBalancingStats_Success() {
        // Arrange
        var stats = new LoadBalancingService.LoadBalancingStats(
            LoadBalancingService.LoadBalancingStrategy.ROUND_ROBIN,
            new HashMap<>(),
            1000, 950, 50, 3, 3, OffsetDateTime.now()
        );
        when(loadBalancingService.getLoadBalancingStats()).thenReturn(stats);

        // Act
        ResponseEntity<?> response = controller.getLoadBalancingStats();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(loadBalancingService).getLoadBalancingStats();
    }

    @Test
    void testSetLoadBalancingStrategy_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("strategy", "round_robin");

        // Act
        ResponseEntity<?> response = controller.setLoadBalancingStrategy(request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Load balancing strategy updated to round_robin", successBody.get("message"));
        verify(loadBalancingService).setLoadBalancingStrategy(LoadBalancingService.LoadBalancingStrategy.ROUND_ROBIN);
    }

    @Test
    void testUpdateServerHealth_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("status", "healthy");
        request.put("details", "Server responding normally");

        // Act
        ResponseEntity<?> response = controller.updateServerHealth("server1", request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Server health updated successfully", successBody.get("message"));
        verify(loadBalancingService).updateServerHealth("server1", LoadBalancingService.ServerHealthStatus.HEALTHY, "Server responding normally");
    }

    @Test
    void testRecordServerMetrics_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("responseTime", 200L);
        request.put("success", true);

        // Act
        ResponseEntity<?> response = controller.recordServerMetrics("server1", request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Server metrics recorded successfully", successBody.get("message"));
        verify(loadBalancingService).recordServerMetrics("server1", 200L, true);
    }

    @Test
    void testUpdateScalingPolicy_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("scaleUpThreshold", 0.8);
        request.put("scaleDownThreshold", 0.3);
        request.put("cooldownPeriod", 300);

        // Act
        ResponseEntity<?> response = controller.updateScalingPolicy(request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Scaling policy updated successfully", successBody.get("message"));
        verify(loadBalancingService).updateScalingPolicy(any(LoadBalancingService.ScalingPolicy.class));
    }

    @Test
    void testEvaluateScaling_Success() {
        // Arrange
        var decision = new LoadBalancingService.ScalingDecision();
        when(loadBalancingService.evaluateScaling()).thenReturn(decision);

        // Act
        ResponseEntity<?> response = controller.evaluateScaling();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(loadBalancingService).evaluateScaling();
    }

    @Test
    void testExecuteScaling_Success() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("action", "scale_up");
        request.put("currentInstances", 2);
        request.put("recommendedInstances", 4);
        request.put("currentLoad", 0.85);
        request.put("reason", "High traffic detected");

        // Act
        ResponseEntity<?> response = controller.executeScaling(request, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Scaling executed successfully", successBody.get("message"));
        verify(loadBalancingService).executeScaling(any(LoadBalancingService.ScalingDecision.class));
    }

    // ===== MONITORING TESTS =====

    @Test
    void testPerformSystemHealthCheck_Success() {
        // Arrange
        var report = new AdvancedMonitoringService.SystemHealthReport();
        when(monitoringService.performSystemHealthCheck()).thenReturn(report);

        // Act
        ResponseEntity<?> response = controller.performSystemHealthCheck();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(monitoringService).performSystemHealthCheck();
    }

    @Test
    void testCollectSystemMetrics_Success() {
        // Arrange
        var metrics = new AdvancedMonitoringService.SystemMetrics();
        when(monitoringService.collectSystemMetrics()).thenReturn(metrics);

        // Act
        ResponseEntity<?> response = controller.collectSystemMetrics();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(monitoringService).collectSystemMetrics();
    }

    @Test
    void testGetSystemStatusOverview_Success() {
        // Arrange
        var overview = new AdvancedMonitoringService.SystemStatusOverview();
        when(monitoringService.getSystemStatusOverview()).thenReturn(overview);

        // Act
        ResponseEntity<?> response = controller.getSystemStatusOverview();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(monitoringService).getSystemStatusOverview();
    }

    @Test
    void testGetHistoricalMetrics_Success() {
        // Arrange
        var metrics = new ArrayList<AdvancedMonitoringService.MetricDataPoint>();
        when(monitoringService.getHistoricalMetrics("cpu_usage", 50)).thenReturn(metrics);

        // Act
        ResponseEntity<?> response = controller.getHistoricalMetrics("cpu_usage", 50);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(monitoringService).getHistoricalMetrics("cpu_usage", 50);
    }

    @Test
    void testCheckAlertRules_Success() {
        // Arrange
        var alerts = new ArrayList<AdvancedMonitoringService.Alert>();
        when(monitoringService.checkAlertRules()).thenReturn(alerts);

        // Act
        ResponseEntity<?> response = controller.checkAlertRules();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(monitoringService).checkAlertRules();
    }

    @Test
    void testClearResolvedAlerts_Success() {
        // Act
        ResponseEntity<?> response = controller.clearResolvedAlerts();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> successBody = (Map<?, ?>) response.getBody();
        assertEquals("Resolved alerts cleared successfully", successBody.get("message"));
        verify(monitoringService).clearResolvedAlerts();
    }

    // ===== COMPREHENSIVE SYSTEM TESTS =====

    @Test
    void testGetSystemDashboard_Success() {
        // Arrange
        var performanceMetrics = new PerformanceOptimizationEngine.SystemPerformanceMetrics(
            1000L, 800L, 200L, 50L, 25, 100, 20, 0.8, 0.25, OffsetDateTime.now()
        );
        var loadBalancingStats = new LoadBalancingService.LoadBalancingStats(
            LoadBalancingService.LoadBalancingStrategy.ROUND_ROBIN,
            new HashMap<>(),
            1000, 950, 50, 3, 3, OffsetDateTime.now()
        );
        var systemStatus = new AdvancedMonitoringService.SystemStatusOverview();
        var cacheOptimization = new PerformanceOptimizationEngine.CacheOptimizationResult();
        var connectionOptimization = new PerformanceOptimizationEngine.ConnectionPoolOptimizationResult();
        var queryOptimization = new PerformanceOptimizationEngine.QueryOptimizationResult();
        var scalingDecision = new LoadBalancingService.ScalingDecision();

        when(performanceEngine.getSystemPerformanceMetrics()).thenReturn(performanceMetrics);
        when(loadBalancingService.getLoadBalancingStats()).thenReturn(loadBalancingStats);
        when(monitoringService.getSystemStatusOverview()).thenReturn(systemStatus);
        when(performanceEngine.optimizeCacheConfiguration()).thenReturn(cacheOptimization);
        when(performanceEngine.optimizeConnectionPool()).thenReturn(connectionOptimization);
        when(performanceEngine.optimizeQueryPerformance()).thenReturn(queryOptimization);
        when(loadBalancingService.evaluateScaling()).thenReturn(scalingDecision);

        // Act
        ResponseEntity<?> response = controller.getSystemDashboard();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        Map<?, ?> dashboard = (Map<?, ?>) response.getBody();
        assertNotNull(dashboard.get("performance"));
        assertNotNull(dashboard.get("loadBalancing"));
        assertNotNull(dashboard.get("monitoring"));
        assertNotNull(dashboard.get("cacheOptimization"));
        assertNotNull(dashboard.get("connectionOptimization"));
        assertNotNull(dashboard.get("queryOptimization"));
        assertNotNull(dashboard.get("scalingEvaluation"));
    }

    @Test
    void testGetSystemHealth_Success() {
        // Arrange
        var performanceMetrics = new PerformanceOptimizationEngine.SystemPerformanceMetrics(
            1000L, 850L, 150L, 30L, 25, 100, 20, 0.85, 0.7, OffsetDateTime.now()
        );
        var loadBalancingStats = new LoadBalancingService.LoadBalancingStats(
            LoadBalancingService.LoadBalancingStrategy.ROUND_ROBIN,
            new HashMap<>(),
            1000, 950, 50, 3, 3, OffsetDateTime.now()
        );
        var systemStatus = new AdvancedMonitoringService.SystemStatusOverview();
        
        // Set up system status
        
        // Set up system status
        systemStatus.setSystemStatus(AdvancedMonitoringService.SystemStatus.HEALTHY);
        systemStatus.setLastHealthCheck(OffsetDateTime.now());
        systemStatus.setAlertSummary(new HashMap<>());

        when(performanceEngine.getSystemPerformanceMetrics()).thenReturn(performanceMetrics);
        when(loadBalancingService.getLoadBalancingStats()).thenReturn(loadBalancingStats);
        when(monitoringService.getSystemStatusOverview()).thenReturn(systemStatus);

        // Act
        ResponseEntity<?> response = controller.getSystemHealth();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        Map<?, ?> health = (Map<?, ?>) response.getBody();
        assertNotNull(health.get("performance"));
        assertNotNull(health.get("loadBalancing"));
        assertNotNull(health.get("monitoring"));
        assertNotNull(health.get("system"));
        
        Map<?, ?> system = (Map<?, ?>) health.get("system");
        assertEquals("healthy", system.get("status"));
        assertEquals("5B.1.0", system.get("version"));
    }

    @Test
    void testOptimizeEntireSystem_Success() {
        // Arrange
        var cacheOptimization = new PerformanceOptimizationEngine.CacheOptimizationResult();
        var connectionOptimization = new PerformanceOptimizationEngine.ConnectionPoolOptimizationResult();
        var queryOptimization = new PerformanceOptimizationEngine.QueryOptimizationResult();
        var scalingDecision = new LoadBalancingService.ScalingDecision();
        var healthReport = new AdvancedMonitoringService.SystemHealthReport();
        
        scalingDecision.setAction(LoadBalancingService.ScalingAction.MAINTAIN);

        when(performanceEngine.optimizeCacheConfiguration()).thenReturn(cacheOptimization);
        when(performanceEngine.optimizeConnectionPool()).thenReturn(connectionOptimization);
        when(performanceEngine.optimizeQueryPerformance()).thenReturn(queryOptimization);
        when(loadBalancingService.evaluateScaling()).thenReturn(scalingDecision);
        when(monitoringService.performSystemHealthCheck()).thenReturn(healthReport);

        // Act
        ResponseEntity<?> response = controller.optimizeEntireSystem();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        Map<?, ?> results = (Map<?, ?>) response.getBody();
        assertNotNull(results.get("cache"));
        assertNotNull(results.get("connectionPool"));
        assertNotNull(results.get("queries"));
        assertNotNull(results.get("scaling"));
        assertNotNull(results.get("healthCheck"));
        assertEquals(false, results.get("scalingExecuted"));
        
        verify(performanceEngine).optimizeCacheConfiguration();
        verify(performanceEngine).optimizeConnectionPool();
        verify(performanceEngine).optimizeQueryPerformance();
        verify(loadBalancingService).evaluateScaling();
        verify(monitoringService).performSystemHealthCheck();
    }

    @Test
    void testOptimizeEntireSystem_WithScalingExecution() {
        // Arrange
        var cacheOptimization = new PerformanceOptimizationEngine.CacheOptimizationResult();
        var connectionOptimization = new PerformanceOptimizationEngine.ConnectionPoolOptimizationResult();
        var queryOptimization = new PerformanceOptimizationEngine.QueryOptimizationResult();
        var scalingDecision = new LoadBalancingService.ScalingDecision();
        var healthReport = new AdvancedMonitoringService.SystemHealthReport();
        
        scalingDecision.setAction(LoadBalancingService.ScalingAction.SCALE_UP);

        when(performanceEngine.optimizeCacheConfiguration()).thenReturn(cacheOptimization);
        when(performanceEngine.optimizeConnectionPool()).thenReturn(connectionOptimization);
        when(performanceEngine.optimizeQueryPerformance()).thenReturn(queryOptimization);
        when(loadBalancingService.evaluateScaling()).thenReturn(scalingDecision);
        when(monitoringService.performSystemHealthCheck()).thenReturn(healthReport);

        // Act
        ResponseEntity<?> response = controller.optimizeEntireSystem();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        Map<?, ?> results = (Map<?, ?>) response.getBody();
        assertEquals(true, results.get("scalingExecuted"));
        
        verify(loadBalancingService).executeScaling(scalingDecision);
    }

    // ===== ERROR HANDLING TESTS =====

    @Test
    void testUpdatePerformanceThresholds_InvalidRequest() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("maxQueryExecutionTime", "invalid");

        // Act
        ResponseEntity<?> response = controller.updatePerformanceThresholds(request, authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> errorBody = (Map<?, ?>) response.getBody();
        assertNotNull(errorBody.get("error"));
    }

    @Test
    void testSetLoadBalancingStrategy_InvalidStrategy() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("strategy", "invalid_strategy");

        // Act
        ResponseEntity<?> response = controller.setLoadBalancingStrategy(request, authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> errorBody = (Map<?, ?>) response.getBody();
        assertNotNull(errorBody.get("error"));
    }

    @Test
    void testUpdateServerHealth_InvalidStatus() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("status", "invalid_status");
        request.put("details", "test");

        // Act
        ResponseEntity<?> response = controller.updateServerHealth("server1", request, authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> errorBody = (Map<?, ?>) response.getBody();
        assertNotNull(errorBody.get("error"));
    }

    @Test
    void testExecuteScaling_InvalidAction() {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("action", "invalid_action");
        request.put("currentInstances", 2);
        request.put("recommendedInstances", 4);
        request.put("currentLoad", 0.85);
        request.put("reason", "test");

        // Act
        ResponseEntity<?> response = controller.executeScaling(request, authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> errorBody = (Map<?, ?>) response.getBody();
        assertNotNull(errorBody.get("error"));
    }
}
