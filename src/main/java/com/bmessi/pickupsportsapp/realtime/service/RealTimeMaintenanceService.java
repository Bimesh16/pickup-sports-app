package com.bmessi.pickupsportsapp.realtime.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Maintenance service for the real-time system.
 * 
 * Performs scheduled cleanup, optimization, and health monitoring
 * to ensure the real-time system operates efficiently.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeMaintenanceService {

    private final RealTimeEventService realTimeEventService;
    private final RealTimeEventPersistenceService persistenceService;
    private final RealTimeEventFilterService filterService;
    private final EnhancedPresenceService presenceService;
    
    // Maintenance metrics
    private final AtomicLong maintenanceRuns = new AtomicLong(0);
    private final AtomicLong lastMaintenanceRunTime = new AtomicLong(0);
    private Instant lastFullMaintenance = Instant.now();

    /**
     * Quick maintenance every 30 seconds.
     * Handles lightweight cleanup and presence updates.
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    public void performQuickMaintenance() {
        try {
            long startTime = System.currentTimeMillis();
            
            // Clean up stale presence data
            presenceService.performCleanup();
            
            // Update maintenance metrics
            long duration = System.currentTimeMillis() - startTime;
            lastMaintenanceRunTime.set(duration);
            maintenanceRuns.incrementAndGet();
            
            log.debug("Quick maintenance completed in {}ms", duration);
            
        } catch (Exception e) {
            log.error("Error during quick maintenance: {}", e.getMessage());
        }
    }

    /**
     * Full maintenance every 5 minutes.
     * Handles comprehensive cleanup and optimization.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void performFullMaintenance() {
        try {
            long startTime = System.currentTimeMillis();
            
            log.info("Starting full real-time system maintenance");
            
            // Clean up expired events
            persistenceService.performMaintenance();
            
            // Clean up filter caches
            filterService.performMaintenance();
            
            // Clean up event service data
            realTimeEventService.performMaintenance();
            
            // Log system health metrics
            logSystemHealth();
            
            long duration = System.currentTimeMillis() - startTime;
            lastFullMaintenance = Instant.now();
            
            log.info("Full maintenance completed in {}ms", duration);
            
        } catch (Exception e) {
            log.error("Error during full maintenance: {}", e.getMessage());
        }
    }

    /**
     * Health monitoring every minute.
     * Monitors system performance and logs warnings.
     */
    @Scheduled(fixedRate = 60000) // 1 minute
    public void performHealthCheck() {
        try {
            Map<String, Object> metrics = realTimeEventService.getMetrics();
            Map<String, Object> presenceMetrics = presenceService.getPresenceMetrics();
            
            // Check for potential issues
            checkEventDeliveryHealth(metrics);
            checkPresenceHealth(presenceMetrics);
            checkMemoryUsage();
            
        } catch (Exception e) {
            log.error("Error during health check: {}", e.getMessage());
        }
    }

    /**
     * Comprehensive system optimization every hour.
     * Performs deep cleanup and optimization tasks.
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void performSystemOptimization() {
        try {
            log.info("Starting system optimization");
            
            // Force garbage collection hint (JVM may ignore)
            System.gc();
            
            // Log comprehensive metrics
            logDetailedMetrics();
            
            // Reset certain metrics if needed
            resetCountersIfNeeded();
            
            log.info("System optimization completed");
            
        } catch (Exception e) {
            log.error("Error during system optimization: {}", e.getMessage());
        }
    }

    /**
     * Check event delivery health and log warnings.
     */
    private void checkEventDeliveryHealth(Map<String, Object> metrics) {
        try {
            Object successRateObj = metrics.get("deliverySuccessRate");
            if (successRateObj instanceof Double successRate) {
                if (successRate < 95.0) {
                    log.warn("Event delivery success rate is below 95%: {}%", successRate);
                }
            }
            
            Object activeSubscriptionsObj = metrics.get("activeSubscriptions");
            if (activeSubscriptionsObj instanceof Long activeSubscriptions) {
                if (activeSubscriptions > 10000) {
                    log.warn("High number of active subscriptions: {}", activeSubscriptions);
                }
            }
            
            Object rateLimitedObj = metrics.get("totalRateLimitedEvents");
            if (rateLimitedObj instanceof Long rateLimited && rateLimited > 0) {
                log.warn("Events being rate limited: {}", rateLimited);
            }
            
        } catch (Exception e) {
            log.error("Error checking event delivery health: {}", e.getMessage());
        }
    }

    /**
     * Check presence system health.
     */
    private void checkPresenceHealth(Map<String, Object> presenceMetrics) {
        try {
            Object onlineUsersObj = presenceMetrics.get("totalOnlineUsers");
            if (onlineUsersObj instanceof Long onlineUsers) {
                if (onlineUsers > 5000) {
                    log.warn("High number of online users: {}", onlineUsers);
                }
            }
            
            Object cacheSize = presenceMetrics.get("localCacheSize");
            if (cacheSize instanceof Integer size && size > 1000) {
                log.warn("Large presence cache size: {}", size);
            }
            
        } catch (Exception e) {
            log.error("Error checking presence health: {}", e.getMessage());
        }
    }

    /**
     * Check memory usage and log warnings.
     */
    private void checkMemoryUsage() {
        try {
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsagePercent = (double) usedMemory / totalMemory * 100;
            
            if (memoryUsagePercent > 80) {
                log.warn("High memory usage: {}% ({}MB used of {}MB)", 
                        String.format("%.1f", memoryUsagePercent),
                        usedMemory / 1024 / 1024,
                        totalMemory / 1024 / 1024);
            }
            
        } catch (Exception e) {
            log.error("Error checking memory usage: {}", e.getMessage());
        }
    }

    /**
     * Log comprehensive system health.
     */
    private void logSystemHealth() {
        try {
            Map<String, Object> eventMetrics = realTimeEventService.getMetrics();
            Map<String, Object> presenceMetrics = presenceService.getPresenceMetrics();
            
            log.info("Real-time System Health Summary:");
            log.info("  Events - Published: {}, Delivered: {}, Success Rate: {}%",
                    eventMetrics.get("totalPublishedEvents"),
                    eventMetrics.get("totalDeliveredEvents"),
                    eventMetrics.get("deliverySuccessRate"));
            log.info("  Presence - Online Users: {}, Active Subscriptions: {}",
                    presenceMetrics.get("totalOnlineUsers"),
                    eventMetrics.get("activeSubscriptions"));
            log.info("  Performance - Avg Delivery Time: {}ms, Maintenance Runs: {}",
                    eventMetrics.get("averageDeliveryTime"),
                    maintenanceRuns.get());
                    
        } catch (Exception e) {
            log.error("Error logging system health: {}", e.getMessage());
        }
    }

    /**
     * Log detailed metrics for analysis.
     */
    private void logDetailedMetrics() {
        try {
            Map<String, Object> eventMetrics = realTimeEventService.getMetrics();
            Map<String, Object> presenceMetrics = presenceService.getPresenceMetrics();
            
            log.info("Detailed Real-time Metrics:");
            eventMetrics.forEach((key, value) -> 
                log.info("  Event Metric - {}: {}", key, value));
            presenceMetrics.forEach((key, value) -> 
                log.info("  Presence Metric - {}: {}", key, value));
                
            // Memory information
            Runtime runtime = Runtime.getRuntime();
            log.info("  Memory - Total: {}MB, Used: {}MB, Free: {}MB",
                    runtime.totalMemory() / 1024 / 1024,
                    (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024,
                    runtime.freeMemory() / 1024 / 1024);
                    
        } catch (Exception e) {
            log.error("Error logging detailed metrics: {}", e.getMessage());
        }
    }

    /**
     * Reset counters if they get too large.
     */
    private void resetCountersIfNeeded() {
        try {
            Map<String, Object> metrics = realTimeEventService.getMetrics();
            
            Object publishedObj = metrics.get("totalPublishedEvents");
            if (publishedObj instanceof Long published && published > 1_000_000) {
                log.info("Resetting event metrics due to large counters");
                // In a real implementation, you might want to archive these metrics
                // before resetting them
            }
            
        } catch (Exception e) {
            log.error("Error resetting counters: {}", e.getMessage());
        }
    }

    /**
     * Get maintenance service metrics.
     */
    public Map<String, Object> getMaintenanceMetrics() {
        return Map.of(
            "maintenanceRuns", maintenanceRuns.get(),
            "lastMaintenanceRunTime", lastMaintenanceRunTime.get(),
            "lastFullMaintenance", lastFullMaintenance,
            "systemUptime", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime()
        );
    }

    /**
     * Force immediate maintenance (for admin use).
     */
    public void forceMaintenance() {
        log.info("Forcing immediate maintenance run");
        performFullMaintenance();
    }

    /**
     * Get system health status.
     */
    public Map<String, Object> getSystemHealth() {
        try {
            Map<String, Object> eventMetrics = realTimeEventService.getMetrics();
            Map<String, Object> presenceMetrics = presenceService.getPresenceMetrics();
            Map<String, Object> maintenanceMetrics = getMaintenanceMetrics();
            
            // Calculate health score
            double healthScore = calculateHealthScore(eventMetrics, presenceMetrics);
            
            return Map.of(
                "healthScore", healthScore,
                "status", healthScore > 80 ? "HEALTHY" : healthScore > 60 ? "WARNING" : "CRITICAL",
                "eventMetrics", eventMetrics,
                "presenceMetrics", presenceMetrics,
                "maintenanceMetrics", maintenanceMetrics,
                "timestamp", Instant.now()
            );
            
        } catch (Exception e) {
            log.error("Error getting system health: {}", e.getMessage());
            return Map.of(
                "status", "ERROR",
                "error", e.getMessage(),
                "timestamp", Instant.now()
            );
        }
    }

    /**
     * Calculate overall system health score (0-100).
     */
    private double calculateHealthScore(Map<String, Object> eventMetrics, 
                                      Map<String, Object> presenceMetrics) {
        try {
            double score = 100.0;
            
            // Deduct for poor delivery success rate
            Object successRateObj = eventMetrics.get("deliverySuccessRate");
            if (successRateObj instanceof Double successRate) {
                if (successRate < 95) {
                    score -= (95 - successRate);
                }
            }
            
            // Deduct for high memory usage
            Runtime runtime = Runtime.getRuntime();
            double memoryUsage = (double) (runtime.totalMemory() - runtime.freeMemory()) / runtime.totalMemory() * 100;
            if (memoryUsage > 80) {
                score -= (memoryUsage - 80) / 2;
            }
            
            // Deduct for rate limiting
            Object rateLimitedObj = eventMetrics.get("totalRateLimitedEvents");
            if (rateLimitedObj instanceof Long rateLimited && rateLimited > 0) {
                score -= Math.min(20, rateLimited / 100.0);
            }
            
            return Math.max(0, score);
            
        } catch (Exception e) {
            log.error("Error calculating health score: {}", e.getMessage());
            return 0.0;
        }
    }
}
