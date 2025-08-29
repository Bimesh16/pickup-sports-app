package com.bmessi.pickupsportsapp.service.monitoring;

import io.micrometer.core.instrument.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Comprehensive performance monitoring service that provides real-time insights,
 * metrics collection, and performance optimization recommendations.
 * 
 * <p>This service implements a multi-layered monitoring approach:</p>
 * <ul>
 *   <li><strong>Real-time Metrics:</strong> Live performance data collection</li>
 *   <li><strong>Historical Analysis:</strong> Performance trend analysis and reporting</li>
 *   <li><strong>Alerting:</strong> Automated performance issue detection</li>
 *   <li><strong>Optimization:</strong> Performance improvement recommendations</li>
 *   <li><strong>Integration:</strong> Seamless integration with analytics and monitoring systems</li>
 * </ul>
 * 
 * <p><strong>Monitoring Areas:</strong></p>
 * <ul>
 *   <li><strong>API Performance:</strong> Response times, throughput, and error rates</li>
 *   <li><strong>Database Performance:</strong> Query execution times and connection pool metrics</li>
 *   <li><strong>Cache Performance:</strong> Hit rates, miss rates, and eviction patterns</li>
 *   <li><strong>System Resources:</strong> CPU, memory, disk, and network utilization</li>
 *   <li><strong>Business Metrics:</strong> User engagement, conversion rates, and revenue impact</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceMonitoringService {

    private final MeterRegistry meterRegistry;
    
    @Value("${app.monitoring.alert-threshold.response-time:2000}")
    private long responseTimeAlertThresholdMs;
    
    @Value("${app.monitoring.alert-threshold.error-rate:0.05}")
    private double errorRateAlertThreshold;
    
    @Value("${app.monitoring.alert-threshold.cpu-usage:0.8}")
    private double cpuUsageAlertThreshold;
    
    @Value("${app.monitoring.alert-threshold.memory-usage:0.85}")
    private double memoryUsageAlertThreshold;

    // Real-time performance counters
    private final Map<String, AtomicLong> requestCounters = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> errorCounters = new ConcurrentHashMap<>();
    private final Map<String, AtomicReference<Double>> responseTimeAverages = new ConcurrentHashMap<>();
    
    // Performance thresholds and alerts
    private final Map<String, Double> performanceThresholds = new ConcurrentHashMap<>();
    private final List<PerformanceAlert> activeAlerts = new ArrayList<>();

    /**
     * Record API performance metrics.
     * 
     * @param endpoint API endpoint
     * @param responseTime Response time in milliseconds
     * @param statusCode HTTP status code
     * @param userId User ID (optional)
     */
    public void recordApiPerformance(String endpoint, long responseTime, int statusCode, Long userId) {
        // Update counters
        requestCounters.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();
        
        if (statusCode >= 400) {
            errorCounters.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();
        }
        
        // Update response time average
        AtomicReference<Double> avgRef = responseTimeAverages.computeIfAbsent(endpoint, k -> new AtomicReference<>(0.0));
        avgRef.updateAndGet(current -> {
            long count = requestCounters.get(endpoint).get();
            return (current * (count - 1) + responseTime) / count;
        });
        
        // Record metrics in Micrometer
        io.micrometer.core.instrument.Timer.builder("api.response.time")
                .tag("endpoint", endpoint)
                .tag("status_code", String.valueOf(statusCode))
                .tag("user_id", userId != null ? userId.toString() : "anonymous")
                .register(meterRegistry)
                .record(responseTime, java.util.concurrent.TimeUnit.MILLISECONDS);
        
        // Check for performance alerts
        checkPerformanceAlerts(endpoint, responseTime, statusCode);
        
        // Store in database periodically
        if (shouldStoreMetrics(endpoint)) {
            storePerformanceMetrics(endpoint, responseTime, statusCode, userId);
        }
    }

    /**
     * Record database performance metrics.
     * 
     * @param queryType Type of database operation
     * @param executionTime Execution time in milliseconds
     * @param success Whether the operation was successful
     */
    public void recordDatabasePerformance(String queryType, long executionTime, boolean success) {
        io.micrometer.core.instrument.Timer.builder("database.execution.time")
                .tag("query_type", queryType)
                .tag("success", String.valueOf(success))
                .register(meterRegistry)
                .record(executionTime, java.util.concurrent.TimeUnit.MILLISECONDS);
        
        Counter.builder("database.operations")
                .tag("query_type", queryType)
                .tag("success", String.valueOf(success))
                .register(meterRegistry)
                .increment();
        
        // Check for database performance alerts
        if (executionTime > 1000) { // Alert if query takes more than 1 second
            createPerformanceAlert("DATABASE_SLOW_QUERY", 
                    "Slow database query detected: " + queryType + " took " + executionTime + "ms",
                    "HIGH");
        }
    }

    /**
     * Record cache performance metrics.
     * 
     * @param cacheName Name of the cache
     * @param operation Cache operation (get, put, evict)
     * @param duration Operation duration in milliseconds
     * @param success Whether the operation was successful
     */
    public void recordCachePerformance(String cacheName, String operation, long duration, boolean success) {
        io.micrometer.core.instrument.Timer.builder("cache.operation.time")
                .tag("cache_name", cacheName)
                .tag("operation", operation)
                .tag("success", String.valueOf(success))
                .register(meterRegistry)
                .record(duration, java.util.concurrent.TimeUnit.MILLISECONDS);
        
        Counter.builder("cache.operations")
                .tag("cache_name", cacheName)
                .tag("operation", operation)
                .tag("success", String.valueOf(success))
                .register(meterRegistry)
                .increment();
    }

    /**
     * Record system resource metrics.
     * 
     * @param cpuUsage CPU usage percentage (0.0 to 1.0)
     * @param memoryUsage Memory usage percentage (0.0 to 1.0)
     * @param diskUsage Disk usage percentage (0.0 to 1.0)
     * @param networkLatency Network latency in milliseconds
     */
    public void recordSystemMetrics(double cpuUsage, double memoryUsage, double diskUsage, long networkLatency) {
        // Record system metrics
        Gauge.builder("system.cpu.usage", () -> cpuUsage)
                .register(meterRegistry);
        
        Gauge.builder("system.memory.usage", () -> memoryUsage)
                .register(meterRegistry);
        
        Gauge.builder("system.disk.usage", () -> diskUsage)
                .register(meterRegistry);
        
        Gauge.builder("system.network.latency", () -> networkLatency)
                .register(meterRegistry);
        
        // Check for system resource alerts
        if (cpuUsage > cpuUsageAlertThreshold) {
            createPerformanceAlert("HIGH_CPU_USAGE", 
                    "High CPU usage detected: " + String.format("%.2f%%", cpuUsage * 100),
                    "MEDIUM");
        }
        
        if (memoryUsage > memoryUsageAlertThreshold) {
            createPerformanceAlert("HIGH_MEMORY_USAGE", 
                    "High memory usage detected: " + String.format("%.2f%%", memoryUsage * 100),
                    "HIGH");
        }
    }

    /**
     * Record business metrics.
     * 
     * @param metricName Name of the business metric
     * @param value Metric value
     * @param category Metric category
     */
    public void recordBusinessMetric(String metricName, double value, String category) {
        Gauge.builder("business.metric", () -> value)
                .tag("metric_name", metricName)
                .tag("category", category)
                .register(meterRegistry);
        
        // Store business metrics for analysis
        storeBusinessMetrics(metricName, value, category);
    }

    /**
     * Get comprehensive performance metrics.
     * 
     * @return Map of performance metrics
     */
    public Map<String, Object> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // API performance metrics
        Map<String, Object> apiMetrics = new HashMap<>();
        requestCounters.forEach((endpoint, counter) -> {
            Map<String, Object> endpointMetrics = new HashMap<>();
            endpointMetrics.put("requestCount", counter.get());
            endpointMetrics.put("errorCount", errorCounters.getOrDefault(endpoint, new AtomicLong(0)).get());
            endpointMetrics.put("averageResponseTime", responseTimeAverages.getOrDefault(endpoint, new AtomicReference<>(0.0)).get());
            
            long totalRequests = counter.get();
            long totalErrors = errorCounters.getOrDefault(endpoint, new AtomicLong(0)).get();
            double errorRate = totalRequests > 0 ? (double) totalErrors / totalRequests : 0.0;
            endpointMetrics.put("errorRate", errorRate);
            
            apiMetrics.put(endpoint, endpointMetrics);
        });
        metrics.put("api", apiMetrics);
        
        // System metrics
        Map<String, Object> systemMetrics = new HashMap<>();
        systemMetrics.put("cpuUsage", getCurrentCpuUsage());
        systemMetrics.put("memoryUsage", getCurrentMemoryUsage());
        systemMetrics.put("diskUsage", getCurrentDiskUsage());
        metrics.put("system", systemMetrics);
        
        // Cache metrics
        Map<String, Object> cacheMetrics = new HashMap<>();
        cacheMetrics.put("hitRate", getCacheHitRate());
        cacheMetrics.put("missRate", getCacheMissRate());
        cacheMetrics.put("evictionRate", getCacheEvictionRate());
        metrics.put("cache", cacheMetrics);
        
        // Business metrics
        Map<String, Object> businessMetrics = new HashMap<>();
        businessMetrics.put("activeUsers", getActiveUserCount());
        businessMetrics.put("gameCreationRate", getGameCreationRate());
        businessMetrics.put("venueBookingRate", getVenueBookingRate());
        metrics.put("business", businessMetrics);
        
        return metrics;
    }

    /**
     * Get performance alerts.
     * 
     * @return List of active performance alerts
     */
    public List<PerformanceAlert> getPerformanceAlerts() {
        return new ArrayList<>(activeAlerts);
    }

    /**
     * Get performance recommendations.
     * 
     * @return List of performance optimization recommendations
     */
    public List<String> getPerformanceRecommendations() {
        List<String> recommendations = new ArrayList<>();
        
        // Analyze API performance
        responseTimeAverages.forEach((endpoint, avgTime) -> {
            if (avgTime.get() > responseTimeAlertThresholdMs) {
                recommendations.add("Consider optimizing endpoint: " + endpoint + 
                        " (avg response time: " + avgTime.get() + "ms)");
            }
        });
        
        // Analyze error rates
        errorCounters.forEach((endpoint, errorCount) -> {
            long totalRequests = requestCounters.getOrDefault(endpoint, new AtomicLong(0)).get();
            if (totalRequests > 0) {
                double errorRate = (double) errorCount.get() / totalRequests;
                if (errorRate > errorRateAlertThreshold) {
                    recommendations.add("High error rate detected for endpoint: " + endpoint + 
                            " (error rate: " + String.format("%.2f%%", errorRate * 100) + ")");
                }
            }
        });
        
        // System resource recommendations
        double cpuUsage = getCurrentCpuUsage();
        if (cpuUsage > 0.7) {
            recommendations.add("Consider scaling up CPU resources (current usage: " + 
                    String.format("%.2f%%", cpuUsage * 100) + ")");
        }
        
        double memoryUsage = getCurrentMemoryUsage();
        if (memoryUsage > 0.8) {
            recommendations.add("Consider increasing memory allocation (current usage: " + 
                    String.format("%.2f%%", memoryUsage * 100) + ")");
        }
        
        return recommendations;
    }

    /**
     * Check for performance alerts based on metrics.
     * 
     * @param endpoint API endpoint
     * @param responseTime Response time in milliseconds
     * @param statusCode HTTP status code
     */
    private void checkPerformanceAlerts(String endpoint, long responseTime, int statusCode) {
        // Response time alert
        if (responseTime > responseTimeAlertThresholdMs) {
            createPerformanceAlert("SLOW_API_RESPONSE", 
                    "Slow API response detected: " + endpoint + " took " + responseTime + "ms",
                    "MEDIUM");
        }
        
        // Error rate alert
        if (statusCode >= 500) {
            createPerformanceAlert("API_ERROR", 
                    "API error detected: " + endpoint + " returned " + statusCode,
                    "HIGH");
        }
    }

    /**
     * Create a new performance alert.
     * 
     * @param type Alert type
     * @param message Alert message
     * @param severity Alert severity
     */
    private void createPerformanceAlert(String type, String message, String severity) {
        PerformanceAlert alert = new PerformanceAlert(type, message, severity, OffsetDateTime.now());
        activeAlerts.add(alert);
        
        log.warn("Performance alert created: {} - {} ({})", type, message, severity);
        
        // TODO: Send alert to monitoring system (e.g., Slack, email, PagerDuty)
    }

    /**
     * Store performance metrics in database.
     * 
     * @param endpoint API endpoint
     * @param responseTime Response time in milliseconds
     * @param statusCode HTTP status code
     * @param userId User ID
     */
    private void storePerformanceMetrics(String endpoint, long responseTime, int statusCode, Long userId) {
        try {
            // TODO: Implement performance metrics storage
            log.debug("Storing performance metrics: endpoint={}, responseTime={}, statusCode={}, userId={}", 
                    endpoint, responseTime, statusCode, userId);
        } catch (Exception e) {
            log.warn("Failed to store performance metrics", e);
        }
    }

    /**
     * Store business metrics for analysis.
     * 
     * @param metricName Metric name
     * @param value Metric value
     * @param category Metric category
     */
    private void storeBusinessMetrics(String metricName, double value, String category) {
        // TODO: Implement business metrics storage
        log.debug("Storing business metric: {} = {} ({})", metricName, value, category);
    }

    /**
     * Check if metrics should be stored in database.
     * 
     * @param endpoint API endpoint
     * @return True if metrics should be stored
     */
    private boolean shouldStoreMetrics(String endpoint) {
        // Store metrics for every 100th request to avoid overwhelming the database
        AtomicLong counter = requestCounters.get(endpoint);
        return counter != null && counter.get() % 100 == 0;
    }

    // Helper methods for getting current system metrics
    private double getCurrentCpuUsage() {
        // TODO: Implement actual CPU usage monitoring
        return 0.5; // Placeholder
    }
    
    private double getCurrentMemoryUsage() {
        // TODO: Implement actual memory usage monitoring
        return 0.6; // Placeholder
    }
    
    private double getCurrentDiskUsage() {
        // TODO: Implement actual disk usage monitoring
        return 0.4; // Placeholder
    }
    
    private double getCacheHitRate() {
        // TODO: Implement actual cache hit rate monitoring
        return 0.85; // Placeholder
    }
    
    private double getCacheMissRate() {
        return 1.0 - getCacheHitRate();
    }
    
    private double getCacheEvictionRate() {
        // TODO: Implement actual cache eviction rate monitoring
        return 0.02; // Placeholder
    }
    
    private long getActiveUserCount() {
        // TODO: Implement actual active user count
        return 150; // Placeholder
    }
    
    private double getGameCreationRate() {
        // TODO: Implement actual game creation rate
        return 12.5; // Placeholder
    }
    
    private double getVenueBookingRate() {
        // TODO: Implement actual venue booking rate
        return 8.3; // Placeholder
    }

    /**
     * Scheduled task to clean up old alerts and update metrics.
     */
    @Scheduled(fixedRate = 60000) // Every minute
    public void cleanupAndUpdateMetrics() {
        try {
            // Remove alerts older than 1 hour
            activeAlerts.removeIf(alert -> 
                    alert.timestamp().isBefore(OffsetDateTime.now().minus(1, ChronoUnit.HOURS)));
            
            // Update performance thresholds based on historical data
            updatePerformanceThresholds();
            
            log.debug("Performance monitoring cleanup completed. Active alerts: {}", activeAlerts.size());
        } catch (Exception e) {
            log.warn("Performance monitoring cleanup failed", e);
        }
    }

    /**
     * Update performance thresholds based on historical data.
     */
    private void updatePerformanceThresholds() {
        // TODO: Implement dynamic threshold adjustment based on historical performance
        log.debug("Updating performance thresholds");
    }

    /**
     * Performance alert record.
     * 
     * @param type Alert type
     * @param message Alert message
     * @param severity Alert severity
     * @param timestamp Alert timestamp
     */
    public record PerformanceAlert(String type, String message, String severity, OffsetDateTime timestamp) {}
}
