package com.bmessi.pickupsportsapp.service.realtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket service for real-time communication and mobile app features.
 * 
 * Features:
 * - Real-time game updates
 * - Live chat functionality
 * - Push notifications
 * - Location-based alerts
 * - Game status changes
 * - Player presence tracking
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();

    /**
     * Send real-time game update to all subscribed users.
     */
    public void sendGameUpdate(Long gameId, Map<String, Object> gameUpdate) {
        String topic = "/topic/games/" + gameId;
        messagingTemplate.convertAndSend(topic, gameUpdate);
        log.debug("Sent game update to topic: {}", topic);
    }

    /**
     * Send personal notification to a specific user.
     */
    public void sendPersonalNotification(String username, Map<String, Object> notification) {
        String destination = "/user/" + username + "/notifications";
        messagingTemplate.convertAndSendToUser(username, destination, notification);
        log.debug("Sent personal notification to user: {}", username);
    }

    /**
     * Send chat message to game participants.
     */
    public void sendChatMessage(Long gameId, Map<String, Object> chatMessage) {
        String topic = "/topic/games/" + gameId + "/chat";
        messagingTemplate.convertAndSend(topic, chatMessage);
        log.debug("Sent chat message to game: {}", gameId);
    }

    /**
     * Send location-based alert to users in a specific area.
     */
    public void sendLocationAlert(String location, Map<String, Object> alert) {
        String topic = "/topic/location/" + location;
        messagingTemplate.convertAndSend(topic, alert);
        log.debug("Sent location alert to: {}", location);
    }

    /**
     * Send game invitation to a specific user.
     */
    public void sendGameInvitation(String username, Map<String, Object> invitation) {
        String destination = "/user/" + username + "/invitations";
        messagingTemplate.convertAndSendToUser(username, destination, invitation);
        log.debug("Sent game invitation to user: {}", username);
    }

    /**
     * Broadcast system-wide announcement.
     */
    public void broadcastAnnouncement(Map<String, Object> announcement) {
        String topic = "/topic/announcements";
        messagingTemplate.convertAndSend(topic, announcement);
        log.info("Broadcasted system announcement");
    }

    /**
     * Send real-time game score update.
     */
    public void sendScoreUpdate(Long gameId, Map<String, Object> scoreUpdate) {
        String topic = "/topic/games/" + gameId + "/score";
        messagingTemplate.convertAndSend(topic, scoreUpdate);
        log.debug("Sent score update for game: {}", gameId);
    }

    /**
     * Send player presence update.
     */
    public void sendPresenceUpdate(Long gameId, Map<String, Object> presenceUpdate) {
        String topic = "/topic/games/" + gameId + "/presence";
        messagingTemplate.convertAndSend(topic, presenceUpdate);
        log.debug("Sent presence update for game: {}", gameId);
    }

    /**
     * Send weather update for a specific location.
     */
    public void sendWeatherUpdate(String location, Map<String, Object> weatherUpdate) {
        String topic = "/topic/weather/" + location;
        messagingTemplate.convertAndSend(topic, weatherUpdate);
        log.debug("Sent weather update for location: {}", location);
    }

    /**
     * Send venue availability update.
     */
    public void sendVenueAvailabilityUpdate(Long venueId, Map<String, Object> availabilityUpdate) {
        String topic = "/topic/venues/" + venueId + "/availability";
        messagingTemplate.convertAndSend(topic, availabilityUpdate);
        log.debug("Sent venue availability update for venue: {}", venueId);
    }

    /**
     * Track user session for real-time communication.
     */
    public void trackUserSession(String username, String sessionId) {
        userSessions.put(username, sessionId);
        log.debug("Tracked session for user: {} with session ID: {}", username, sessionId);
    }

    /**
     * Remove user session tracking.
     */
    public void removeUserSession(String username) {
        userSessions.remove(username);
        log.debug("Removed session tracking for user: {}", username);
    }

    /**
     * Check if user is currently online.
     */
    public boolean isUserOnline(String username) {
        return userSessions.containsKey(username);
    }

    /**
     * Get current online users count.
     */
    public int getOnlineUsersCount() {
        return userSessions.size();
    }
}
