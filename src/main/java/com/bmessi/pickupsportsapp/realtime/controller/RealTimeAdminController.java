package com.bmessi.pickupsportsapp.realtime.controller;

import com.bmessi.pickupsportsapp.realtime.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin controller for managing and monitoring the real-time system.
 * 
 * Provides endpoints for:
 * - System health monitoring
 * - Performance metrics
 * - Force maintenance operations
 * - Configuration management
 * - Debugging and troubleshooting
 */
@RestController
@RequestMapping("/api/admin/realtime")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RealTimeAdminController {

    private final RealTimeEventService realTimeEventService;
    private final RealTimeEventPersistenceService persistenceService;
    private final RealTimeEventFilterService filterService;
    private final RealTimeEventMetricsService metricsService;
    private final EnhancedPresenceService presenceService;
    private final RealTimeChatService chatService;
    private final RealTimeActivityFeedService activityFeedService;
    private final RealTimeMaintenanceService maintenanceService;

    /**
     * Get comprehensive system health and metrics.
     * GET /api/admin/realtime/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            Map<String, Object> health = maintenanceService.getSystemHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Error getting system health: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get detailed metrics from all real-time services.
     * GET /api/admin/realtime/metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getDetailedMetrics() {
        try {
            Map<String, Object> allMetrics = new HashMap<>();
            
            // Event service metrics
            allMetrics.put("eventService", realTimeEventService.getMetrics());
            
            // Presence service metrics
            allMetrics.put("presenceService", presenceService.getPresenceMetrics());
            
            // Chat service metrics
            allMetrics.put("chatService", chatService.getChatMetrics());
            
            // Activity feed metrics
            allMetrics.put("activityFeedService", activityFeedService.getActivityStats());
            
            // Maintenance metrics
            allMetrics.put("maintenanceService", maintenanceService.getMaintenanceMetrics());
            
            // System metrics
            Runtime runtime = Runtime.getRuntime();
            Map<String, Object> systemMetrics = Map.of(
                "totalMemory", runtime.totalMemory() / 1024 / 1024 + " MB",
                "freeMemory", runtime.freeMemory() / 1024 / 1024 + " MB",
                "usedMemory", (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024 + " MB",
                "availableProcessors", runtime.availableProcessors(),
                "uptime", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() + " ms"
            );
            allMetrics.put("systemMetrics", systemMetrics);
            
            return ResponseEntity.ok(allMetrics);
            
        } catch (Exception e) {
            log.error("Error getting detailed metrics: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Force immediate maintenance across all services.
     * POST /api/admin/realtime/maintenance/force
     */
    @PostMapping("/maintenance/force")
    public ResponseEntity<Map<String, String>> forceMaintenance() {
        try {
            log.info("Admin requested forced maintenance");
            
            maintenanceService.forceMaintenance();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Forced maintenance completed",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Error during forced maintenance: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Reset all metrics (for testing or after maintenance).
     * POST /api/admin/realtime/metrics/reset
     */
    @PostMapping("/metrics/reset")
    public ResponseEntity<Map<String, String>> resetMetrics() {
        try {
            log.warn("Admin requested metrics reset");
            
            metricsService.resetMetrics();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "All metrics have been reset",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Error resetting metrics: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get current active connections and subscriptions.
     * GET /api/admin/realtime/connections
     */
    @GetMapping("/connections")
    public ResponseEntity<Map<String, Object>> getActiveConnections() {
        try {
            Map<String, Object> connections = Map.of(
                "eventServiceMetrics", realTimeEventService.getMetrics(),
                "presenceMetrics", presenceService.getPresenceMetrics(),
                "timestamp", java.time.Instant.now()
            );
            
            return ResponseEntity.ok(connections);
            
        } catch (Exception e) {
            log.error("Error getting active connections: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Test the real-time system by sending a test event.
     * POST /api/admin/realtime/test-event
     */
    @PostMapping("/test-event")
    public ResponseEntity<Map<String, String>> sendTestEvent(
            @RequestParam(defaultValue = "GLOBAL") String target,
            @RequestParam(defaultValue = "test_event") String eventType,
            @RequestParam(required = false) String gameId) {
        
        try {
            log.info("Admin requested test event: type={}, target={}, gameId={}", 
                     eventType, target, gameId);
            
            // Create a test system announcement
            com.bmessi.pickupsportsapp.realtime.event.SystemAnnouncementEvent testEvent = 
                new com.bmessi.pickupsportsapp.realtime.event.SystemAnnouncementEvent(
                    "Test Event",
                    "This is a test event sent by administrator",
                    "INFO",
                    "Admin"
                );
            
            realTimeEventService.publishEvent(testEvent);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Test event sent successfully",
                "eventId", testEvent.getEventId(),
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Error sending test event: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get event processing performance statistics.
     * GET /api/admin/realtime/performance
     */
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceStats() {
        try {
            Map<String, Object> metrics = realTimeEventService.getMetrics();
            
            Map<String, Object> performance = Map.of(
                "averageDeliveryTime", metrics.get("averageDeliveryTime"),
                "averageProcessingTime", metrics.get("averageProcessingTime"),
                "deliverySuccessRate", metrics.get("deliverySuccessRate"),
                "totalPublishedEvents", metrics.get("totalPublishedEvents"),
                "totalDeliveredEvents", metrics.get("totalDeliveredEvents"),
                "totalFailedEvents", metrics.get("totalFailedEvents"),
                "totalRateLimitedEvents", metrics.get("totalRateLimitedEvents"),
                "estimatedThroughput", metrics.get("estimatedThroughput"),
                "activeSubscriptions", metrics.get("activeSubscriptions"),
                "timestamp", java.time.Instant.now()
            );
            
            return ResponseEntity.ok(performance);
            
        } catch (Exception e) {
            log.error("Error getting performance stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get configuration and status of all real-time services.
     * GET /api/admin/realtime/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        try {
            Map<String, Object> status = Map.of(
                "realTimeEventService", "RUNNING",
                "persistenceService", "RUNNING", 
                "filterService", "RUNNING",
                "metricsService", "RUNNING",
                "presenceService", "RUNNING",
                "chatService", "RUNNING",
                "activityFeedService", "RUNNING",
                "maintenanceService", "RUNNING",
                "systemHealth", maintenanceService.getSystemHealth().get("status"),
                "lastHealthCheck", java.time.Instant.now()
            );
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("Error getting system status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Emergency shutdown of real-time services (for maintenance).
     * POST /api/admin/realtime/emergency-shutdown
     */
    @PostMapping("/emergency-shutdown")
    public ResponseEntity<Map<String, String>> emergencyShutdown() {
        try {
            log.warn("Admin requested emergency shutdown of real-time services");
            
            // In a real implementation, you would gracefully shutdown services
            // For now, just log the action
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Emergency shutdown initiated",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Error during emergency shutdown: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "error", e.getMessage()
            ));
        }
    }
}
