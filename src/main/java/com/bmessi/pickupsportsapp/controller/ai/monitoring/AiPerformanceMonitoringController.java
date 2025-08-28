package com.bmessi.pickupsportsapp.controller.ai.monitoring;

import com.bmessi.pickupsportsapp.service.ai.monitoring.AiPerformanceMonitoringService;
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
import java.util.HashMap;

/**
 * AI Performance Monitoring Controller for real-time metrics and analytics.
 * 
 * Features:
 * - Real-time performance dashboard
 * - System health monitoring
 * - Algorithm performance comparison
 * - A/B testing analytics
 * - Performance reports and recommendations
 * - System alerts and notifications
 * 
 * Best Practices:
 * - Comprehensive API documentation
 * - Real-time data access
 * - Performance impact minimization
 * - Secure access control
 * - Comprehensive error handling
 */
@RestController
@RequestMapping("/api/v1/ai/monitoring")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Performance Monitoring", description = "Real-time performance metrics and analytics for AI recommendation system")
public class AiPerformanceMonitoringController {

    private final AiPerformanceMonitoringService monitoringService;

    /**
     * Get comprehensive performance dashboard with real-time metrics.
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get performance dashboard", 
               description = "Get comprehensive real-time performance dashboard with all metrics and analytics")
    public ResponseEntity<Map<String, Object>> getPerformanceDashboard() {
        try {
            log.info("Retrieving AI performance dashboard");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            
            log.info("Successfully retrieved performance dashboard");
            return ResponseEntity.ok(dashboard);
            
        } catch (Exception e) {
            log.error("Failed to retrieve performance dashboard", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve dashboard", "message", e.getMessage()));
        }
    }

    /**
     * Get system health status and alerts.
     */
    @GetMapping("/health")
    @Operation(summary = "Get system health status", 
               description = "Get current system health status, alerts, and performance indicators")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            log.info("Retrieving AI system health status");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> health = (Map<String, Object>) dashboard.get("system_health");
            
            log.info("Successfully retrieved system health status");
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            log.error("Failed to retrieve system health status", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve health status", "message", e.getMessage()));
        }
    }

    /**
     * Get algorithm performance metrics and comparison.
     */
    @GetMapping("/algorithms/performance")
    @Operation(summary = "Get algorithm performance metrics", 
               description = "Get detailed performance metrics for all AI algorithms")
    public ResponseEntity<Map<String, Object>> getAlgorithmPerformance() {
        try {
            log.info("Retrieving algorithm performance metrics");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> performance = (Map<String, Object>) dashboard.get("algorithm_performance");
            
            log.info("Successfully retrieved algorithm performance metrics");
            return ResponseEntity.ok(performance);
            
        } catch (Exception e) {
            log.error("Failed to retrieve algorithm performance metrics", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve algorithm performance", "message", e.getMessage()));
        }
    }

    /**
     * Get user interaction analytics and engagement metrics.
     */
    @GetMapping("/users/analytics")
    @Operation(summary = "Get user interaction analytics", 
               description = "Get user engagement metrics, interaction patterns, and top performing users")
    public ResponseEntity<Map<String, Object>> getUserAnalytics() {
        try {
            log.info("Retrieving user interaction analytics");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> analytics = (Map<String, Object>) dashboard.get("user_analytics");
            
            log.info("Successfully retrieved user analytics");
            return ResponseEntity.ok(analytics);
            
        } catch (Exception e) {
            log.error("Failed to retrieve user analytics", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve user analytics", "message", e.getMessage()));
        }
    }

    /**
     * Get A/B testing results and algorithm comparison data.
     */
    @GetMapping("/ab-testing/results")
    @Operation(summary = "Get A/B testing results", 
               description = "Get comprehensive A/B testing results, algorithm comparisons, and winning algorithms")
    public ResponseEntity<Map<String, Object>> getAbTestingResults() {
        try {
            log.info("Retrieving A/B testing results");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> results = (Map<String, Object>) dashboard.get("ab_testing_results");
            
            log.info("Successfully retrieved A/B testing results");
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            log.error("Failed to retrieve A/B testing results", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve A/B testing results", "message", e.getMessage()));
        }
    }

    /**
     * Get performance trends and historical data.
     */
    @GetMapping("/trends")
    @Operation(summary = "Get performance trends", 
               description = "Get performance trends over time including response time, success rate, and user engagement")
    public ResponseEntity<Map<String, Object>> getPerformanceTrends() {
        try {
            log.info("Retrieving performance trends");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> trends = (Map<String, Object>) dashboard.get("performance_trends");
            
            log.info("Successfully retrieved performance trends");
            return ResponseEntity.ok(trends);
            
        } catch (Exception e) {
            log.error("Failed to retrieve performance trends", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve performance trends", "message", e.getMessage()));
        }
    }

    /**
     * Get real-time system metrics and current performance data.
     */
    @GetMapping("/metrics/realtime")
    @Operation(summary = "Get real-time metrics", 
               description = "Get current real-time metrics including system load, cache hit rate, and memory usage")
    public ResponseEntity<Map<String, Object>> getRealTimeMetrics() {
        try {
            log.info("Retrieving real-time metrics");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> metrics = (Map<String, Object>) dashboard.get("real_time_metrics");
            
            log.info("Successfully retrieved real-time metrics");
            return ResponseEntity.ok(metrics);
            
        } catch (Exception e) {
            log.error("Failed to retrieve real-time metrics", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve real-time metrics", "message", e.getMessage()));
        }
    }

    /**
     * Generate comprehensive performance report with recommendations.
     */
    @GetMapping("/reports/performance")
    @Operation(summary = "Generate performance report", 
               description = "Generate comprehensive performance report with analysis and recommendations")
    public ResponseEntity<Map<String, Object>> generatePerformanceReport() {
        try {
            log.info("Generating comprehensive performance report");
            
            Map<String, Object> report = monitoringService.generatePerformanceReport();
            
            log.info("Successfully generated performance report");
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            log.error("Failed to generate performance report", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to generate performance report", "message", e.getMessage()));
        }
    }

    /**
     * Record algorithm performance comparison for A/B testing.
     */
    @PostMapping("/ab-testing/record")
    @Operation(summary = "Record A/B test result", 
               description = "Record algorithm performance comparison result for A/B testing analytics")
    public ResponseEntity<Map<String, Object>> recordAbTestResult(
            @Parameter(description = "Algorithm A name") 
            @RequestParam String algorithmA,
            @Parameter(description = "Algorithm B name") 
            @RequestParam String algorithmB,
            @Parameter(description = "Performance score for algorithm A") 
            @RequestParam double performanceA,
            @Parameter(description = "Performance score for algorithm B") 
            @RequestParam double performanceB,
            @Parameter(description = "Winning algorithm") 
            @RequestParam String winner,
            @Parameter(description = "Test identifier") 
            @RequestParam String testId,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Recording A/B test result from user: {} - Test: {}, Winner: {}", username, testId, winner);
            
            monitoringService.recordAlgorithmComparison(algorithmA, algorithmB, performanceA, performanceB, winner, testId);
            
            log.info("Successfully recorded A/B test result for user: {}", username);
            return ResponseEntity.ok(Map.of(
                "message", "A/B test result recorded successfully",
                "test_id", testId,
                "winner", winner,
                "recorded_by", username
            ));
            
        } catch (Exception e) {
            log.error("Failed to record A/B test result", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to record A/B test result", "message", e.getMessage()));
        }
    }

    /**
     * Record recommendation request performance metrics.
     */
    @PostMapping("/metrics/record")
    @Operation(summary = "Record performance metrics", 
               description = "Record performance metrics for a recommendation request")
    public ResponseEntity<Map<String, Object>> recordPerformanceMetrics(
            @Parameter(description = "Algorithm used") 
            @RequestParam String algorithm,
            @Parameter(description = "User ID") 
            @RequestParam String userId,
            @Parameter(description = "Response time in milliseconds") 
            @RequestParam long responseTimeMs,
            @Parameter(description = "Request success status") 
            @RequestParam boolean success,
            @Parameter(description = "Confidence score") 
            @RequestParam double confidenceScore,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.debug("Recording performance metrics from user: {} - Algorithm: {}, ResponseTime: {}ms, Success: {}", 
                    username, algorithm, responseTimeMs, success);
            
            monitoringService.recordRecommendationRequest(algorithm, userId, responseTimeMs, success, confidenceScore);
            
            log.debug("Successfully recorded performance metrics for user: {}", username);
            return ResponseEntity.ok(Map.of(
                "message", "Performance metrics recorded successfully",
                "algorithm", algorithm,
                "response_time_ms", responseTimeMs,
                "success", success,
                "recorded_by", username
            ));
            
        } catch (Exception e) {
            log.error("Failed to record performance metrics", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to record performance metrics", "message", e.getMessage()));
        }
    }

    /**
     * Get system overview and key performance indicators.
     */
    @GetMapping("/overview")
    @Operation(summary = "Get system overview", 
               description = "Get system overview with key performance indicators and summary metrics")
    public ResponseEntity<Map<String, Object>> getSystemOverview() {
        try {
            log.info("Retrieving system overview");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> overview = (Map<String, Object>) dashboard.get("system_overview");
            
            log.info("Successfully retrieved system overview");
            return ResponseEntity.ok(overview);
            
        } catch (Exception e) {
            log.error("Failed to retrieve system overview", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve system overview", "message", e.getMessage()));
        }
    }

    /**
     * Get top performing algorithms and their metrics.
     */
    @GetMapping("/algorithms/top")
    @Operation(summary = "Get top performing algorithms", 
               description = "Get top performing algorithms ranked by performance score")
    public ResponseEntity<Map<String, Object>> getTopAlgorithms() {
        try {
            log.info("Retrieving top performing algorithms");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> performance = (Map<String, Object>) dashboard.get("algorithm_performance");
            
            // Sort algorithms by performance score
            List<Map<String, Object>> topAlgorithms = performance.entrySet().stream()
                .sorted((a, b) -> {
                    Map<String, Object> metricsA = (Map<String, Object>) a.getValue();
                    Map<String, Object> metricsB = (Map<String, Object>) b.getValue();
                    double scoreA = (Double) metricsA.get("performance_score");
                    double scoreB = (Double) metricsB.get("performance_score");
                    return Double.compare(scoreB, scoreA);
                })
                .limit(5)
                .map(entry -> {
                    Map<String, Object> algo = new HashMap<>();
                    algo.put("algorithm", entry.getKey());
                    algo.putAll((Map<String, Object>) entry.getValue());
                    return algo;
                })
                .toList();
            
            Map<String, Object> result = Map.of(
                "top_algorithms", topAlgorithms,
                "total_algorithms", performance.size(),
                "last_updated", dashboard.get("last_updated")
            );
            
            log.info("Successfully retrieved top performing algorithms");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to retrieve top performing algorithms", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve top algorithms", "message", e.getMessage()));
        }
    }

    /**
     * Get system alerts and active notifications.
     */
    @GetMapping("/alerts")
    @Operation(summary = "Get system alerts", 
               description = "Get active system alerts and performance notifications")
    public ResponseEntity<Map<String, Object>> getSystemAlerts() {
        try {
            log.info("Retrieving system alerts");
            
            Map<String, Object> dashboard = monitoringService.getPerformanceDashboard();
            Map<String, Object> health = (Map<String, Object>) dashboard.get("system_health");
            
            Map<String, Object> alerts = Map.of(
                "active_alerts", health.get("alerts"),
                "overall_status", health.get("overall_status"),
                "health_score", health.get("health_score"),
                "last_check", health.get("last_check")
            );
            
            log.info("Successfully retrieved system alerts");
            return ResponseEntity.ok(alerts);
            
        } catch (Exception e) {
            log.error("Failed to retrieve system alerts", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve system alerts", "message", e.getMessage()));
        }
    }

    /**
     * Get performance recommendations and optimization suggestions.
     */
    @GetMapping("/recommendations")
    @Operation(summary = "Get performance recommendations", 
               description = "Get performance optimization recommendations and suggestions")
    public ResponseEntity<Map<String, Object>> getPerformanceRecommendations() {
        try {
            log.info("Retrieving performance recommendations");
            
            Map<String, Object> report = monitoringService.generatePerformanceReport();
            List<String> recommendations = (List<String>) report.get("recommendations");
            
            Map<String, Object> result = Map.of(
                "recommendations", recommendations,
                "total_recommendations", recommendations.size(),
                "generated_at", report.get("report_generated")
            );
            
            log.info("Successfully retrieved performance recommendations");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to retrieve performance recommendations", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve recommendations", "message", e.getMessage()));
        }
    }

    /**
     * Get monitoring service configuration and settings.
     */
    @GetMapping("/config")
    @Operation(summary = "Get monitoring configuration", 
               description = "Get monitoring service configuration, settings, and version information")
    public ResponseEntity<Map<String, Object>> getMonitoringConfiguration() {
        try {
            log.info("Retrieving monitoring configuration");
            
            Map<String, Object> config = Map.of(
                "service_name", "AI Performance Monitoring Service",
                "version", "v1.0",
                "metrics_retention_hours", 24,
                "performance_threshold", 0.8,
                "alert_interval_ms", 300000,
                "features", List.of(
                    "Real-time metrics collection",
                    "Algorithm performance comparison",
                    "System health monitoring",
                    "A/B testing analytics",
                    "Performance trend analysis",
                    "Alert generation"
                ),
                "last_updated", System.currentTimeMillis()
            );
            
            log.info("Successfully retrieved monitoring configuration");
            return ResponseEntity.ok(config);
            
        } catch (Exception e) {
            log.error("Failed to retrieve monitoring configuration", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve configuration", "message", e.getMessage()));
        }
    }
}
