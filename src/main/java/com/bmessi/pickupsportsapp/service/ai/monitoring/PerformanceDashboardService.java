package com.bmessi.pickupsportsapp.service.ai.monitoring;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Performance Dashboard Service for building and managing comprehensive dashboard data.
 * 
 * Features:
 * - Real-time dashboard construction
 * - Performance metrics aggregation
 * - System health monitoring
 * - A/B testing analytics
 * - User engagement metrics
 * - Performance trend analysis
 * 
 * Best Practices:
 * - Clean separation of concerns
 * - Efficient data aggregation
 * - Real-time updates
 * - Comprehensive error handling
 * - Performance optimization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceDashboardService {

    private final AiPerformanceMonitoringService monitoringService;
    
    // Cache for dashboard data to improve performance
    private final Map<String, Object> dashboardCache = new ConcurrentHashMap<>();
    private final long CACHE_TTL_MS = 30000; // 30 seconds
    private long lastCacheUpdate = 0;

    /**
     * Build comprehensive performance dashboard with all metrics and analytics.
     */
    public Map<String, Object> buildPerformanceDashboard() {
        try {
            long currentTime = System.currentTimeMillis();
            
            // Check if cache is still valid
            if (currentTime - lastCacheUpdate < CACHE_TTL_MS && !dashboardCache.isEmpty()) {
                log.debug("Returning cached dashboard data");
                return new HashMap<>(dashboardCache);
            }
            
            log.info("Building comprehensive performance dashboard");
            
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("last_updated", currentTime);
            dashboard.put("generated_at", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            // Build system overview
            dashboard.put("system_overview", buildSystemOverview());
            
            // Build system health status
            dashboard.put("system_health", buildSystemHealth());
            
            // Build algorithm performance metrics
            dashboard.put("algorithm_performance", buildAlgorithmPerformance());
            
            // Build user analytics
            dashboard.put("user_analytics", buildUserAnalytics());
            
            // Build A/B testing results
            dashboard.put("ab_testing_results", buildAbTestingResults());
            
            // Build performance trends
            dashboard.put("performance_trends", buildPerformanceTrends());
            
            // Build real-time metrics
            dashboard.put("real_time_metrics", buildRealTimeMetrics());
            
            // Update cache
            dashboardCache.clear();
            dashboardCache.putAll(dashboard);
            lastCacheUpdate = currentTime;
            
            log.info("Successfully built performance dashboard with {} sections", dashboard.size());
            return dashboard;
            
        } catch (Exception e) {
            log.error("Failed to build performance dashboard", e);
            return buildFallbackDashboard();
        }
    }

    /**
     * Build system overview with key performance indicators.
     */
    private Map<String, Object> buildSystemOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        try {
            // Get basic system metrics
            overview.put("total_recommendations", getTotalRecommendations());
            overview.put("avg_response_time", getAverageResponseTime());
            overview.put("overall_success_rate", getOverallSuccessRate());
            overview.put("active_algorithms", getActiveAlgorithmsCount());
            overview.put("system_uptime", getSystemUptime());
            overview.put("last_maintenance", getLastMaintenanceDate());
            
        } catch (Exception e) {
            log.warn("Failed to build system overview, using fallback data", e);
            overview.put("total_recommendations", 0);
            overview.put("avg_response_time", 0.0);
            overview.put("overall_success_rate", 0.0);
            overview.put("active_algorithms", 0);
            overview.put("system_uptime", "Unknown");
            overview.put("last_maintenance", "Unknown");
        }
        
        return overview;
    }

    /**
     * Build system health status and alerts.
     */
    private Map<String, Object> buildSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Calculate overall health score
            double healthScore = calculateHealthScore();
            String overallStatus = determineOverallStatus(healthScore);
            
            health.put("overall_status", overallStatus);
            health.put("health_score", healthScore);
            health.put("last_check", System.currentTimeMillis());
            health.put("alerts", generateSystemAlerts(healthScore));
            health.put("recommendations", generateHealthRecommendations(healthScore));
            
        } catch (Exception e) {
            log.warn("Failed to build system health, using fallback data", e);
            health.put("overall_status", "UNKNOWN");
            health.put("health_score", 0.0);
            health.put("last_check", System.currentTimeMillis());
            health.put("alerts", List.of("System health monitoring unavailable"));
            health.put("recommendations", List.of("Check system logs for errors"));
        }
        
        return health;
    }

    /**
     * Build algorithm performance metrics.
     */
    private Map<String, Object> buildAlgorithmPerformance() {
        Map<String, Object> performance = new HashMap<>();
        
        try {
            // Get performance data for each algorithm
            List<String> algorithms = getActiveAlgorithms();
            
            for (String algorithm : algorithms) {
                Map<String, Object> algoMetrics = new HashMap<>();
                algoMetrics.put("performance_score", getAlgorithmPerformanceScore(algorithm));
                algoMetrics.put("response_time_avg", getAlgorithmResponseTime(algorithm));
                algoMetrics.put("success_rate", getAlgorithmSuccessRate(algorithm));
                algoMetrics.put("total_requests", getAlgorithmTotalRequests(algorithm));
                algoMetrics.put("last_used", getAlgorithmLastUsed(algorithm));
                algoMetrics.put("confidence_level", getAlgorithmConfidence(algorithm));
                
                performance.put(algorithm, algoMetrics);
            }
            
        } catch (Exception e) {
            log.warn("Failed to build algorithm performance, using fallback data", e);
            // Add fallback algorithm data
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("performance_score", 0.0);
            fallback.put("response_time_avg", 0.0);
            fallback.put("success_rate", 0.0);
            fallback.put("total_requests", 0);
            fallback.put("last_used", "Unknown");
            fallback.put("confidence_level", 0.0);
            
            performance.put("fallback_algorithm", fallback);
        }
        
        return performance;
    }

    /**
     * Build user analytics and engagement metrics.
     */
    private Map<String, Object> buildUserAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        try {
            analytics.put("total_users", getTotalUsers());
            analytics.put("active_users", getActiveUsers());
            analytics.put("engagement_rate", getEngagementRate());
            analytics.put("top_users", getTopUsers());
            analytics.put("user_satisfaction", getUserSatisfaction());
            analytics.put("retention_rate", getRetentionRate());
            
        } catch (Exception e) {
            log.warn("Failed to build user analytics, using fallback data", e);
            analytics.put("total_users", 0);
            analytics.put("active_users", 0);
            analytics.put("engagement_rate", 0.0);
            analytics.put("top_users", new ArrayList<>());
            analytics.put("user_satisfaction", 0.0);
            analytics.put("retention_rate", 0.0);
        }
        
        return analytics;
    }

    /**
     * Build A/B testing results and comparisons.
     */
    private Map<String, Object> buildAbTestingResults() {
        Map<String, Object> results = new HashMap<>();
        
        try {
            results.put("total_tests", getTotalAbTests());
            results.put("winning_algorithm", getWinningAlgorithm());
            results.put("confidence_level", getAbTestConfidence());
            results.put("test_duration", getAbTestDuration());
            results.put("participant_count", getAbTestParticipants());
            results.put("statistical_significance", getStatisticalSignificance());
            
        } catch (Exception e) {
            log.warn("Failed to build A/B testing results, using fallback data", e);
            results.put("total_tests", 0);
            results.put("winning_algorithm", "Unknown");
            results.put("confidence_level", 0.0);
            results.put("test_duration", "Unknown");
            results.put("participant_count", 0);
            results.put("statistical_significance", 0.0);
        }
        
        return results;
    }

    /**
     * Build performance trends over time.
     */
    private Map<String, Object> buildPerformanceTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        try {
            trends.put("response_time_trend", analyzeResponseTimeTrend());
            trends.put("success_rate_trend", analyzeSuccessRateTrend());
            trends.put("user_engagement_trend", analyzeUserEngagementTrend());
            trends.put("algorithm_performance_trend", analyzeAlgorithmPerformanceTrend());
            trends.put("system_load_trend", analyzeSystemLoadTrend());
            
        } catch (Exception e) {
            log.warn("Failed to build performance trends, using fallback data", e);
            trends.put("response_time_trend", "stable");
            trends.put("success_rate_trend", "stable");
            trends.put("user_engagement_trend", "stable");
            trends.put("algorithm_performance_trend", "stable");
            trends.put("system_load_trend", "stable");
        }
        
        return trends;
    }

    /**
     * Build real-time system metrics.
     */
    private Map<String, Object> buildRealTimeMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            metrics.put("current_load", getCurrentSystemLoad());
            metrics.put("cache_hit_rate", getCacheHitRate());
            metrics.put("memory_usage", getMemoryUsage());
            metrics.put("cpu_usage", getCpuUsage());
            metrics.put("active_connections", getActiveConnections());
            metrics.put("queue_size", getQueueSize());
            
        } catch (Exception e) {
            log.warn("Failed to build real-time metrics, using fallback data", e);
            metrics.put("current_load", 0.0);
            metrics.put("cache_hit_rate", 0.0);
            metrics.put("memory_usage", 0.0);
            metrics.put("cpu_usage", 0.0);
            metrics.put("active_connections", 0);
            metrics.put("queue_size", 0);
        }
        
        return metrics;
    }

    /**
     * Build fallback dashboard when main dashboard fails.
     */
    private Map<String, Object> buildFallbackDashboard() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("last_updated", System.currentTimeMillis());
        fallback.put("status", "FALLBACK");
        fallback.put("error", "Main dashboard unavailable, showing fallback data");
        
        // Add minimal fallback sections
        Map<String, Object> fallbackHealth = new HashMap<>();
        fallbackHealth.put("overall_status", "DEGRADED");
        fallbackHealth.put("health_score", 0.5);
        fallbackHealth.put("alerts", List.of("Dashboard service unavailable"));
        fallback.put("system_health", fallbackHealth);
        
        return fallback;
    }

    // Helper methods for data collection
    
    private int getTotalRecommendations() {
        try {
            return monitoringService.getTotalRecommendations();
        } catch (Exception e) {
            log.debug("Failed to get total recommendations", e);
            return 0;
        }
    }
    
    private double getAverageResponseTime() {
        try {
            return monitoringService.getAverageResponseTime();
        } catch (Exception e) {
            log.debug("Failed to get average response time", e);
            return 0.0;
        }
    }
    
    private double getOverallSuccessRate() {
        try {
            return monitoringService.getOverallSuccessRate();
        } catch (Exception e) {
            log.debug("Failed to get overall success rate", e);
            return 0.0;
        }
    }
    
    private int getActiveAlgorithmsCount() {
        try {
            return monitoringService.getActiveAlgorithms().size();
        } catch (Exception e) {
            log.debug("Failed to get active algorithms count", e);
            return 0;
        }
    }
    
    private String getSystemUptime() {
        try {
            long uptime = System.currentTimeMillis() - getStartTime();
            return formatUptime(uptime);
        } catch (Exception e) {
            log.debug("Failed to get system uptime", e);
            return "Unknown";
        }
    }
    
    private String getLastMaintenanceDate() {
        try {
            return monitoringService.getLastMaintenanceDate();
        } catch (Exception e) {
            log.debug("Failed to get last maintenance date", e);
            return "Unknown";
        }
    }
    
    private double calculateHealthScore() {
        try {
            double responseTimeScore = Math.max(0, 1 - (getAverageResponseTime() / 1000.0));
            double successRateScore = getOverallSuccessRate();
            double loadScore = Math.max(0, 1 - getCurrentSystemLoad());
            
            return (responseTimeScore + successRateScore + loadScore) / 3.0;
        } catch (Exception e) {
            log.debug("Failed to calculate health score", e);
            return 0.5;
        }
    }
    
    private String determineOverallStatus(double healthScore) {
        if (healthScore >= 0.8) return "HEALTHY";
        if (healthScore >= 0.6) return "GOOD";
        if (healthScore >= 0.4) return "DEGRADED";
        if (healthScore >= 0.2) return "POOR";
        return "CRITICAL";
    }
    
    private List<String> generateSystemAlerts(double healthScore) {
        List<String> alerts = new ArrayList<>();
        
        if (healthScore < 0.8) {
            alerts.add("System performance below optimal threshold");
        }
        if (getCurrentSystemLoad() > 0.8) {
            alerts.add("High system load detected");
        }
        if (getMemoryUsage() > 0.9) {
            alerts.add("High memory usage detected");
        }
        
        if (alerts.isEmpty()) {
            alerts.add("All systems operating normally");
        }
        
        return alerts;
    }
    
    private List<String> generateHealthRecommendations(double healthScore) {
        List<String> recommendations = new ArrayList<>();
        
        if (healthScore < 0.8) {
            recommendations.add("Monitor system performance closely");
            recommendations.add("Check for resource bottlenecks");
        }
        if (getCurrentSystemLoad() > 0.8) {
            recommendations.add("Consider scaling system resources");
            recommendations.add("Optimize algorithm performance");
        }
        if (getMemoryUsage() > 0.9) {
            recommendations.add("Increase memory allocation");
            recommendations.add("Optimize memory usage");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("System operating optimally");
        }
        
        return recommendations;
    }
    
    private List<String> getActiveAlgorithms() {
        try {
            return monitoringService.getActiveAlgorithms();
        } catch (Exception e) {
            log.debug("Failed to get active algorithms", e);
            return List.of("fallback");
        }
    }
    
    private double getAlgorithmPerformanceScore(String algorithm) {
        try {
            return monitoringService.getAlgorithmPerformanceScore(algorithm);
        } catch (Exception e) {
            log.debug("Failed to get algorithm performance score for {}", algorithm, e);
            return 0.0;
        }
    }
    
    private double getAlgorithmResponseTime(String algorithm) {
        try {
            return monitoringService.getAlgorithmResponseTime(algorithm);
        } catch (Exception e) {
            log.debug("Failed to get algorithm response time for {}", algorithm, e);
            return 0.0;
        }
    }
    
    private double getAlgorithmSuccessRate(String algorithm) {
        try {
            return monitoringService.getAlgorithmSuccessRate(algorithm);
        } catch (Exception e) {
            log.debug("Failed to get algorithm success rate for {}", algorithm, e);
            return 0.0;
        }
    }
    
    private int getAlgorithmTotalRequests(String algorithm) {
        try {
            return monitoringService.getAlgorithmTotalRequests(algorithm);
        } catch (Exception e) {
            log.debug("Failed to get algorithm total requests for {}", algorithm, e);
            return 0;
        }
    }
    
    private String getAlgorithmLastUsed(String algorithm) {
        try {
            return monitoringService.getAlgorithmLastUsed(algorithm);
        } catch (Exception e) {
            log.debug("Failed to get algorithm last used for {}", algorithm, e);
            return "Unknown";
        }
    }
    
    private double getAlgorithmConfidence(String algorithm) {
        try {
            return monitoringService.getAlgorithmConfidence(algorithm);
        } catch (Exception e) {
            log.debug("Failed to get algorithm confidence for {}", algorithm, e);
            return 0.0;
        }
    }
    
    private int getTotalUsers() {
        try {
            return monitoringService.getTotalUsers();
        } catch (Exception e) {
            log.debug("Failed to get total users", e);
            return 0;
        }
    }
    
    private int getActiveUsers() {
        try {
            return monitoringService.getActiveUsers();
        } catch (Exception e) {
            log.debug("Failed to get active users", e);
            return 0;
        }
    }
    
    private double getEngagementRate() {
        try {
            return monitoringService.getEngagementRate();
        } catch (Exception e) {
            log.debug("Failed to get engagement rate", e);
            return 0.0;
        }
    }
    
    private List<Map<String, Object>> getTopUsers() {
        try {
            return monitoringService.getTopUsers();
        } catch (Exception e) {
            log.debug("Failed to get top users", e);
            return new ArrayList<>();
        }
    }
    
    private double getUserSatisfaction() {
        try {
            return monitoringService.getUserSatisfaction();
        } catch (Exception e) {
            log.debug("Failed to get user satisfaction", e);
            return 0.0;
        }
    }
    
    private double getRetentionRate() {
        try {
            return monitoringService.getRetentionRate();
        } catch (Exception e) {
            log.debug("Failed to get retention rate", e);
            return 0.0;
        }
    }
    
    private int getTotalAbTests() {
        try {
            return monitoringService.getTotalAbTests();
        } catch (Exception e) {
            log.debug("Failed to get total A/B tests", e);
            return 0;
        }
    }
    
    private String getWinningAlgorithm() {
        try {
            return monitoringService.getWinningAlgorithm();
        } catch (Exception e) {
            log.debug("Failed to get winning algorithm", e);
            return "Unknown";
        }
    }
    
    private double getAbTestConfidence() {
        try {
            return monitoringService.getAbTestConfidence();
        } catch (Exception e) {
            log.debug("Failed to get A/B test confidence", e);
            return 0.0;
        }
    }
    
    private String getAbTestDuration() {
        try {
            return monitoringService.getAbTestDuration();
        } catch (Exception e) {
            log.debug("Failed to get A/B test duration", e);
            return "Unknown";
        }
    }
    
    private int getAbTestParticipants() {
        try {
            return monitoringService.getAbTestParticipants();
        } catch (Exception e) {
            log.debug("Failed to get A/B test participants", e);
            return 0;
        }
    }
    
    private double getStatisticalSignificance() {
        try {
            return monitoringService.getStatisticalSignificance();
        } catch (Exception e) {
            log.debug("Failed to get statistical significance", e);
            return 0.0;
        }
    }
    
    private String analyzeResponseTimeTrend() {
        try {
            return monitoringService.analyzeResponseTimeTrend();
        } catch (Exception e) {
            log.debug("Failed to analyze response time trend", e);
            return "stable";
        }
    }
    
    private String analyzeSuccessRateTrend() {
        try {
            return monitoringService.analyzeSuccessRateTrend();
        } catch (Exception e) {
            log.debug("Failed to analyze success rate trend", e);
            return "stable";
        }
    }
    
    private String analyzeUserEngagementTrend() {
        try {
            return monitoringService.analyzeUserEngagementTrend();
        } catch (Exception e) {
            log.debug("Failed to analyze user engagement trend", e);
            return "stable";
        }
    }
    
    private String analyzeAlgorithmPerformanceTrend() {
        try {
            return monitoringService.analyzeAlgorithmPerformanceTrend();
        } catch (Exception e) {
            log.debug("Failed to analyze algorithm performance trend", e);
            return "stable";
        }
    }
    
    private String analyzeSystemLoadTrend() {
        try {
            return monitoringService.analyzeSystemLoadTrend();
        } catch (Exception e) {
            log.debug("Failed to analyze system load trend", e);
            return "stable";
        }
    }
    
    private double getCurrentSystemLoad() {
        try {
            return monitoringService.getCurrentSystemLoad();
        } catch (Exception e) {
            log.debug("Failed to get current system load", e);
            return 0.0;
        }
    }
    
    private double getCacheHitRate() {
        try {
            return monitoringService.getCacheHitRate();
        } catch (Exception e) {
            log.debug("Failed to get cache hit rate", e);
            return 0.0;
        }
    }
    
    private double getMemoryUsage() {
        try {
            return monitoringService.getMemoryUsage();
        } catch (Exception e) {
            log.debug("Failed to get memory usage", e);
            return 0.0;
        }
    }
    
    private double getCpuUsage() {
        try {
            return monitoringService.getCpuUsage();
        } catch (Exception e) {
            log.debug("Failed to get CPU usage", e);
            return 0.0;
        }
    }
    
    private int getActiveConnections() {
        try {
            return monitoringService.getActiveConnections();
        } catch (Exception e) {
            log.debug("Failed to get active connections", e);
            return 0;
        }
    }
    
    private int getQueueSize() {
        try {
            return monitoringService.getQueueSize();
        } catch (Exception e) {
            log.debug("Failed to get queue size", e);
            return 0;
        }
    }
    
    private long getStartTime() {
        try {
            return monitoringService.getStartTime();
        } catch (Exception e) {
            log.debug("Failed to get start time", e);
            return System.currentTimeMillis();
        }
    }
    
    private String formatUptime(long uptimeMs) {
        long seconds = uptimeMs / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;
        
        if (days > 0) {
            return String.format("%dd %dh %dm", days, hours % 24, minutes % 60);
        } else if (hours > 0) {
            return String.format("%dh %dm", hours, minutes % 60);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds % 60);
        } else {
            return String.format("%ds", seconds);
        }
    }
    
    /**
     * Clear dashboard cache to force refresh.
     */
    public void clearCache() {
        dashboardCache.clear();
        lastCacheUpdate = 0;
        log.info("Dashboard cache cleared");
    }
    
    /**
     * Get cache status and statistics.
     */
    public Map<String, Object> getCacheStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("cache_size", dashboardCache.size());
        status.put("last_update", lastCacheUpdate);
        status.put("cache_age_ms", System.currentTimeMillis() - lastCacheUpdate);
        status.put("cache_ttl_ms", CACHE_TTL_MS);
        status.put("is_valid", System.currentTimeMillis() - lastCacheUpdate < CACHE_TTL_MS);
        
        return status;
    }
}
