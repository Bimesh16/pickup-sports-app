package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.ActivityFeedEvent;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service for managing real-time activity feeds and notifications.
 * 
 * Provides:
 * - Global activity feed
 * - User-specific activity feeds
 * - Real-time notifications
 * - Activity aggregation and filtering
 * - Feed personalization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeActivityFeedService {

    private final RealTimeEventService realTimeEventService;
    private final RealTimeEventPersistenceService persistenceService;
    private final RedisTemplate<String, String> redisTemplate;
    
    // Local caches
    private final Map<String, List<ActivityItem>> userFeedCache = new ConcurrentHashMap<>();
    private final Map<String, Instant> feedCacheExpiry = new ConcurrentHashMap<>();
    
    // Redis keys
    private static final String GLOBAL_FEED_KEY = "activity:global";
    private static final String USER_FEED_KEY = "activity:user:%s";
    private static final String USER_PREFERENCES_KEY = "activity:prefs:%s";
    private static final String FEED_STATS_KEY = "activity:stats";
    
    // Configuration
    private static final int MAX_FEED_ITEMS = 100;
    private static final int CACHE_TTL_MINUTES = 5;
    private static final int REDIS_FEED_TTL_HOURS = 24;

    /**
     * Create and publish an activity feed item.
     */
    public void createActivity(String actorUsername, String action, String entityType, 
                             Long entityId, String description, Map<String, Object> metadata) {
        try {
            // Create activity feed event
            ActivityFeedEvent activityEvent = new ActivityFeedEvent(
                actorUsername, action, entityType, entityId, description);
            
            // Add metadata if provided
            if (metadata != null && !metadata.isEmpty()) {
                // In a real implementation, you'd extend ActivityFeedEvent to support metadata
                log.debug("Activity metadata: {}", metadata);
            }
            
            // Publish to real-time system
            realTimeEventService.publishEvent(activityEvent);
            
            // Store in persistent storage
            storeActivityItem(activityEvent);
            
            // Update user feeds
            updateUserFeeds(activityEvent);
            
            // Create notifications for relevant users
            createActivityNotifications(activityEvent);
            
            log.debug("Created activity: {} performed {} on {} {}", 
                     actorUsername, action, entityType, entityId);
            
        } catch (Exception e) {
            log.error("Error creating activity for user {}: {}", actorUsername, e.getMessage());
        }
    }

    /**
     * Get global activity feed.
     */
    public List<ActivityItem> getGlobalActivityFeed(int limit, Instant since) {
        try {
            List<ActivityItem> activities = new ArrayList<>();
            
            // Get from Redis first
            activities.addAll(getActivitiesFromRedis(GLOBAL_FEED_KEY, limit, since));
            
            // If not enough items, get from persistent storage
            if (activities.size() < limit) {
                List<RealTimeEvent> persistedEvents = persistenceService.getGlobalEvents(
                    since != null ? since : Instant.now().minus(24, ChronoUnit.HOURS), 
                    limit - activities.size()
                );
                
                activities.addAll(convertEventsToActivityItems(persistedEvents));
            }
            
            // Sort by timestamp and limit
            return activities.stream()
                           .sorted((a, b) -> b.timestamp.compareTo(a.timestamp))
                           .limit(limit)
                           .collect(Collectors.toList());
                           
        } catch (Exception e) {
            log.error("Error getting global activity feed: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get personalized activity feed for a user.
     */
    public List<ActivityItem> getUserActivityFeed(String username, int limit, Instant since) {
        try {
            // Check cache first
            String cacheKey = username + ":" + limit + ":" + (since != null ? since.toString() : "");
            List<ActivityItem> cached = userFeedCache.get(cacheKey);
            Instant expiry = feedCacheExpiry.get(cacheKey);
            
            if (cached != null && expiry != null && Instant.now().isBefore(expiry)) {
                return cached;
            }
            
            // Build personalized feed
            List<ActivityItem> activities = buildPersonalizedFeed(username, limit, since);
            
            // Cache the result
            userFeedCache.put(cacheKey, activities);
            feedCacheExpiry.put(cacheKey, Instant.now().plus(CACHE_TTL_MINUTES, ChronoUnit.MINUTES));
            
            return activities;
            
        } catch (Exception e) {
            log.error("Error getting user activity feed for {}: {}", username, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get activity feed for games a user is involved in.
     */
    public List<ActivityItem> getUserGameActivityFeed(String username, int limit) {
        try {
            // This would typically query for games the user is participating in
            // and get activities related to those games
            
            Instant since = Instant.now().minus(7, ChronoUnit.DAYS);
            List<ActivityItem> allActivities = getGlobalActivityFeed(limit * 2, since);
            
            // Filter for game-related activities
            // In a real implementation, you'd filter based on user's game memberships
            return allActivities.stream()
                              .filter(activity -> "GAME".equals(activity.entityType))
                              .limit(limit)
                              .collect(Collectors.toList());
                              
        } catch (Exception e) {
            log.error("Error getting game activity feed for user {}: {}", username, e.getMessage());
            return List.of();
        }
    }

    /**
     * Create a real-time notification for important activity.
     */
    public void createActivityNotification(String targetUsername, String title, String message, 
                                         String activityType, String clickUrl) {
        try {
            NotificationEvent notificationEvent = new NotificationEvent(
                targetUsername, title, message, activityType, clickUrl);
            
            realTimeEventService.publishEvent(notificationEvent);
            
            log.debug("Created activity notification for user {}: {}", targetUsername, title);
            
        } catch (Exception e) {
            log.error("Error creating activity notification for user {}: {}", 
                     targetUsername, e.getMessage());
        }
    }

    /**
     * Update user activity preferences.
     */
    public void updateUserActivityPreferences(String username, ActivityPreferences preferences) {
        try {
            String prefsKey = String.format(USER_PREFERENCES_KEY, username);
            
            Map<String, String> prefsData = Map.of(
                "enabledActions", String.join(",", preferences.enabledActions),
                "enabledEntityTypes", String.join(",", preferences.enabledEntityTypes),
                "maxItemsPerDay", String.valueOf(preferences.maxItemsPerDay),
                "enableNotifications", String.valueOf(preferences.enableNotifications),
                "updatedAt", Instant.now().toString()
            );
            
            redisTemplate.opsForHash().putAll(prefsKey, prefsData);
            redisTemplate.expire(prefsKey, 30, TimeUnit.DAYS);
            
            // Clear user's feed cache
            clearUserFeedCache(username);
            
            log.debug("Updated activity preferences for user {}", username);
            
        } catch (Exception e) {
            log.error("Error updating activity preferences for user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Get activity statistics.
     */
    public Map<String, Object> getActivityStats() {
        try {
            Map<Object, Object> stats = redisTemplate.opsForHash().entries(FEED_STATS_KEY);
            
            Map<String, Object> result = new HashMap<>();
            stats.forEach((key, value) -> result.put(key.toString(), value));
            
            // Add current metrics
            result.put("totalCachedFeeds", userFeedCache.size());
            result.put("cacheHitRate", calculateCacheHitRate());
            result.put("lastUpdated", Instant.now());
            
            return result;
            
        } catch (Exception e) {
            log.error("Error getting activity stats: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Store activity item in Redis.
     */
    private void storeActivityItem(ActivityFeedEvent event) {
        try {
            ActivityItem item = new ActivityItem(
                event.getEventId(),
                ((ActivityFeedEvent.ActivityFeedPayload) event.getPayload()).actorUsername,
                ((ActivityFeedEvent.ActivityFeedPayload) event.getPayload()).action,
                ((ActivityFeedEvent.ActivityFeedPayload) event.getPayload()).entityType,
                ((ActivityFeedEvent.ActivityFeedPayload) event.getPayload()).entityId,
                ((ActivityFeedEvent.ActivityFeedPayload) event.getPayload()).description,
                event.getTimestamp()
            );
            
            // Store in global feed
            double score = event.getTimestamp().toEpochMilli();
            String itemJson = serializeActivityItem(item);
            
            redisTemplate.opsForZSet().add(GLOBAL_FEED_KEY, itemJson, score);
            redisTemplate.expire(GLOBAL_FEED_KEY, REDIS_FEED_TTL_HOURS, TimeUnit.HOURS);
            
            // Trim to max items
            long currentSize = redisTemplate.opsForZSet().size(GLOBAL_FEED_KEY);
            if (currentSize > MAX_FEED_ITEMS) {
                long removeCount = currentSize - MAX_FEED_ITEMS;
                redisTemplate.opsForZSet().removeRange(GLOBAL_FEED_KEY, 0, removeCount - 1);
            }
            
            // Update stats
            redisTemplate.opsForHash().increment(FEED_STATS_KEY, "totalActivities", 1);
            redisTemplate.opsForHash().increment(FEED_STATS_KEY, "action:" + item.action, 1);
            
        } catch (Exception e) {
            log.error("Error storing activity item: {}", e.getMessage());
        }
    }

    /**
     * Update user-specific feeds based on activity.
     */
    private void updateUserFeeds(ActivityFeedEvent event) {
        try {
            // This would typically determine which users should see this activity
            // based on their relationships, game memberships, etc.
            
            // For now, just clear all user caches to force refresh
            clearAllUserFeedCaches();
            
        } catch (Exception e) {
            log.error("Error updating user feeds: {}", e.getMessage());
        }
    }

    /**
     * Create notifications for relevant users based on activity.
     */
    private void createActivityNotifications(ActivityFeedEvent event) {
        try {
            ActivityFeedEvent.ActivityFeedPayload payload = 
                (ActivityFeedEvent.ActivityFeedPayload) event.getPayload();
            
            // Create notifications for specific actions
            switch (payload.action) {
                case "JOINED_GAME" -> {
                    // Notify game creator
                    createActivityNotification(
                        "game_creator", // Would be actual creator username
                        "New Player Joined",
                        payload.actorUsername + " joined your game",
                        "GAME_ACTIVITY",
                        "/games/" + payload.entityId
                    );
                }
                case "CANCELLED_GAME" -> {
                    // Notify all participants
                    createActivityNotification(
                        "all_participants", // Would be actual participant usernames
                        "Game Cancelled",
                        "A game you're participating in was cancelled",
                        "GAME_CANCELLATION",
                        "/games/" + payload.entityId
                    );
                }
                // Add more notification cases as needed
            }
            
        } catch (Exception e) {
            log.error("Error creating activity notifications: {}", e.getMessage());
        }
    }

    /**
     * Build personalized feed for a user.
     */
    private List<ActivityItem> buildPersonalizedFeed(String username, int limit, Instant since) {
        try {
            // Get user preferences
            ActivityPreferences prefs = getUserActivityPreferences(username);
            
            // Get all activities
            List<ActivityItem> allActivities = getGlobalActivityFeed(limit * 2, since);
            
            // Filter based on preferences
            return allActivities.stream()
                              .filter(activity -> prefs.enabledActions.contains(activity.action))
                              .filter(activity -> prefs.enabledEntityTypes.contains(activity.entityType))
                              .limit(limit)
                              .collect(Collectors.toList());
                              
        } catch (Exception e) {
            log.error("Error building personalized feed for user {}: {}", username, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get user activity preferences.
     */
    private ActivityPreferences getUserActivityPreferences(String username) {
        try {
            String prefsKey = String.format(USER_PREFERENCES_KEY, username);
            Map<Object, Object> prefsData = redisTemplate.opsForHash().entries(prefsKey);
            
            if (prefsData.isEmpty()) {
                // Return default preferences
                return new ActivityPreferences(
                    Set.of("JOINED_GAME", "CREATED_GAME", "CANCELLED_GAME"),
                    Set.of("GAME", "USER"),
                    50,
                    true
                );
            }
            
            Set<String> enabledActions = Set.of(
                ((String) prefsData.getOrDefault("enabledActions", "")).split(","));
            Set<String> enabledEntityTypes = Set.of(
                ((String) prefsData.getOrDefault("enabledEntityTypes", "")).split(","));
            int maxItemsPerDay = Integer.parseInt(
                (String) prefsData.getOrDefault("maxItemsPerDay", "50"));
            boolean enableNotifications = Boolean.parseBoolean(
                (String) prefsData.getOrDefault("enableNotifications", "true"));
            
            return new ActivityPreferences(enabledActions, enabledEntityTypes, 
                                         maxItemsPerDay, enableNotifications);
                                         
        } catch (Exception e) {
            log.error("Error getting activity preferences for user {}: {}", username, e.getMessage());
            return new ActivityPreferences(Set.of(), Set.of(), 50, true);
        }
    }

    /**
     * Helper methods and utility functions.
     */
    private List<ActivityItem> getActivitiesFromRedis(String key, int limit, Instant since) {
        // Implementation for getting activities from Redis
        return List.of();
    }

    private List<ActivityItem> convertEventsToActivityItems(List<RealTimeEvent> events) {
        // Implementation for converting events to activity items
        return List.of();
    }

    private String serializeActivityItem(ActivityItem item) {
        // Implementation for serializing activity items
        return "";
    }

    private void clearUserFeedCache(String username) {
        userFeedCache.entrySet().removeIf(entry -> entry.getKey().startsWith(username + ":"));
        feedCacheExpiry.entrySet().removeIf(entry -> entry.getKey().startsWith(username + ":"));
    }

    private void clearAllUserFeedCaches() {
        userFeedCache.clear();
        feedCacheExpiry.clear();
    }

    private double calculateCacheHitRate() {
        // Implementation for calculating cache hit rate
        return 0.0;
    }

    /**
     * Perform cleanup of activity feed data.
     */
    public void performCleanup() {
        try {
            Instant now = Instant.now();
            Instant cacheExpiry = now.minus(CACHE_TTL_MINUTES, ChronoUnit.MINUTES);
            
            // Clean up expired cache entries
            feedCacheExpiry.entrySet().removeIf(entry -> {
                if (now.isAfter(entry.getValue())) {
                    userFeedCache.remove(entry.getKey());
                    return true;
                }
                return false;
            });
            
            log.debug("Performed activity feed cleanup");
            
        } catch (Exception e) {
            log.error("Error during activity feed cleanup: {}", e.getMessage());
        }
    }

    /**
     * Data classes for activity items and preferences.
     */
    public static class ActivityItem {
        public final String id;
        public final String actorUsername;
        public final String action;
        public final String entityType;
        public final Long entityId;
        public final String description;
        public final Instant timestamp;

        public ActivityItem(String id, String actorUsername, String action, String entityType,
                          Long entityId, String description, Instant timestamp) {
            this.id = id;
            this.actorUsername = actorUsername;
            this.action = action;
            this.entityType = entityType;
            this.entityId = entityId;
            this.description = description;
            this.timestamp = timestamp;
        }
    }

    public static class ActivityPreferences {
        public final Set<String> enabledActions;
        public final Set<String> enabledEntityTypes;
        public final int maxItemsPerDay;
        public final boolean enableNotifications;

        public ActivityPreferences(Set<String> enabledActions, Set<String> enabledEntityTypes,
                                 int maxItemsPerDay, boolean enableNotifications) {
            this.enabledActions = enabledActions;
            this.enabledEntityTypes = enabledEntityTypes;
            this.maxItemsPerDay = maxItemsPerDay;
            this.enableNotifications = enableNotifications;
        }
    }
}