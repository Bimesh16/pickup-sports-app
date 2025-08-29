package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for filtering and validating real-time events before delivery.
 * 
 * Applies security checks, user preferences, and business rules to determine
 * whether an event should be delivered to its intended recipients.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeEventFilterService {

    // Cache for user preferences and permissions
    private final Map<String, UserEventPreferences> userPreferencesCache = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> userBlockedUsers = new ConcurrentHashMap<>();
    private final Map<String, Instant> cacheExpiryTimes = new ConcurrentHashMap<>();
    
    // Configuration
    private static final long CACHE_TTL_SECONDS = 300; // 5 minutes
    private static final Set<String> ALWAYS_ALLOW_EVENTS = Set.of(
        "game_cancelled",
        "system_announcement",
        "notification"
    );

    /**
     * Determine if an event should be delivered based on filters and preferences.
     */
    public boolean shouldDeliverEvent(RealTimeEvent event) {
        try {
            // Always allow critical events
            if (ALWAYS_ALLOW_EVENTS.contains(event.getType())) {
                return true;
            }

            // Check event expiration
            if (event.isExpired()) {
                log.debug("Event {} expired, not delivering", event.getEventId());
                return false;
            }

            // Apply target-specific filtering
            switch (event.getTarget()) {
                case USER -> {
                    return shouldDeliverToUser(event);
                }
                case GAME_ROOM -> {
                    return shouldDeliverToGameRoom(event);
                }
                case GLOBAL -> {
                    return shouldDeliverGlobally(event);
                }
                case LOCATION -> {
                    return shouldDeliverToLocation(event);
                }
                default -> {
                    return true; // Allow other types by default
                }
            }

        } catch (Exception e) {
            log.error("Error filtering event {}: {}", event.getEventId(), e.getMessage());
            return false; // Fail closed for security
        }
    }

    /**
     * Check if event should be delivered to a specific user.
     */
    private boolean shouldDeliverToUser(RealTimeEvent event) {
        String username = event.getRoutingKey();
        
        // Check user preferences
        UserEventPreferences preferences = getUserPreferences(username);
        if (preferences == null) {
            return true; // Default to allow if no preferences found
        }

        // Check if user has disabled this event type
        if (preferences.isEventTypeDisabled(event.getType())) {
            log.debug("User {} has disabled event type {}", username, event.getType());
            return false;
        }

        // Check priority filtering
        if (event.getPriority().getLevel() < preferences.getMinimumPriority()) {
            log.debug("Event priority {} below user {} minimum {}", 
                     event.getPriority(), username, preferences.getMinimumPriority());
            return false;
        }

        // Check if user has blocked the event source (for user-generated events)
        if (isEventFromBlockedUser(event, username)) {
            log.debug("Event {} from blocked user for {}", event.getEventId(), username);
            return false;
        }

        return true;
    }

    /**
     * Check if event should be delivered to a game room.
     */
    private boolean shouldDeliverToGameRoom(RealTimeEvent event) {
        // For game room events, we generally deliver to all subscribers
        // Additional filtering can be added here based on game-specific rules
        
        // Check if game is still active/valid
        String gameId = event.getRoutingKey();
        if (!isGameActive(gameId)) {
            log.debug("Game {} is not active, filtering event {}", gameId, event.getEventId());
            return false;
        }

        return true;
    }

    /**
     * Check if global event should be delivered.
     */
    private boolean shouldDeliverGlobally(RealTimeEvent event) {
        // Global events are generally allowed
        // Could add system-wide filtering rules here
        return true;
    }

    /**
     * Check if location event should be delivered.
     */
    private boolean shouldDeliverToLocation(RealTimeEvent event) {
        // Location events are generally allowed
        // Could add geographic filtering rules here
        return true;
    }

    /**
     * Get user event preferences with caching.
     */
    private UserEventPreferences getUserPreferences(String username) {
        // Check cache first
        UserEventPreferences cached = userPreferencesCache.get(username);
        Instant expiry = cacheExpiryTimes.get(username);
        
        if (cached != null && expiry != null && Instant.now().isBefore(expiry)) {
            return cached;
        }

        // Load preferences (in a real implementation, this would query the database)
        UserEventPreferences preferences = loadUserPreferences(username);
        
        // Cache for future use
        userPreferencesCache.put(username, preferences);
        cacheExpiryTimes.put(username, Instant.now().plusSeconds(CACHE_TTL_SECONDS));
        
        return preferences;
    }

    /**
     * Load user preferences from the database.
     * This is a placeholder - in reality, would query NotificationPreference repository.
     */
    private UserEventPreferences loadUserPreferences(String username) {
        // Default preferences - allow all events with normal priority
        return new UserEventPreferences(
            Set.of(), // No disabled event types
            1, // Minimum priority: LOW (1)
            true, // Allow game events
            true, // Allow chat events
            true, // Allow presence events
            true  // Allow notifications
        );
    }

    /**
     * Check if event originates from a user blocked by the target user.
     */
    private boolean isEventFromBlockedUser(RealTimeEvent event, String targetUsername) {
        Set<String> blockedUsers = userBlockedUsers.get(targetUsername);
        if (blockedUsers == null || blockedUsers.isEmpty()) {
            return false;
        }

        // Extract source username from event payload (simplified)
        Object payload = event.getPayload();
        if (payload instanceof Map<?, ?> payloadMap) {
            Object sourceUser = payloadMap.get("username");
            if (sourceUser instanceof String sourceUsername) {
                return blockedUsers.contains(sourceUsername);
            }
        }

        return false;
    }

    /**
     * Check if a game is still active.
     * This is a placeholder - in reality, would query the game repository.
     */
    private boolean isGameActive(String gameId) {
        // For now, assume all games are active
        // In reality, would check game status (not CANCELLED, ARCHIVED, etc.)
        return true;
    }

    /**
     * Update user event preferences.
     */
    public void updateUserPreferences(String username, UserEventPreferences preferences) {
        userPreferencesCache.put(username, preferences);
        cacheExpiryTimes.put(username, Instant.now().plusSeconds(CACHE_TTL_SECONDS));
        log.debug("Updated event preferences for user {}", username);
    }

    /**
     * Block a user for another user.
     */
    public void blockUser(String targetUsername, String blockedUsername) {
        userBlockedUsers.computeIfAbsent(targetUsername, k -> ConcurrentHashMap.newKeySet())
                       .add(blockedUsername);
        log.debug("User {} blocked user {}", targetUsername, blockedUsername);
    }

    /**
     * Unblock a user for another user.
     */
    public void unblockUser(String targetUsername, String unblockedUsername) {
        Set<String> blocked = userBlockedUsers.get(targetUsername);
        if (blocked != null) {
            blocked.remove(unblockedUsername);
            if (blocked.isEmpty()) {
                userBlockedUsers.remove(targetUsername);
            }
        }
        log.debug("User {} unblocked user {}", targetUsername, unblockedUsername);
    }

    /**
     * Clear cache for a user (e.g., when preferences change).
     */
    public void clearUserCache(String username) {
        userPreferencesCache.remove(username);
        cacheExpiryTimes.remove(username);
        log.debug("Cleared event filter cache for user {}", username);
    }

    /**
     * Perform cache maintenance.
     */
    public void performMaintenance() {
        Instant now = Instant.now();
        
        // Remove expired cache entries
        cacheExpiryTimes.entrySet().removeIf(entry -> {
            if (now.isAfter(entry.getValue())) {
                userPreferencesCache.remove(entry.getKey());
                return true;
            }
            return false;
        });
        
        log.debug("Performed event filter cache maintenance");
    }

    /**
     * User event preferences data class.
     */
    public static class UserEventPreferences {
        private final Set<String> disabledEventTypes;
        private final int minimumPriority;
        private final boolean allowGameEvents;
        private final boolean allowChatEvents;
        private final boolean allowPresenceEvents;
        private final boolean allowNotifications;

        public UserEventPreferences(Set<String> disabledEventTypes, int minimumPriority,
                                   boolean allowGameEvents, boolean allowChatEvents,
                                   boolean allowPresenceEvents, boolean allowNotifications) {
            this.disabledEventTypes = disabledEventTypes;
            this.minimumPriority = minimumPriority;
            this.allowGameEvents = allowGameEvents;
            this.allowChatEvents = allowChatEvents;
            this.allowPresenceEvents = allowPresenceEvents;
            this.allowNotifications = allowNotifications;
        }

        public boolean isEventTypeDisabled(String eventType) {
            return disabledEventTypes.contains(eventType);
        }

        public int getMinimumPriority() {
            return minimumPriority;
        }

        public boolean isAllowGameEvents() {
            return allowGameEvents;
        }

        public boolean isAllowChatEvents() {
            return allowChatEvents;
        }

        public boolean isAllowPresenceEvents() {
            return allowPresenceEvents;
        }

        public boolean isAllowNotifications() {
            return allowNotifications;
        }
    }
}
