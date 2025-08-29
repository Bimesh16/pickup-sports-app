package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.UserPresenceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Enhanced presence service that tracks user activity and online status
 * across the real-time system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedPresenceService {

    private final RedisTemplate<String, String> redisTemplate;
    private final RealTimeEventService realTimeEventService;
    
    // Local cache for quick presence checks
    private final Map<String, UserPresenceInfo> localPresenceCache = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> gameViewers = new ConcurrentHashMap<>();
    private final Map<String, Instant> lastHeartbeat = new ConcurrentHashMap<>();
    
    // Redis keys
    private static final String USER_PRESENCE_KEY = "presence:user:%s";
    private static final String GAME_VIEWERS_KEY = "presence:game:%s:viewers";
    private static final String GLOBAL_ONLINE_KEY = "presence:global:online";
    
    // Configuration
    private static final long PRESENCE_TTL_SECONDS = 300; // 5 minutes
    private static final long HEARTBEAT_TIMEOUT_SECONDS = 60; // 1 minute
    private static final long CLEANUP_INTERVAL_SECONDS = 30; // 30 seconds

    /**
     * Update user presence status.
     */
    public void updatePresence(String username, UserPresenceEvent.PresenceStatus status, Long gameId) {
        try {
            Instant now = Instant.now();
            
            // Update local cache
            UserPresenceInfo presenceInfo = new UserPresenceInfo(username, status, gameId, now);
            localPresenceCache.put(username, presenceInfo);
            lastHeartbeat.put(username, now);
            
            // Update Redis
            String userPresenceKey = String.format(USER_PRESENCE_KEY, username);
            Map<String, String> presenceData = Map.of(
                "status", status.toString(),
                "gameId", gameId != null ? gameId.toString() : "",
                "lastSeen", now.toString(),
                "timestamp", String.valueOf(now.toEpochMilli())
            );
            
            redisTemplate.opsForHash().putAll(userPresenceKey, presenceData);
            redisTemplate.expire(userPresenceKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
            
            // Update global online set
            if (status == UserPresenceEvent.PresenceStatus.ONLINE || 
                status == UserPresenceEvent.PresenceStatus.VIEWING_GAME) {
                redisTemplate.opsForSet().add(GLOBAL_ONLINE_KEY, username);
                redisTemplate.expire(GLOBAL_ONLINE_KEY, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
            } else {
                redisTemplate.opsForSet().remove(GLOBAL_ONLINE_KEY, username);
            }
            
            // Update game viewers
            if (gameId != null) {
                if (status == UserPresenceEvent.PresenceStatus.VIEWING_GAME) {
                    String gameViewersKey = String.format(GAME_VIEWERS_KEY, gameId);
                    redisTemplate.opsForSet().add(gameViewersKey, username);
                    redisTemplate.expire(gameViewersKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
                    
                    // Update local cache
                    gameViewers.computeIfAbsent(gameId.toString(), k -> ConcurrentHashMap.newKeySet()).add(username);
                } else {
                    // Remove from all games if going offline
                    gameViewers.values().forEach(viewers -> viewers.remove(username));
                    
                    String gameViewersKey = String.format(GAME_VIEWERS_KEY, gameId);
                    redisTemplate.opsForSet().remove(gameViewersKey, username);
                }
            }
            
            // Publish presence event
            long onlineCount = getOnlineUserCount();
            UserPresenceEvent presenceEvent = new UserPresenceEvent(gameId, username, status, onlineCount);
            realTimeEventService.publishEvent(presenceEvent);
            
            log.debug("Updated presence for user {} to {} (game: {}, online: {})", 
                     username, status, gameId, onlineCount);
                     
        } catch (Exception e) {
            log.error("Error updating presence for user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Record user heartbeat to keep them marked as online.
     */
    public void recordHeartbeat(String username, Long gameId) {
        UserPresenceEvent.PresenceStatus currentStatus = getCurrentStatus(username);
        if (currentStatus == null) {
            currentStatus = UserPresenceEvent.PresenceStatus.ONLINE;
        }
        
        updatePresence(username, currentStatus, gameId);
    }

    /**
     * Mark user as offline.
     */
    public void markUserOffline(String username) {
        try {
            // Get current game ID for the user
            UserPresenceInfo currentPresence = localPresenceCache.get(username);
            Long gameId = currentPresence != null ? currentPresence.gameId : null;
            
            updatePresence(username, UserPresenceEvent.PresenceStatus.OFFLINE, gameId);
            
            // Clean up local caches
            localPresenceCache.remove(username);
            lastHeartbeat.remove(username);
            gameViewers.values().forEach(viewers -> viewers.remove(username));
            
            log.debug("Marked user {} as offline", username);
            
        } catch (Exception e) {
            log.error("Error marking user {} offline: {}", username, e.getMessage());
        }
    }

    /**
     * Check if a user is currently online.
     */
    public boolean isUserOnline(String username) {
        try {
            // Check local cache first
            UserPresenceInfo localInfo = localPresenceCache.get(username);
            if (localInfo != null && 
                localInfo.lastSeen.isAfter(Instant.now().minusSeconds(HEARTBEAT_TIMEOUT_SECONDS))) {
                return localInfo.status == UserPresenceEvent.PresenceStatus.ONLINE ||
                       localInfo.status == UserPresenceEvent.PresenceStatus.VIEWING_GAME;
            }
            
            // Check Redis
            String userPresenceKey = String.format(USER_PRESENCE_KEY, username);
            Map<Object, Object> presenceData = redisTemplate.opsForHash().entries(userPresenceKey);
            
            if (presenceData.isEmpty()) {
                return false;
            }
            
            String statusStr = (String) presenceData.get("status");
            String timestampStr = (String) presenceData.get("timestamp");
            
            if (statusStr == null || timestampStr == null) {
                return false;
            }
            
            UserPresenceEvent.PresenceStatus status = UserPresenceEvent.PresenceStatus.valueOf(statusStr);
            Instant lastSeen = Instant.ofEpochMilli(Long.parseLong(timestampStr));
            
            return (status == UserPresenceEvent.PresenceStatus.ONLINE ||
                    status == UserPresenceEvent.PresenceStatus.VIEWING_GAME) &&
                   lastSeen.isAfter(Instant.now().minusSeconds(HEARTBEAT_TIMEOUT_SECONDS));
                   
        } catch (Exception e) {
            log.error("Error checking if user {} is online: {}", username, e.getMessage());
            return false;
        }
    }

    /**
     * Get current status for a user.
     */
    public UserPresenceEvent.PresenceStatus getCurrentStatus(String username) {
        try {
            UserPresenceInfo localInfo = localPresenceCache.get(username);
            if (localInfo != null) {
                return localInfo.status;
            }
            
            String userPresenceKey = String.format(USER_PRESENCE_KEY, username);
            String statusStr = (String) redisTemplate.opsForHash().get(userPresenceKey, "status");
            
            return statusStr != null ? UserPresenceEvent.PresenceStatus.valueOf(statusStr) : null;
            
        } catch (Exception e) {
            log.error("Error getting status for user {}: {}", username, e.getMessage());
            return null;
        }
    }

    /**
     * Get total count of online users.
     */
    public long getOnlineUserCount() {
        try {
            Long count = redisTemplate.opsForSet().size(GLOBAL_ONLINE_KEY);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.error("Error getting online user count: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * Get users currently viewing a specific game.
     */
    public Set<String> getGameViewers(Long gameId) {
        try {
            String gameViewersKey = String.format(GAME_VIEWERS_KEY, gameId);
            Set<String> viewers = redisTemplate.opsForSet().members(gameViewersKey);
            return viewers != null ? viewers : Set.of();
        } catch (Exception e) {
            log.error("Error getting viewers for game {}: {}", gameId, e.getMessage());
            return Set.of();
        }
    }

    /**
     * Get count of users viewing a specific game.
     */
    public long getGameViewerCount(Long gameId) {
        try {
            String gameViewersKey = String.format(GAME_VIEWERS_KEY, gameId);
            Long count = redisTemplate.opsForSet().size(gameViewersKey);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.error("Error getting viewer count for game {}: {}", gameId, e.getMessage());
            return 0L;
        }
    }

    /**
     * Get all online users.
     */
    public Set<String> getOnlineUsers() {
        try {
            Set<String> users = redisTemplate.opsForSet().members(GLOBAL_ONLINE_KEY);
            return users != null ? users : Set.of();
        } catch (Exception e) {
            log.error("Error getting online users: {}", e.getMessage());
            return Set.of();
        }
    }

    /**
     * Get detailed presence information for a user.
     */
    public Map<String, Object> getUserPresenceDetails(String username) {
        try {
            String userPresenceKey = String.format(USER_PRESENCE_KEY, username);
            Map<Object, Object> presenceData = redisTemplate.opsForHash().entries(userPresenceKey);
            
            if (presenceData.isEmpty()) {
                return Map.of("online", false);
            }
            
            return Map.of(
                "online", isUserOnline(username),
                "status", presenceData.getOrDefault("status", "UNKNOWN"),
                "gameId", presenceData.getOrDefault("gameId", ""),
                "lastSeen", presenceData.getOrDefault("lastSeen", ""),
                "timestamp", presenceData.getOrDefault("timestamp", "")
            );
            
        } catch (Exception e) {
            log.error("Error getting presence details for user {}: {}", username, e.getMessage());
            return Map.of("online", false, "error", e.getMessage());
        }
    }

    /**
     * Perform cleanup of stale presence data.
     */
    public void performCleanup() {
        try {
            Instant cutoff = Instant.now().minusSeconds(HEARTBEAT_TIMEOUT_SECONDS);
            
            // Clean up local cache
            localPresenceCache.entrySet().removeIf(entry -> 
                entry.getValue().lastSeen.isBefore(cutoff));
            
            lastHeartbeat.entrySet().removeIf(entry -> 
                entry.getValue().isBefore(cutoff));
            
            // Clean up game viewers
            gameViewers.entrySet().removeIf(entry -> {
                entry.getValue().removeIf(username -> {
                    Instant lastSeen = lastHeartbeat.get(username);
                    return lastSeen == null || lastSeen.isBefore(cutoff);
                });
                return entry.getValue().isEmpty();
            });
            
            log.debug("Performed presence cleanup, removed stale data older than {}", cutoff);
            
        } catch (Exception e) {
            log.error("Error during presence cleanup: {}", e.getMessage());
        }
    }

    /**
     * Get comprehensive presence metrics.
     */
    public Map<String, Object> getPresenceMetrics() {
        try {
            return Map.of(
                "totalOnlineUsers", getOnlineUserCount(),
                "localCacheSize", localPresenceCache.size(),
                "activeGameViewers", gameViewers.size(),
                "lastCleanup", Instant.now(),
                "heartbeatTimeout", HEARTBEAT_TIMEOUT_SECONDS,
                "presenceTtl", PRESENCE_TTL_SECONDS
            );
        } catch (Exception e) {
            log.error("Error getting presence metrics: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * User presence information data class.
     */
    private static class UserPresenceInfo {
        final String username;
        final UserPresenceEvent.PresenceStatus status;
        final Long gameId;
        final Instant lastSeen;

        UserPresenceInfo(String username, UserPresenceEvent.PresenceStatus status, 
                        Long gameId, Instant lastSeen) {
            this.username = username;
            this.status = status;
            this.gameId = gameId;
            this.lastSeen = lastSeen;
        }
    }
}
