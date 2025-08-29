package com.bmessi.pickupsportsapp.controller.system;

import com.bmessi.pickupsportsapp.service.system.AdvancedMonitoringService;
import com.bmessi.pickupsportsapp.service.system.LoadBalancingService;
import com.bmessi.pickupsportsapp.service.system.PerformanceOptimizationEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
@CrossOrigin(origins = "*")
public class SystemIntegrationController {
    
    @Autowired
    private PerformanceOptimizationEngine performanceEngine;
    
    @Autowired
    private LoadBalancingService loadBalancingService;
    
    @Autowired
    private AdvancedMonitoringService monitoringService;
    
    // ===== PERFORMANCE OPTIMIZATION ENDPOINTS =====
    
    /**
     * Get system performance metrics
     */
    @GetMapping("/performance/metrics")
    public ResponseEntity<?> getSystemPerformanceMetrics() {
        try {
            var metrics = performanceEngine.getSystemPerformanceMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Optimize cache configuration
     */
    @PostMapping("/performance/optimize/cache")
    public ResponseEntity<?> optimizeCacheConfiguration() {
        try {
            var result = performanceEngine.optimizeCacheConfiguration();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Optimize connection pool
     */
    @PostMapping("/performance/optimize/connection-pool")
    public ResponseEntity<?> optimizeConnectionPool() {
        try {
            var result = performanceEngine.optimizeConnectionPool();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Optimize query performance
     */
    @PostMapping("/performance/optimize/queries")
    public ResponseEntity<?> optimizeQueryPerformance() {
        try {
            var result = performanceEngine.optimizeQueryPerformance();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Update performance thresholds
     */
    @PutMapping("/performance/thresholds")
    public ResponseEntity<?> updatePerformanceThresholds(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            int maxQueryExecutionTime = (Integer) request.get("maxQueryExecutionTime");
            double minCacheHitRate = (Double) request.get("minCacheHitRate");
            double maxConnectionUtilization = (Double) request.get("maxConnectionUtilization");
            int maxResponseTime = (Integer) request.get("maxResponseTime");
            
            var thresholds = new PerformanceOptimizationEngine.PerformanceThresholds(
                maxQueryExecutionTime, minCacheHitRate, maxConnectionUtilization, maxResponseTime
            );
            
            performanceEngine.updatePerformanceThresholds(thresholds);
            return ResponseEntity.ok(Map.of("message", "Performance thresholds updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record cache performance metrics
     */
    @PostMapping("/performance/record/cache")
    public ResponseEntity<?> recordCachePerformance(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String cacheName = (String) request.get("cacheName");
            boolean hit = (Boolean) request.get("hit");
            long responseTime = ((Number) request.get("responseTime")).longValue();
            
            performanceEngine.recordCachePerformance(cacheName, hit, responseTime);
            return ResponseEntity.ok(Map.of("message", "Cache performance recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record query performance metrics
     */
    @PostMapping("/performance/record/query")
    public ResponseEntity<?> recordQueryPerformance(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String queryName = (String) request.get("queryName");
            long executionTime = ((Number) request.get("executionTime")).longValue();
            boolean success = (Boolean) request.get("success");
            
            performanceEngine.recordQueryPerformance(queryName, executionTime, success);
            return ResponseEntity.ok(Map.of("message", "Query performance recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== LOAD BALANCING ENDPOINTS =====
    
    /**
     * Get load balancing statistics
     */
    @GetMapping("/load-balancing/stats")
    public ResponseEntity<?> getLoadBalancingStats() {
        try {
            var stats = loadBalancingService.getLoadBalancingStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Change load balancing strategy
     */
    @PutMapping("/load-balancing/strategy")
    public ResponseEntity<?> setLoadBalancingStrategy(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String strategyName = (String) request.get("strategy");
            var strategy = LoadBalancingService.LoadBalancingStrategy.valueOf(strategyName.toUpperCase());
            
            loadBalancingService.setLoadBalancingStrategy(strategy);
            return ResponseEntity.ok(Map.of("message", "Load balancing strategy updated to " + strategyName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Update server health status
     */
    @PutMapping("/load-balancing/server/{serverId}/health")
    public ResponseEntity<?> updateServerHealth(
            @PathVariable String serverId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String statusName = (String) request.get("status");
            String details = (String) request.get("details");
            
            var status = LoadBalancingService.ServerHealthStatus.valueOf(statusName.toUpperCase());
            loadBalancingService.updateServerHealth(serverId, status, details);
            
            return ResponseEntity.ok(Map.of("message", "Server health updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record server metrics
     */
    @PostMapping("/load-balancing/server/{serverId}/metrics")
    public ResponseEntity<?> recordServerMetrics(
            @PathVariable String serverId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            long responseTime = ((Number) request.get("responseTime")).longValue();
            boolean success = (Boolean) request.get("success");
            
            loadBalancingService.recordServerMetrics(serverId, responseTime, success);
            return ResponseEntity.ok(Map.of("message", "Server metrics recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Update scaling policy
     */
    @PutMapping("/load-balancing/scaling/policy")
    public ResponseEntity<?> updateScalingPolicy(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            double scaleUpThreshold = (Double) request.get("scaleUpThreshold");
            double scaleDownThreshold = (Double) request.get("scaleDownThreshold");
            int cooldownPeriod = (Integer) request.get("cooldownPeriod");
            
            var policy = new LoadBalancingService.ScalingPolicy(scaleUpThreshold, scaleDownThreshold, cooldownPeriod);
            loadBalancingService.updateScalingPolicy(policy);
            
            return ResponseEntity.ok(Map.of("message", "Scaling policy updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Evaluate auto-scaling
     */
    @PostMapping("/load-balancing/scaling/evaluate")
    public ResponseEntity<?> evaluateScaling() {
        try {
            var decision = loadBalancingService.evaluateScaling();
            return ResponseEntity.ok(decision);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Execute scaling decision
     */
    @PostMapping("/load-balancing/scaling/execute")
    public ResponseEntity<?> executeScaling(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String actionName = (String) request.get("action");
            int currentInstances = (Integer) request.get("currentInstances");
            int recommendedInstances = (Integer) request.get("recommendedInstances");
            double currentLoad = (Double) request.get("currentLoad");
            String reason = (String) request.get("reason");
            
            var decision = new LoadBalancingService.ScalingDecision();
            decision.setAction(LoadBalancingService.ScalingAction.valueOf(actionName.toUpperCase()));
            decision.setCurrentInstances(currentInstances);
            decision.setRecommendedInstances(recommendedInstances);
            decision.setCurrentLoad(currentLoad);
            decision.setReason(reason);
            
            loadBalancingService.executeScaling(decision);
            return ResponseEntity.ok(Map.of("message", "Scaling executed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== MONITORING ENDPOINTS =====
    
    /**
     * Perform system health check
     */
    @PostMapping("/monitoring/health-check")
    public ResponseEntity<?> performSystemHealthCheck() {
        try {
            var report = monitoringService.performSystemHealthCheck();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Collect system metrics
     */
    @GetMapping("/monitoring/metrics")
    public ResponseEntity<?> collectSystemMetrics() {
        try {
            var metrics = monitoringService.collectSystemMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get system status overview
     */
    @GetMapping("/monitoring/status")
    public ResponseEntity<?> getSystemStatusOverview() {
        try {
            var overview = monitoringService.getSystemStatusOverview();
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get historical metrics
     */
    @GetMapping("/monitoring/metrics/{metricName}/history")
    public ResponseEntity<?> getHistoricalMetrics(
            @PathVariable String metricName,
            @RequestParam(defaultValue = "100") int dataPoints) {
        try {
            var metrics = monitoringService.getHistoricalMetrics(metricName, dataPoints);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Check alert rules
     */
    @PostMapping("/monitoring/alerts/check")
    public ResponseEntity<?> checkAlertRules() {
        try {
            var alerts = monitoringService.checkAlertRules();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Clear resolved alerts
     */
    @PostMapping("/monitoring/alerts/clear-resolved")
    public ResponseEntity<?> clearResolvedAlerts() {
        try {
            monitoringService.clearResolvedAlerts();
            return ResponseEntity.ok(Map.of("message", "Resolved alerts cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== COMPREHENSIVE SYSTEM ENDPOINTS =====
    
    /**
     * Get comprehensive system dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getSystemDashboard() {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Performance metrics
            dashboard.put("performance", performanceEngine.getSystemPerformanceMetrics());
            
            // Load balancing stats
            dashboard.put("loadBalancing", loadBalancingService.getLoadBalancingStats());
            
            // System status
            dashboard.put("monitoring", monitoringService.getSystemStatusOverview());
            
            // Performance optimization recommendations
            dashboard.put("cacheOptimization", performanceEngine.optimizeCacheConfiguration());
            dashboard.put("connectionOptimization", performanceEngine.optimizeConnectionPool());
            dashboard.put("queryOptimization", performanceEngine.optimizeQueryPerformance());
            
            // Auto-scaling evaluation
            dashboard.put("scalingEvaluation", loadBalancingService.evaluateScaling());
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get system health summary
     */
    @GetMapping("/health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            Map<String, Object> health = new HashMap<>();
            
            // Performance health
            var performanceMetrics = performanceEngine.getSystemPerformanceMetrics();
            health.put("performance", Map.of(
                "status", performanceMetrics.getCacheHitRate() > 0.8 ? "healthy" : "degraded",
                "cacheHitRate", performanceMetrics.getCacheHitRate(),
                "connectionUtilization", performanceMetrics.getConnectionUtilization()
            ));
            
            // Load balancing health
            var loadBalancingStats = loadBalancingService.getLoadBalancingStats();
            health.put("loadBalancing", Map.of(
                "status", loadBalancingStats.getHealthyServers() > 0 ? "healthy" : "unhealthy",
                "healthyServers", loadBalancingStats.getHealthyServers(),
                "overallSuccessRate", loadBalancingStats.getOverallSuccessRate()
            ));
            
            // Monitoring health
            var systemStatus = monitoringService.getSystemStatusOverview();
            health.put("monitoring", Map.of(
                "status", systemStatus.getSystemStatus().name().toLowerCase(),
                "lastHealthCheck", systemStatus.getLastHealthCheck(),
                "activeAlerts", systemStatus.getAlertSummary().values().stream().mapToInt(Integer::intValue).sum()
            ));
            
            // Overall system status
            health.put("system", Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "version", "5B.1.0"
            ));
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Optimize entire system
     */
    @PostMapping("/optimize")
    public ResponseEntity<?> optimizeEntireSystem() {
        try {
            Map<String, Object> optimizationResults = new HashMap<>();
            
            // Performance optimization
            optimizationResults.put("cache", performanceEngine.optimizeCacheConfiguration());
            optimizationResults.put("connectionPool", performanceEngine.optimizeConnectionPool());
            optimizationResults.put("queries", performanceEngine.optimizeQueryPerformance());
            
            // Load balancing optimization
            var scalingDecision = loadBalancingService.evaluateScaling();
            optimizationResults.put("scaling", scalingDecision);
            
            // Execute scaling if needed
            if (scalingDecision.getAction() != LoadBalancingService.ScalingAction.MAINTAIN) {
                loadBalancingService.executeScaling(scalingDecision);
                optimizationResults.put("scalingExecuted", true);
            } else {
                optimizationResults.put("scalingExecuted", false);
            }
            
            // System health check
            optimizationResults.put("healthCheck", monitoringService.performSystemHealthCheck());
            
            return ResponseEntity.ok(optimizationResults);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
