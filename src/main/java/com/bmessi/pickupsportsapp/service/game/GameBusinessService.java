package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import com.bmessi.pickupsportsapp.service.notification.EnhancedNotificationService;
import com.bmessi.pickupsportsapp.websocket.GameRoomEvent;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Enhanced business logic service for game management.
 * 
 * This service handles complex game business operations including:
 * - Automatic status management
 * - Capacity tracking and waitlist promotion
 * - Game lifecycle events
 * - Real-time notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameBusinessService {

    private final GameRepository gameRepository;
    private final NotificationService notificationService;
    private final EnhancedNotificationService enhancedNotificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final WaitlistService waitlistService;
    private final RealTimeEventService realTimeEventService;

    /**
     * Handles the complete business logic for a user joining a game.
     * This includes capacity management, status updates, and notifications.
     */
    @Transactional
    public GameJoinResult joinGame(Game game, User user) {
        GameJoinResult result = new GameJoinResult();
        
        // Check current capacity
        int currentParticipants = game.getParticipants().size();
        Integer capacity = game.getCapacity();
        
        if (capacity != null && currentParticipants >= capacity) {
            // Game is at capacity
            if (Boolean.TRUE.equals(game.getWaitlistEnabled())) {
                // Add to waitlist
                waitlistService.addToWaitlist(game.getId(), user.getId());
                result.setJoinedWaitlist(true);
                result.setWaitlistPosition(waitlistService.waitlistCount(game.getId()));
                
                log.info("User {} added to waitlist for game {} at position {}", 
                    user.getUsername(), game.getId(), result.getWaitlistPosition());
                
                // Send enhanced notification for waitlist
                sendEnhancedGameNotification(user.getUsername(), "waitlisted", game, user.getUsername());
                
                return result;
            } else {
                throw new IllegalStateException("Game is full and waitlist is not enabled");
            }
        }
        
        // Add user as participant
        game.addParticipant(user);
        result.setJoinedDirectly(true);
        
        // Update game status if now at capacity
        if (capacity != null && (currentParticipants + 1) >= capacity) {
            game.setStatus(Game.GameStatus.FULL);
            result.setGameNowFull(true);
            
            log.info("Game {} is now full with {} participants", game.getId(), capacity);
        }
        
        Game savedGame = gameRepository.save(game);
        result.setUpdatedGame(savedGame);
        
        // Send real-time updates
        sendGameUpdateEvent(savedGame, "participant_joined", user.getUsername());
        
        // Send enhanced notification to game creator
        sendEnhancedGameNotification(savedGame.getUser().getUsername(), "game_joined", savedGame, user.getUsername());
        
        log.info("User {} successfully joined game {}", user.getUsername(), game.getId());
        
        return result;
    }

    /**
     * Handles the complete business logic for a user leaving a game.
     */
    @Transactional
    public GameLeaveResult leaveGame(Game game, User user) {
        GameLeaveResult result = new GameLeaveResult();
        
        if (!game.getParticipants().contains(user)) {
            throw new IllegalStateException("User is not a participant in this game");
        }
        
        game.removeParticipant(user);
        result.setLeftSuccessfully(true);
        
        // If game was full, change status back to published
        if (game.getStatus() == Game.GameStatus.FULL) {
            game.setStatus(Game.GameStatus.PUBLISHED);
            result.setGameReopened(true);
        }
        
        Game savedGame = gameRepository.save(game);
        result.setUpdatedGame(savedGame);
        
        // Try to promote someone from waitlist
        if (Boolean.TRUE.equals(game.getWaitlistEnabled())) {
            User promotedUser = promoteFromWaitlist(game);
            if (promotedUser != null) {
                result.setPromotedUser(promotedUser);
                log.info("Promoted user {} from waitlist to game {}", 
                    promotedUser.getUsername(), game.getId());
            }
        }
        
        // Send real-time updates
        sendGameUpdateEvent(savedGame, "participant_left", user.getUsername());
        
        // Notify game creator
        notificationService.createGameNotification(
            savedGame.getUser().getUsername(),
            user.getUsername(),
            savedGame.getSport(),
            savedGame.getLocation(),
            "left"
        );
        
        log.info("User {} successfully left game {}", user.getUsername(), game.getId());
        
        return result;
    }

    /**
     * Automatically promotes a user from the waitlist to participant.
     */
    @Transactional
    public User promoteFromWaitlist(Game game) {
        // Get next user from waitlist
        Long nextUserId = waitlistService.getNextFromWaitlist(game.getId());
        if (nextUserId == null) {
            return null;
        }
        
        // Remove from waitlist and add as participant
        User promotedUser = waitlistService.promoteFromWaitlist(game.getId(), nextUserId);
        if (promotedUser != null) {
            game.addParticipant(promotedUser);
            gameRepository.save(game);
            
            // Notify promoted user
            notificationService.createGameNotification(
                promotedUser.getUsername(),
                promotedUser.getUsername(),
                game.getSport(),
                game.getLocation(),
                "promoted"
            );
            
            // Send real-time update
            sendGameUpdateEvent(game, "waitlist_promoted", promotedUser.getUsername());
        }
        
        return promotedUser;
    }

    /**
     * Send enhanced notification with game context.
     */
    private void sendEnhancedGameNotification(String username, String eventType, Game game, String actorUsername) {
        try {
            EnhancedNotificationService.NotificationRequest request = new EnhancedNotificationService.NotificationRequest();
            request.setUsername(username);
            request.setEventType(eventType);
            
            // Create rich context data
            Map<String, Object> context = new HashMap<>();
            context.put("recipientUsername", username);
            context.put("actorUsername", actorUsername != null ? actorUsername : "System");
            context.put("sport", game.getSport());
            context.put("location", game.getLocation());
            context.put("gameTime", game.getTime() != null ? game.getTime().toString() : "TBD");
            context.put("participantCount", game.getParticipants().size());
            context.put("capacity", game.getCapacity());
            context.put("gameId", game.getId());
            
            request.setContext(context);
            
            // Set priority based on event type
            switch (eventType) {
                case "game_cancelled":
                    request.setPriority(com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate.NotificationPriority.HIGH);
                    break;
                case "waitlist_promoted":
                    request.setPriority(com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate.NotificationPriority.HIGH);
                    break;
                default:
                    request.setPriority(com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate.NotificationPriority.NORMAL);
            }
            
            // Set click URL to game details
            request.setClickUrl("/games/" + game.getId());
            
            // Send enhanced notification
            enhancedNotificationService.sendNotification(request);
            
        } catch (Exception e) {
            log.warn("Failed to send enhanced notification for {}: {}", eventType, e.getMessage());
            // Fallback to traditional notification
            notificationService.createGameNotification(username, actorUsername, game.getSport(), game.getLocation(), eventType);
        }
    }

    /**
     * Handles game cancellation with proper notifications.
     */
    @Transactional
    public void cancelGame(Game game, User cancelledBy, String reason) {
        game.setStatus(Game.GameStatus.CANCELLED);
        game.setUpdatedAt(OffsetDateTime.now());
        
        // Add cancellation reason to description
        if (reason != null && !reason.trim().isEmpty()) {
            String currentDesc = game.getDescription() != null ? game.getDescription() : "";
            game.setDescription(currentDesc + "\n\nCANCELLED: " + reason.trim());
        }
        
        Game savedGame = gameRepository.save(game);
        
        // Notify all participants
        for (User participant : game.getParticipants()) {
            notificationService.createGameNotification(
                participant.getUsername(),
                cancelledBy.getUsername(),
                game.getSport(),
                game.getLocation(),
                "cancelled"
            );
        }
        
        // Notify waitlisted users
        waitlistService.clearWaitlist(game.getId());
        
        // Send real-time update
        sendGameUpdateEvent(savedGame, "game_cancelled", cancelledBy.getUsername());
        
        log.info("Game {} cancelled by {} with reason: {}", 
            game.getId(), cancelledBy.getUsername(), reason);
    }

    /**
     * Automatically updates game status based on time and business rules.
     */
    @Transactional
    public void updateGameStatusIfNeeded(Game game) {
        OffsetDateTime now = OffsetDateTime.now();
        boolean statusChanged = false;
        
        // Mark games as completed if they're past end time
        if (game.getStatus() == Game.GameStatus.PUBLISHED || 
            game.getStatus() == Game.GameStatus.FULL) {
            
            OffsetDateTime gameEnd = calculateGameEndTime(game);
            if (gameEnd != null && now.isAfter(gameEnd)) {
                game.setStatus(Game.GameStatus.COMPLETED);
                statusChanged = true;
                log.info("Game {} automatically marked as completed", game.getId());
            }
        }
        
        // Check if RSVP cutoff has passed and close RSVPs
        if (game.getRsvpCutoff() != null && now.isAfter(game.getRsvpCutoff())) {
            // Additional business logic for RSVP cutoff can be added here
            log.info("RSVP cutoff passed for game {}", game.getId());
        }
        
        if (statusChanged) {
            gameRepository.save(game);
            sendGameUpdateEvent(game, "status_changed", "system");
        }
    }

    /**
     * Calculates when a game should end based on start time and duration.
     */
    private OffsetDateTime calculateGameEndTime(Game game) {
        if (game.getTime() == null) return null;
        
        int durationMinutes = game.getDurationMinutes() != null ? 
            game.getDurationMinutes() : 120; // Default 2 hours
            
        return game.getTime().plusMinutes(durationMinutes);
    }

    /**
     * Sends real-time WebSocket updates for game events using the enhanced event system.
     * 
     * @param game The game that was updated
     * @param eventType The type of event that occurred
     * @param username The user who triggered the event
     */
    private void sendGameUpdateEvent(Game game, String eventType, String username) {
        try {
            RealTimeEvent event = createRealTimeEvent(game, eventType, username);
            if (event != null) {
                realTimeEventService.publishEvent(event);
                log.debug("Published real-time event {} for game {}: {}", 
                         event.getEventId(), game.getId(), eventType);
            }
            
            // Also send activity feed event for certain events
            if (shouldCreateActivityFeedEvent(eventType)) {
                ActivityFeedEvent activityEvent = new ActivityFeedEvent(
                    username,
                    convertEventTypeToAction(eventType),
                    "GAME",
                    game.getId(),
                    createActivityDescription(game, eventType, username)
                );
                realTimeEventService.publishEvent(activityEvent);
            }
            
        } catch (Exception e) {
            log.warn("Failed to send real-time update for game {}: {}", game.getId(), e.getMessage());
            
            // Fallback to old system for reliability
            try {
                GameRoomEvent fallbackEvent = new GameRoomEvent.Generic(eventType, Map.of(
                    "gameId", game.getId(),
                    "username", username,
                    "participantCount", game.getParticipants().size(),
                    "capacity", game.getCapacity(),
                    "status", game.getStatus().toString()
                ));
                messagingTemplate.convertAndSend("/topic/games/" + game.getId(), fallbackEvent);
                log.debug("Sent fallback real-time update for game {}", game.getId());
            } catch (Exception fallbackError) {
                log.error("Both real-time and fallback updates failed for game {}: {}", 
                         game.getId(), fallbackError.getMessage());
            }
        }
    }

    /**
     * Creates the appropriate real-time event based on the event type.
     */
    private RealTimeEvent createRealTimeEvent(Game game, String eventType, String username) {
        int participantCount = game.getParticipants().size();
        Integer capacity = game.getCapacity();
        boolean gameNowFull = capacity != null && participantCount >= capacity;
        
        return switch (eventType) {
            case "participant_joined" -> new GameParticipantJoinedEvent(
                game.getId(), 
                username, 
                getUserIdByUsername(username),
                participantCount,
                capacity,
                gameNowFull
            );
            
            case "participant_left" -> new GameParticipantLeftEvent(
                game.getId(),
                username,
                getUserIdByUsername(username),
                participantCount,
                capacity,
                !gameNowFull, // gameReopened
                null // No promoted user in this context
            );
            
            case "waitlist_promoted" -> new WaitlistPromotedEvent(
                game.getId(),
                username,
                getUserIdByUsername(username),
                participantCount,
                capacity,
                waitlistService.waitlistCount(game.getId())
            );
            
            case "game_cancelled" -> new GameCancelledEvent(
                game.getId(),
                username,
                "Game cancelled by organizer",
                game.getSport(),
                game.getLocation(),
                game.getTime() != null ? game.getTime().toString() : "TBD"
            );
            
            case "status_changed" -> new GameStatusChangedEvent(
                game.getId(),
                "UNKNOWN", // We don't track old status in this context
                game.getStatus().toString(),
                "Automatic status update",
                username
            );
            
            default -> {
                log.warn("Unknown event type: {}", eventType);
                yield null;
            }
        };
    }

    /**
     * Check if we should create an activity feed event for this event type.
     */
    private boolean shouldCreateActivityFeedEvent(String eventType) {
        return Set.of("participant_joined", "game_cancelled", "waitlist_promoted").contains(eventType);
    }

    /**
     * Convert event type to activity action.
     */
    private String convertEventTypeToAction(String eventType) {
        return switch (eventType) {
            case "participant_joined" -> "JOINED_GAME";
            case "game_cancelled" -> "CANCELLED_GAME";
            case "waitlist_promoted" -> "PROMOTED_FROM_WAITLIST";
            default -> eventType.toUpperCase();
        };
    }

    /**
     * Create activity description for feed.
     */
    private String createActivityDescription(Game game, String eventType, String username) {
        return switch (eventType) {
            case "participant_joined" -> String.format("%s joined %s game at %s", 
                                                      username, game.getSport(), game.getLocation());
            case "game_cancelled" -> String.format("%s cancelled %s game at %s", 
                                                   username, game.getSport(), game.getLocation());
            case "waitlist_promoted" -> String.format("%s was promoted from waitlist for %s game", 
                                                      username, game.getSport());
            default -> String.format("%s performed action %s on game %s", 
                                     username, eventType, game.getId());
        };
    }

    /**
     * Helper method to get user ID by username.
     * In a real implementation, this would query the user repository.
     */
    private Long getUserIdByUsername(String username) {
        // For now, return null - this would be implemented with proper user lookup
        return null;
    }

    /**
     * Result object for game join operations.
     */
    public static class GameJoinResult {
        private boolean joinedDirectly;
        private boolean joinedWaitlist;
        private boolean gameNowFull;
        private int waitlistPosition;
        private Game updatedGame;

        // Getters and setters
        public boolean isJoinedDirectly() { return joinedDirectly; }
        public void setJoinedDirectly(boolean joinedDirectly) { this.joinedDirectly = joinedDirectly; }
        
        public boolean isJoinedWaitlist() { return joinedWaitlist; }
        public void setJoinedWaitlist(boolean joinedWaitlist) { this.joinedWaitlist = joinedWaitlist; }
        
        public boolean isGameNowFull() { return gameNowFull; }
        public void setGameNowFull(boolean gameNowFull) { this.gameNowFull = gameNowFull; }
        
        public int getWaitlistPosition() { return waitlistPosition; }
        public void setWaitlistPosition(int waitlistPosition) { this.waitlistPosition = waitlistPosition; }
        
        public Game getUpdatedGame() { return updatedGame; }
        public void setUpdatedGame(Game updatedGame) { this.updatedGame = updatedGame; }
    }

    /**
     * Result object for game leave operations.
     */
    public static class GameLeaveResult {
        private boolean leftSuccessfully;
        private boolean gameReopened;
        private User promotedUser;
        private Game updatedGame;

        // Getters and setters
        public boolean isLeftSuccessfully() { return leftSuccessfully; }
        public void setLeftSuccessfully(boolean leftSuccessfully) { this.leftSuccessfully = leftSuccessfully; }
        
        public boolean isGameReopened() { return gameReopened; }
        public void setGameReopened(boolean gameReopened) { this.gameReopened = gameReopened; }
        
        public User getPromotedUser() { return promotedUser; }
        public void setPromotedUser(User promotedUser) { this.promotedUser = promotedUser; }
        
        public Game getUpdatedGame() { return updatedGame; }
        public void setUpdatedGame(Game updatedGame) { this.updatedGame = updatedGame; }
    }
}