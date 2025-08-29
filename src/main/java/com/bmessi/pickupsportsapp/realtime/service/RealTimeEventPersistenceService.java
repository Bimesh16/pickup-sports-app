package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Service for persisting real-time events for offline users and event replay.
 * 
 * Uses Redis for fast event storage and retrieval with automatic expiration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeEventPersistenceService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    // Redis key patterns
    private static final String USER_EVENTS_KEY = "realtime:user_events:%s";
    private static final String GAME_EVENTS_KEY = "realtime:game_events:%s";
    private static final String GLOBAL_EVENTS_KEY = "realtime:global_events";
    private static final String EVENT_DATA_KEY = "realtime:event_data:%s";
    
    // TTL configurations (in seconds)
    private static final long USER_EVENTS_TTL = 7 * 24 * 3600; // 7 days
    private static final long GAME_EVENTS_TTL = 24 * 3600; // 24 hours
    private static final long GLOBAL_EVENTS_TTL = 3 * 24 * 3600; // 3 days

    /**
     * Persist a real-time event for later retrieval.
     */
    public void persistEvent(RealTimeEvent event) {
        try {
            String eventJson = objectMapper.writeValueAsString(event);
            String eventDataKey = String.format(EVENT_DATA_KEY, event.getEventId());
            
            // Store event data with TTL
            long ttl = event.getTtlSeconds() != null ? event.getTtlSeconds() : getDefaultTtl(event);
            redisTemplate.opsForValue().set(eventDataKey, eventJson, ttl, TimeUnit.SECONDS);
            
            // Add event to appropriate indexes based on target type
            switch (event.getTarget()) {
                case USER -> indexUserEvent(event, ttl);
                case GAME_ROOM -> indexGameEvent(event, ttl);
                case GLOBAL -> indexGlobalEvent(event, ttl);
                default -> {
                    // For other types, we'll just store the event data
                    log.debug("Event {} stored without indexing for target type: {}", 
                             event.getEventId(), event.getTarget());
                }
            }
            
            log.debug("Persisted event: {} with TTL: {} seconds", event.getEventId(), ttl);
            
        } catch (JsonProcessingException e) {
            log.error("Error serializing event {}: {}", event.getEventId(), e.getMessage());
        } catch (Exception e) {
            log.error("Error persisting event {}: {}", event.getEventId(), e.getMessage());
        }
    }

    /**
     * Store an event for a specific offline user.
     */
    public void storeForOfflineUser(String username, RealTimeEvent event) {
        try {
            String userEventsKey = String.format(USER_EVENTS_KEY, username);
            
            // Add event ID to user's event set with score as timestamp
            double score = event.getTimestamp().toEpochMilli();
            redisTemplate.opsForZSet().add(userEventsKey, event.getEventId(), score);
            
            // Set TTL on the user events set
            redisTemplate.expire(userEventsKey, USER_EVENTS_TTL, TimeUnit.SECONDS);
            
            log.debug("Stored event {} for offline user {}", event.getEventId(), username);
            
        } catch (Exception e) {
            log.error("Error storing event {} for user {}: {}", 
                     event.getEventId(), username, e.getMessage());
        }
    }

    /**
     * Get events for a user since a specific timestamp.
     */
    public List<RealTimeEvent> getEventsForUser(String username, Instant since) {
        List<RealTimeEvent> events = new ArrayList<>();
        
        try {
            String userEventsKey = String.format(USER_EVENTS_KEY, username);
            double sinceScore = since.toEpochMilli();
            double nowScore = Instant.now().toEpochMilli();
            
            // Get event IDs since the timestamp
            Set<String> eventIds = redisTemplate.opsForZSet()
                                               .rangeByScore(userEventsKey, sinceScore, nowScore);
            
            if (eventIds == null || eventIds.isEmpty()) {
                return events;
            }
            
            // Retrieve event data for each ID
            for (String eventId : eventIds) {
                RealTimeEvent event = getEventById(eventId);
                if (event != null && !event.isExpired()) {
                    events.add(event);
                }
            }
            
            log.debug("Retrieved {} events for user {} since {}", events.size(), username, since);
            
        } catch (Exception e) {
            log.error("Error retrieving events for user {}: {}", username, e.getMessage());
        }
        
        return events;
    }

    /**
     * Get recent events for a game.
     */
    public List<RealTimeEvent> getGameEvents(String gameId, Instant since, int limit) {
        List<RealTimeEvent> events = new ArrayList<>();
        
        try {
            String gameEventsKey = String.format(GAME_EVENTS_KEY, gameId);
            double sinceScore = since.toEpochMilli();
            double nowScore = Instant.now().toEpochMilli();
            
            // Get event IDs since the timestamp (with limit)
            Set<String> eventIds = redisTemplate.opsForZSet()
                                               .reverseRangeByScore(gameEventsKey, sinceScore, nowScore, 0, limit);
            
            if (eventIds == null || eventIds.isEmpty()) {
                return events;
            }
            
            // Retrieve event data for each ID
            for (String eventId : eventIds) {
                RealTimeEvent event = getEventById(eventId);
                if (event != null && !event.isExpired()) {
                    events.add(event);
                }
            }
            
            log.debug("Retrieved {} events for game {} since {}", events.size(), gameId, since);
            
        } catch (Exception e) {
            log.error("Error retrieving events for game {}: {}", gameId, e.getMessage());
        }
        
        return events;
    }

    /**
     * Get recent global events.
     */
    public List<RealTimeEvent> getGlobalEvents(Instant since, int limit) {
        List<RealTimeEvent> events = new ArrayList<>();
        
        try {
            double sinceScore = since.toEpochMilli();
            double nowScore = Instant.now().toEpochMilli();
            
            // Get event IDs since the timestamp (with limit)
            Set<String> eventIds = redisTemplate.opsForZSet()
                                               .reverseRangeByScore(GLOBAL_EVENTS_KEY, sinceScore, nowScore, 0, limit);
            
            if (eventIds == null || eventIds.isEmpty()) {
                return events;
            }
            
            // Retrieve event data for each ID
            for (String eventId : eventIds) {
                RealTimeEvent event = getEventById(eventId);
                if (event != null && !event.isExpired()) {
                    events.add(event);
                }
            }
            
            log.debug("Retrieved {} global events since {}", events.size(), since);
            
        } catch (Exception e) {
            log.error("Error retrieving global events: {}", e.getMessage());
        }
        
        return events;
    }

    /**
     * Get a specific event by ID.
     */
    public RealTimeEvent getEventById(String eventId) {
        try {
            String eventDataKey = String.format(EVENT_DATA_KEY, eventId);
            String eventJson = redisTemplate.opsForValue().get(eventDataKey);
            
            if (eventJson == null) {
                return null;
            }
            
            return objectMapper.readValue(eventJson, RealTimeEvent.class);
            
        } catch (Exception e) {
            log.error("Error retrieving event {}: {}", eventId, e.getMessage());
            return null;
        }
    }

    /**
     * Clean up expired events and perform maintenance.
     */
    public void performMaintenance() {
        try {
            Instant cutoff = Instant.now().minus(java.time.Duration.ofDays(7));
            double cutoffScore = cutoff.toEpochMilli();
            
            // Clean up old events from indexes
            cleanupExpiredEvents(GLOBAL_EVENTS_KEY, cutoffScore);
            
            // Clean up user event indexes (this is a more complex operation in production)
            // For now, we rely on Redis TTL for automatic cleanup
            
            log.debug("Performed event persistence maintenance");
            
        } catch (Exception e) {
            log.error("Error during persistence maintenance: {}", e.getMessage());
        }
    }

    /**
     * Index an event for a user.
     */
    private void indexUserEvent(RealTimeEvent event, long ttl) {
        String username = event.getRoutingKey();
        String userEventsKey = String.format(USER_EVENTS_KEY, username);
        
        double score = event.getTimestamp().toEpochMilli();
        redisTemplate.opsForZSet().add(userEventsKey, event.getEventId(), score);
        redisTemplate.expire(userEventsKey, ttl, TimeUnit.SECONDS);
    }

    /**
     * Index an event for a game.
     */
    private void indexGameEvent(RealTimeEvent event, long ttl) {
        String gameId = event.getRoutingKey();
        String gameEventsKey = String.format(GAME_EVENTS_KEY, gameId);
        
        double score = event.getTimestamp().toEpochMilli();
        redisTemplate.opsForZSet().add(gameEventsKey, event.getEventId(), score);
        redisTemplate.expire(gameEventsKey, ttl, TimeUnit.SECONDS);
    }

    /**
     * Index a global event.
     */
    private void indexGlobalEvent(RealTimeEvent event, long ttl) {
        double score = event.getTimestamp().toEpochMilli();
        redisTemplate.opsForZSet().add(GLOBAL_EVENTS_KEY, event.getEventId(), score);
        redisTemplate.expire(GLOBAL_EVENTS_KEY, ttl, TimeUnit.SECONDS);
    }

    /**
     * Get default TTL based on event type.
     */
    private long getDefaultTtl(RealTimeEvent event) {
        return switch (event.getTarget()) {
            case USER -> USER_EVENTS_TTL;
            case GAME_ROOM -> GAME_EVENTS_TTL;
            case GLOBAL -> GLOBAL_EVENTS_TTL;
            default -> 86400L; // 24 hours default
        };
    }

    /**
     * Clean up expired events from an index.
     */
    private void cleanupExpiredEvents(String indexKey, double cutoffScore) {
        try {
            Long removed = redisTemplate.opsForZSet().removeRangeByScore(indexKey, 0, cutoffScore);
            if (removed != null && removed > 0) {
                log.debug("Cleaned up {} expired events from index {}", removed, indexKey);
            }
        } catch (Exception e) {
            log.error("Error cleaning up expired events from {}: {}", indexKey, e.getMessage());
        }
    }
}
