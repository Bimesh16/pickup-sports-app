package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * Core service for managing real-time events in the pickup sports application.
 * 
 * Responsibilities:
 * - Event publishing and routing
 * - Event persistence for offline users
 * - Rate limiting and throttling
 * - Event filtering and security
 * - Performance monitoring
 * - Event replay and synchronization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeEventService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RealTimeEventPersistenceService persistenceService;
    private final RealTimeEventFilterService filterService;
    private final RealTimeEventMetricsService metricsService;
    
    // Thread-safe collections for managing active subscriptions
    private final Map<String, Set<String>> gameSubscriptions = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> userSubscriptions = new ConcurrentHashMap<>();
    private final Map<String, Instant> userLastSeen = new ConcurrentHashMap<>();
    
    // Rate limiting maps
    private final Map<String, List<Instant>> userEventHistory = new ConcurrentHashMap<>();
    private final Map<String, Integer> userEventCounts = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_EVENTS_PER_MINUTE = 60;
    private static final int MAX_EVENTS_PER_HOUR = 500;
    private static final int MAX_QUEUE_SIZE = 10000;
    
    // Async event processing
    private final ExecutorService eventProcessingPool = Executors.newFixedThreadPool(10);
    private final ExecutorService deliveryPool = Executors.newFixedThreadPool(20);

    /**
     * Publish a real-time event to the appropriate destinations.
     */
    public void publishEvent(RealTimeEvent event) {
        try {
            // Validate event
            if (event == null || event.isExpired()) {
                log.warn("Rejected expired or null event: {}", event);
                return;
            }

            // Apply rate limiting
            if (!checkRateLimit(event)) {
                log.warn("Rate limit exceeded for event: {}", event.getEventId());
                metricsService.incrementRateLimitedEvents();
                return;
            }

            // Process event asynchronously
            eventProcessingPool.submit(() -> processEvent(event));
            
            metricsService.incrementPublishedEvents();
            log.debug("Published event: {} to destination: {}", event.getEventId(), event.getDestination());
            
        } catch (Exception e) {
            log.error("Error publishing event: {}", event.getEventId(), e);
            metricsService.incrementFailedEvents();
        }
    }

    /**
     * Process and deliver an event.
     */
    private void processEvent(RealTimeEvent event) {
        try {
            // Persist event if configured
            if (event.isPersistent()) {
                persistenceService.persistEvent(event);
            }

            // Apply event filtering and security
            if (!filterService.shouldDeliverEvent(event)) {
                log.debug("Event filtered out: {}", event.getEventId());
                return;
            }

            // Deliver event based on target type
            switch (event.getTarget()) {
                case GAME_ROOM -> deliverToGameRoom(event);
                case USER -> deliverToUser(event);
                case GLOBAL -> deliverGlobally(event);
                case LOCATION -> deliverToLocation(event);
                case ROLE_BASED -> deliverToRole(event);
                case CUSTOM -> deliverCustom(event);
            }

            metricsService.recordEventDelivery(event);

        } catch (Exception e) {
            log.error("Error processing event: {}", event.getEventId(), e);
            metricsService.incrementFailedDeliveries();
        }
    }

    /**
     * Deliver event to all users subscribed to a game room.
     */
    private void deliverToGameRoom(RealTimeEvent event) {
        String routingKey = event.getRoutingKey();
        Set<String> subscribers = gameSubscriptions.getOrDefault(routingKey, Set.of());
        
        if (subscribers.isEmpty()) {
            log.debug("No subscribers for game room: {}", routingKey);
            return;
        }

        deliveryPool.submit(() -> {
            try {
                // Send to game room topic
                messagingTemplate.convertAndSend(event.getDestination(), event);
                
                // Update metrics
                metricsService.recordDeliveryToSubscribers(subscribers.size());
                
                log.debug("Delivered event {} to {} subscribers in game room {}", 
                         event.getEventId(), subscribers.size(), routingKey);
                         
            } catch (Exception e) {
                log.error("Error delivering to game room {}: {}", routingKey, e.getMessage());
            }
        });
    }

    /**
     * Deliver event to a specific user.
     */
    private void deliverToUser(RealTimeEvent event) {
        String username = event.getRoutingKey();
        
        deliveryPool.submit(() -> {
            try {
                // Check if user is online
                boolean isOnline = userSubscriptions.containsKey(username);
                
                if (isOnline) {
                    // Send to user-specific destination
                    messagingTemplate.convertAndSendToUser(username, 
                                                         event.getDestination().replace("/user/" + username, ""), 
                                                         event);
                    log.debug("Delivered event {} to online user {}", event.getEventId(), username);
                } else {
                    // Store for offline delivery
                    if (event.isPersistent()) {
                        persistenceService.storeForOfflineUser(username, event);
                        log.debug("Stored event {} for offline user {}", event.getEventId(), username);
                    }
                }
                
                metricsService.recordUserDelivery(isOnline);
                
            } catch (Exception e) {
                log.error("Error delivering to user {}: {}", username, e.getMessage());
            }
        });
    }

    /**
     * Deliver event globally to all connected users.
     */
    private void deliverGlobally(RealTimeEvent event) {
        deliveryPool.submit(() -> {
            try {
                messagingTemplate.convertAndSend(event.getDestination(), event);
                
                int totalUsers = userSubscriptions.size();
                metricsService.recordGlobalDelivery(totalUsers);
                
                log.debug("Delivered global event {} to {} connected users", 
                         event.getEventId(), totalUsers);
                         
            } catch (Exception e) {
                log.error("Error delivering global event: {}", e.getMessage());
            }
        });
    }

    /**
     * Deliver event to users in a specific location.
     */
    private void deliverToLocation(RealTimeEvent event) {
        deliveryPool.submit(() -> {
            try {
                messagingTemplate.convertAndSend(event.getDestination(), event);
                log.debug("Delivered location event {} to topic {}", 
                         event.getEventId(), event.getDestination());
                         
            } catch (Exception e) {
                log.error("Error delivering location event: {}", e.getMessage());
            }
        });
    }

    /**
     * Deliver event to users with specific roles.
     */
    private void deliverToRole(RealTimeEvent event) {
        // Implementation for role-based delivery
        // This would require integration with user role service
        log.debug("Role-based delivery not yet implemented for event: {}", event.getEventId());
    }

    /**
     * Custom delivery logic.
     */
    private void deliverCustom(RealTimeEvent event) {
        // Implementation for custom delivery logic
        log.debug("Custom delivery not yet implemented for event: {}", event.getEventId());
    }

    /**
     * Subscribe a user to a game room for real-time updates.
     */
    public void subscribeToGame(String username, String gameId) {
        gameSubscriptions.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(username);
        userSubscriptions.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet()).add(gameId);
        userLastSeen.put(username, Instant.now());
        
        log.debug("User {} subscribed to game {}", username, gameId);
        metricsService.incrementActiveSubscriptions();
    }

    /**
     * Unsubscribe a user from a game room.
     */
    public void unsubscribeFromGame(String username, String gameId) {
        Set<String> gameUsers = gameSubscriptions.get(gameId);
        if (gameUsers != null) {
            gameUsers.remove(username);
            if (gameUsers.isEmpty()) {
                gameSubscriptions.remove(gameId);
            }
        }
        
        Set<String> userGames = userSubscriptions.get(username);
        if (userGames != null) {
            userGames.remove(gameId);
            if (userGames.isEmpty()) {
                userSubscriptions.remove(username);
                userLastSeen.remove(username);
            }
        }
        
        log.debug("User {} unsubscribed from game {}", username, gameId);
        metricsService.decrementActiveSubscriptions();
    }

    /**
     * Get events for a user who just came online.
     */
    public List<RealTimeEvent> getOfflineEvents(String username, Instant since) {
        return persistenceService.getEventsForUser(username, since);
    }

    /**
     * Rate limiting check.
     */
    private boolean checkRateLimit(RealTimeEvent event) {
        String key = event.getRoutingKey();
        Instant now = Instant.now();
        Instant oneMinuteAgo = now.minusSeconds(60);
        Instant oneHourAgo = now.minusSeconds(3600);
        
        // Clean old entries and count recent events
        List<Instant> recentEvents = userEventHistory.computeIfAbsent(key, k -> new ArrayList<>());
        recentEvents.removeIf(timestamp -> timestamp.isBefore(oneHourAgo));
        
        long eventsInLastMinute = recentEvents.stream()
                                             .filter(timestamp -> timestamp.isAfter(oneMinuteAgo))
                                             .count();
        
        long eventsInLastHour = recentEvents.size();
        
        // Check limits
        if (eventsInLastMinute >= MAX_EVENTS_PER_MINUTE || eventsInLastHour >= MAX_EVENTS_PER_HOUR) {
            return false;
        }
        
        // Add current event timestamp
        recentEvents.add(now);
        return true;
    }

    /**
     * Get current metrics and status.
     */
    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("activeGameSubscriptions", gameSubscriptions.size());
        metrics.put("activeUserSubscriptions", userSubscriptions.size());
        metrics.put("totalSubscribers", userSubscriptions.values().stream()
                                                        .mapToInt(Set::size).sum());
        metrics.put("lastUpdated", Instant.now());
        metrics.putAll(metricsService.getMetrics());
        return metrics;
    }

    /**
     * Clean up expired data and perform maintenance.
     */
    public void performMaintenance() {
        Instant now = Instant.now();
        Instant threshold = now.minusSeconds(3600); // 1 hour ago
        
        // Clean up old event history
        userEventHistory.entrySet().removeIf(entry -> {
            entry.getValue().removeIf(timestamp -> timestamp.isBefore(threshold));
            return entry.getValue().isEmpty();
        });
        
        // Clean up stale user sessions
        userLastSeen.entrySet().removeIf(entry -> entry.getValue().isBefore(threshold));
        
        log.debug("Performed real-time event service maintenance");
    }
}
