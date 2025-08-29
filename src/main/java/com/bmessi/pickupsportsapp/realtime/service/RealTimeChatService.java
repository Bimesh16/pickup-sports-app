package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.ChatMessageEvent;
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
 * Enhanced chat service with real-time features.
 * 
 * Provides:
 * - Typing indicators
 * - Message read receipts
 * - User presence in chat
 * - Message delivery status
 * - Chat activity tracking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeChatService {

    private final RealTimeEventService realTimeEventService;
    private final EnhancedPresenceService presenceService;
    private final RedisTemplate<String, String> redisTemplate;
    
    // Local cache for typing indicators
    private final Map<String, Set<String>> gameTypingUsers = new ConcurrentHashMap<>();
    private final Map<String, Instant> userLastTyping = new ConcurrentHashMap<>();
    
    // Redis keys
    private static final String TYPING_KEY = "chat:typing:game:%s";
    private static final String LAST_READ_KEY = "chat:last_read:game:%s:user:%s";
    private static final String MESSAGE_DELIVERY_KEY = "chat:delivery:%s";
    
    // Configuration
    private static final long TYPING_TIMEOUT_SECONDS = 10;
    private static final long TYPING_CLEANUP_INTERVAL_SECONDS = 5;

    /**
     * Handle user starting to type in a game chat.
     */
    public void startTyping(Long gameId, String username) {
        try {
            String gameKey = gameId.toString();
            Instant now = Instant.now();
            
            // Update local cache
            gameTypingUsers.computeIfAbsent(gameKey, k -> ConcurrentHashMap.newKeySet()).add(username);
            userLastTyping.put(username + ":" + gameKey, now);
            
            // Update Redis
            String redisKey = String.format(TYPING_KEY, gameId);
            redisTemplate.opsForSet().add(redisKey, username);
            redisTemplate.expire(redisKey, TYPING_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            // Update user presence to typing
            presenceService.updatePresence(username, UserPresenceEvent.PresenceStatus.TYPING, gameId);
            
            // Broadcast typing event to other users in the game
            ChatTypingEvent typingEvent = new ChatTypingEvent(gameId, username, true);
            realTimeEventService.publishEvent(typingEvent);
            
            log.debug("User {} started typing in game {}", username, gameId);
            
        } catch (Exception e) {
            log.error("Error handling start typing for user {} in game {}: {}", 
                     username, gameId, e.getMessage());
        }
    }

    /**
     * Handle user stopping typing in a game chat.
     */
    public void stopTyping(Long gameId, String username) {
        try {
            String gameKey = gameId.toString();
            
            // Update local cache
            Set<String> typingUsers = gameTypingUsers.get(gameKey);
            if (typingUsers != null) {
                typingUsers.remove(username);
                if (typingUsers.isEmpty()) {
                    gameTypingUsers.remove(gameKey);
                }
            }
            
            userLastTyping.remove(username + ":" + gameKey);
            
            // Update Redis
            String redisKey = String.format(TYPING_KEY, gameId);
            redisTemplate.opsForSet().remove(redisKey, username);
            
            // Update user presence back to viewing game
            presenceService.updatePresence(username, UserPresenceEvent.PresenceStatus.VIEWING_GAME, gameId);
            
            // Broadcast typing stopped event
            ChatTypingEvent typingEvent = new ChatTypingEvent(gameId, username, false);
            realTimeEventService.publishEvent(typingEvent);
            
            log.debug("User {} stopped typing in game {}", username, gameId);
            
        } catch (Exception e) {
            log.error("Error handling stop typing for user {} in game {}: {}", 
                     username, gameId, e.getMessage());
        }
    }

    /**
     * Handle new chat message and broadcast it.
     */
    public void broadcastChatMessage(Long gameId, String username, String message, String messageId) {
        try {
            // Stop typing for this user
            stopTyping(gameId, username);
            
            // Create and publish chat message event
            ChatMessageEvent messageEvent = new ChatMessageEvent(gameId, username, message, messageId);
            realTimeEventService.publishEvent(messageEvent);
            
            // Track message delivery
            trackMessageDelivery(messageId, gameId);
            
            log.debug("Broadcasted chat message from {} in game {}: {}", 
                     username, gameId, messageId);
            
        } catch (Exception e) {
            log.error("Error broadcasting chat message from {} in game {}: {}", 
                     username, gameId, e.getMessage());
        }
    }

    /**
     * Mark message as read by a user.
     */
    public void markMessageAsRead(Long gameId, String username, String messageId) {
        try {
            Instant now = Instant.now();
            
            // Update last read timestamp for user in this game
            String lastReadKey = String.format(LAST_READ_KEY, gameId, username);
            redisTemplate.opsForValue().set(lastReadKey, now.toString(), 24, TimeUnit.HOURS);
            
            // Update message delivery status
            String deliveryKey = String.format(MESSAGE_DELIVERY_KEY, messageId);
            redisTemplate.opsForSet().add(deliveryKey, username);
            redisTemplate.expire(deliveryKey, 7, TimeUnit.DAYS);
            
            // Broadcast read receipt event (only to message sender)
            ChatReadReceiptEvent readEvent = new ChatReadReceiptEvent(gameId, messageId, username);
            realTimeEventService.publishEvent(readEvent);
            
            log.debug("User {} marked message {} as read in game {}", username, messageId, gameId);
            
        } catch (Exception e) {
            log.error("Error marking message as read for user {} in game {}: {}", 
                     username, gameId, e.getMessage());
        }
    }

    /**
     * Get users currently typing in a game.
     */
    public Set<String> getTypingUsers(Long gameId) {
        try {
            // Clean up expired typing indicators first
            cleanupExpiredTyping(gameId);
            
            String redisKey = String.format(TYPING_KEY, gameId);
            Set<String> typingUsers = redisTemplate.opsForSet().members(redisKey);
            return typingUsers != null ? typingUsers : Set.of();
            
        } catch (Exception e) {
            log.error("Error getting typing users for game {}: {}", gameId, e.getMessage());
            return Set.of();
        }
    }

    /**
     * Get message delivery status.
     */
    public Set<String> getMessageReadBy(String messageId) {
        try {
            String deliveryKey = String.format(MESSAGE_DELIVERY_KEY, messageId);
            Set<String> readBy = redisTemplate.opsForSet().members(deliveryKey);
            return readBy != null ? readBy : Set.of();
            
        } catch (Exception e) {
            log.error("Error getting message read status for {}: {}", messageId, e.getMessage());
            return Set.of();
        }
    }

    /**
     * Get last read timestamp for a user in a game.
     */
    public Instant getLastReadTime(Long gameId, String username) {
        try {
            String lastReadKey = String.format(LAST_READ_KEY, gameId, username);
            String timestampStr = redisTemplate.opsForValue().get(lastReadKey);
            
            return timestampStr != null ? Instant.parse(timestampStr) : null;
            
        } catch (Exception e) {
            log.error("Error getting last read time for user {} in game {}: {}", 
                     username, gameId, e.getMessage());
            return null;
        }
    }

    /**
     * Get chat activity summary for a game.
     */
    public Map<String, Object> getChatActivitySummary(Long gameId) {
        try {
            Set<String> typingUsers = getTypingUsers(gameId);
            Set<String> gameViewers = presenceService.getGameViewers(gameId);
            long onlineCount = presenceService.getGameViewerCount(gameId);
            
            return Map.of(
                "gameId", gameId,
                "typingUsers", typingUsers,
                "typingCount", typingUsers.size(),
                "onlineViewers", gameViewers,
                "onlineCount", onlineCount,
                "timestamp", Instant.now()
            );
            
        } catch (Exception e) {
            log.error("Error getting chat activity summary for game {}: {}", gameId, e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Track message delivery for analytics.
     */
    private void trackMessageDelivery(String messageId, Long gameId) {
        try {
            // Get online users in the game to track delivery
            Set<String> onlineViewers = presenceService.getGameViewers(gameId);
            
            if (!onlineViewers.isEmpty()) {
                String deliveryKey = String.format(MESSAGE_DELIVERY_KEY, messageId);
                
                // Initialize delivery tracking
                Map<String, String> deliveryData = new HashMap<>();
                deliveryData.put("gameId", gameId.toString());
                deliveryData.put("sentAt", Instant.now().toString());
                deliveryData.put("targetUsers", String.join(",", onlineViewers));
                
                redisTemplate.opsForHash().putAll(deliveryKey + ":meta", deliveryData);
                redisTemplate.expire(deliveryKey + ":meta", 7, TimeUnit.DAYS);
            }
            
        } catch (Exception e) {
            log.error("Error tracking message delivery for {}: {}", messageId, e.getMessage());
        }
    }

    /**
     * Clean up expired typing indicators.
     */
    private void cleanupExpiredTyping(Long gameId) {
        try {
            String gameKey = gameId.toString();
            Instant cutoff = Instant.now().minusSeconds(TYPING_TIMEOUT_SECONDS);
            
            // Clean up local cache
            Set<String> typingUsers = gameTypingUsers.get(gameKey);
            if (typingUsers != null) {
                typingUsers.removeIf(username -> {
                    Instant lastTyping = userLastTyping.get(username + ":" + gameKey);
                    if (lastTyping != null && lastTyping.isBefore(cutoff)) {
                        userLastTyping.remove(username + ":" + gameKey);
                        return true;
                    }
                    return false;
                });
                
                if (typingUsers.isEmpty()) {
                    gameTypingUsers.remove(gameKey);
                }
            }
            
        } catch (Exception e) {
            log.error("Error cleaning up expired typing for game {}: {}", gameId, e.getMessage());
        }
    }

    /**
     * Perform scheduled cleanup of chat data.
     */
    public void performCleanup() {
        try {
            Instant now = Instant.now();
            Instant cutoff = now.minusSeconds(TYPING_TIMEOUT_SECONDS);
            
            // Clean up all local typing data
            userLastTyping.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
            
            gameTypingUsers.entrySet().removeIf(entry -> {
                Long gameId = Long.parseLong(entry.getKey());
                cleanupExpiredTyping(gameId);
                return entry.getValue().isEmpty();
            });
            
            log.debug("Performed chat cleanup, removed stale typing data");
            
        } catch (Exception e) {
            log.error("Error during chat cleanup: {}", e.getMessage());
        }
    }

    /**
     * Get chat service metrics.
     */
    public Map<String, Object> getChatMetrics() {
        try {
            int totalTypingUsers = userLastTyping.size();
            int activeGameChats = gameTypingUsers.size();
            
            return Map.of(
                "totalTypingUsers", totalTypingUsers,
                "activeGameChats", activeGameChats,
                "typingTimeoutSeconds", TYPING_TIMEOUT_SECONDS,
                "lastCleanup", Instant.now()
            );
            
        } catch (Exception e) {
            log.error("Error getting chat metrics: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Chat typing event for real-time broadcasting.
     */
    public static class ChatTypingEvent extends com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent {
        private final ChatTypingPayload payload;

        public ChatTypingEvent(Long gameId, String username, boolean isTyping) {
            super("chat_typing", EventPriority.LOW, EventTarget.GAME_ROOM, 
                  false, 30L, null); // Short TTL for typing events
            
            this.payload = new ChatTypingPayload(gameId, username, isTyping);
        }

        @Override
        public String getRoutingKey() {
            return payload.gameId.toString();
        }

        @Override
        public String getDestination() {
            return "/topic/games/" + payload.gameId + "/chat/typing";
        }

        @Override
        public Object getPayload() {
            return payload;
        }

        public static class ChatTypingPayload extends EventPayload {
            public final Long gameId;
            public final String username;
            public final boolean isTyping;
            public final long timestamp;

            public ChatTypingPayload(Long gameId, String username, boolean isTyping) {
                this.gameId = gameId;
                this.username = username;
                this.isTyping = isTyping;
                this.timestamp = System.currentTimeMillis();
            }
        }
    }

    /**
     * Chat read receipt event.
     */
    public static class ChatReadReceiptEvent extends com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent {
        private final ChatReadReceiptPayload payload;

        public ChatReadReceiptEvent(Long gameId, String messageId, String username) {
            super("chat_read_receipt", EventPriority.LOW, EventTarget.GAME_ROOM, 
                  false, 300L, null); // 5 minute TTL
            
            this.payload = new ChatReadReceiptPayload(gameId, messageId, username);
        }

        @Override
        public String getRoutingKey() {
            return payload.gameId.toString();
        }

        @Override
        public String getDestination() {
            return "/topic/games/" + payload.gameId + "/chat/receipts";
        }

        @Override
        public Object getPayload() {
            return payload;
        }

        public static class ChatReadReceiptPayload extends EventPayload {
            public final Long gameId;
            public final String messageId;
            public final String username;
            public final long timestamp;

            public ChatReadReceiptPayload(Long gameId, String messageId, String username) {
                this.gameId = gameId;
                this.messageId = messageId;
                this.username = username;
                this.timestamp = System.currentTimeMillis();
            }
        }
    }
}
