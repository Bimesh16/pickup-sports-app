package com.bmessi.pickupsportsapp.realtime.controller;

import com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent;
import com.bmessi.pickupsportsapp.realtime.event.UserPresenceEvent;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing real-time WebSocket communications and user presence.
 * 
 * Provides endpoints for:
 * - User presence management
 * - Real-time event subscriptions
 * - Event history and replay
 * - Connection management
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class RealTimeController {

    private final RealTimeEventService realTimeEventService;
    private final RealTimeEventPersistenceService persistenceService;

    /**
     * Subscribe to real-time updates for a specific game.
     * WebSocket endpoint: /app/realtime/games/{gameId}/subscribe
     */
    @MessageMapping("/realtime/games/{gameId}/subscribe")
    public void subscribeToGame(@DestinationVariable String gameId, Principal principal) {
        String username = principal.getName();
        
        try {
            realTimeEventService.subscribeToGame(username, gameId);
            
            // Send presence update
            UserPresenceEvent presenceEvent = new UserPresenceEvent(
                Long.parseLong(gameId), 
                username, 
                UserPresenceEvent.PresenceStatus.VIEWING_GAME,
                realTimeEventService.getMetrics().get("activeSubscriptions") != null ? 
                    (Long) realTimeEventService.getMetrics().get("activeSubscriptions") : 0L
            );
            realTimeEventService.publishEvent(presenceEvent);
            
            log.debug("User {} subscribed to game {}", username, gameId);
            
        } catch (Exception e) {
            log.error("Error subscribing user {} to game {}: {}", username, gameId, e.getMessage());
        }
    }

    /**
     * Unsubscribe from real-time updates for a specific game.
     * WebSocket endpoint: /app/realtime/games/{gameId}/unsubscribe
     */
    @MessageMapping("/realtime/games/{gameId}/unsubscribe")
    public void unsubscribeFromGame(@DestinationVariable String gameId, Principal principal) {
        String username = principal.getName();
        
        try {
            realTimeEventService.unsubscribeFromGame(username, gameId);
            
            // Send presence update
            UserPresenceEvent presenceEvent = new UserPresenceEvent(
                Long.parseLong(gameId), 
                username, 
                UserPresenceEvent.PresenceStatus.OFFLINE,
                realTimeEventService.getMetrics().get("activeSubscriptions") != null ? 
                    (Long) realTimeEventService.getMetrics().get("activeSubscriptions") : 0L
            );
            realTimeEventService.publishEvent(presenceEvent);
            
            log.debug("User {} unsubscribed from game {}", username, gameId);
            
        } catch (Exception e) {
            log.error("Error unsubscribing user {} from game {}: {}", username, gameId, e.getMessage());
        }
    }

    /**
     * Send presence heartbeat to indicate user is still active.
     * WebSocket endpoint: /app/realtime/presence/heartbeat
     */
    @MessageMapping("/realtime/presence/heartbeat")
    public void sendHeartbeat(Principal principal, @org.springframework.messaging.handler.annotation.Payload Map<String, Object> payload) {
        String username = principal.getName();
        
        try {
            String gameId = (String) payload.get("gameId");
            UserPresenceEvent.PresenceStatus status = UserPresenceEvent.PresenceStatus.ONLINE;
            
            if (payload.get("status") != null) {
                try {
                    status = UserPresenceEvent.PresenceStatus.valueOf((String) payload.get("status"));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid presence status: {}", payload.get("status"));
                }
            }
            
            UserPresenceEvent presenceEvent = new UserPresenceEvent(
                gameId != null ? Long.parseLong(gameId) : null,
                username,
                status,
                realTimeEventService.getMetrics().get("activeSubscriptions") != null ? 
                    (Long) realTimeEventService.getMetrics().get("activeSubscriptions") : 0L
            );
            realTimeEventService.publishEvent(presenceEvent);
            
            log.debug("Received heartbeat from user {} with status {}", username, status);
            
        } catch (Exception e) {
            log.error("Error processing heartbeat from user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Get missed events for a user (REST endpoint for reconnection).
     * GET /api/realtime/missed-events
     */
    @GetMapping("/api/realtime/missed-events")
    public ResponseEntity<List<RealTimeEvent>> getMissedEvents(
            @RequestParam(required = false) String since,
            @RequestParam(defaultValue = "100") int limit,
            Principal principal) {
        
        String username = principal.getName();
        
        try {
            Instant sinceTime = since != null ? 
                Instant.parse(since) : 
                Instant.now().minus(1, ChronoUnit.HOURS); // Default to last hour
            
            List<RealTimeEvent> events = realTimeEventService.getOfflineEvents(username, sinceTime);
            
            // Limit the results
            if (events.size() > limit) {
                events = events.subList(0, limit);
            }
            
            log.debug("Retrieved {} missed events for user {} since {}", 
                     events.size(), username, sinceTime);
            
            return ResponseEntity.ok(events);
            
        } catch (Exception e) {
            log.error("Error retrieving missed events for user {}: {}", username, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get recent events for a specific game.
     * GET /api/realtime/games/{gameId}/events
     */
    @GetMapping("/api/realtime/games/{gameId}/events")
    public ResponseEntity<List<RealTimeEvent>> getGameEvents(
            @PathVariable Long gameId,
            @RequestParam(required = false) String since,
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            Instant sinceTime = since != null ? 
                Instant.parse(since) : 
                Instant.now().minus(2, ChronoUnit.HOURS); // Default to last 2 hours
            
            List<RealTimeEvent> events = persistenceService.getGameEvents(
                gameId.toString(), sinceTime, limit);
            
            log.debug("Retrieved {} events for game {} since {}", 
                     events.size(), gameId, sinceTime);
            
            return ResponseEntity.ok(events);
            
        } catch (Exception e) {
            log.error("Error retrieving events for game {}: {}", gameId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get real-time system metrics and status.
     * GET /api/realtime/metrics
     */
    @GetMapping("/api/realtime/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        try {
            Map<String, Object> metrics = realTimeEventService.getMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            log.error("Error retrieving real-time metrics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get global activity feed events.
     * GET /api/realtime/activity
     */
    @GetMapping("/api/realtime/activity")
    public ResponseEntity<List<RealTimeEvent>> getActivityFeed(
            @RequestParam(required = false) String since,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            Instant sinceTime = since != null ? 
                Instant.parse(since) : 
                Instant.now().minus(24, ChronoUnit.HOURS); // Default to last 24 hours
            
            List<RealTimeEvent> events = persistenceService.getGlobalEvents(sinceTime, limit);
            
            // Filter to only activity feed events
            List<RealTimeEvent> activityEvents = events.stream()
                .filter(event -> "activity_feed".equals(event.getType()))
                .toList();
            
            log.debug("Retrieved {} activity feed events since {}", 
                     activityEvents.size(), sinceTime);
            
            return ResponseEntity.ok(activityEvents);
            
        } catch (Exception e) {
            log.error("Error retrieving activity feed: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check endpoint for real-time system.
     * GET /api/realtime/health
     */
    @GetMapping("/api/realtime/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", Instant.now(),
                "activeConnections", realTimeEventService.getMetrics().get("activeSubscriptions"),
                "systemMetrics", realTimeEventService.getMetrics()
            );
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            log.error("Error during health check: {}", e.getMessage());
            return ResponseEntity.status(503).body(Map.of(
                "status", "DOWN",
                "timestamp", Instant.now(),
                "error", e.getMessage()
            ));
        }
    }
}