package com.bmessi.pickupsportsapp.controller.dashboard;

import com.bmessi.pickupsportsapp.service.dashboard.RealTimeDashboardService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.service.EnhancedPresenceService;
import com.bmessi.pickupsportsapp.realtime.event.UserPresenceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * WebSocket controller for real-time dashboard communications.
 * 
 * Handles:
 * - Dashboard subscription management
 * - Live data streaming
 * - Real-time presence updates
 * - Interactive dashboard features
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class DashboardWebSocketController {

    private final RealTimeDashboardService dashboardService;
    private final RealTimeEventService realTimeEventService;
    private final EnhancedPresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Subscribe to real-time dashboard updates.
     * WebSocket endpoint: /app/dashboard/subscribe
     */
    @MessageMapping("/dashboard/subscribe")
    public void subscribeToDashboard(Principal principal) {
        String username = principal.getName();
        
        try {
            // Update user presence to indicate they're viewing dashboard
            presenceService.updatePresence(username, UserPresenceEvent.PresenceStatus.ONLINE, null);
            
            // Get initial dashboard data
            RealTimeDashboardService.LiveDashboardData initialData = 
                dashboardService.getLiveDashboardData(username);
            
            // Send initial data to user
            messagingTemplate.convertAndSendToUser(
                username, 
                "/dashboard/data", 
                initialData
            );
            
            // Send subscription confirmation
            messagingTemplate.convertAndSendToUser(
                username,
                "/dashboard/status",
                Map.of(
                    "status", "SUBSCRIBED",
                    "message", "Connected to live dashboard updates",
                    "timestamp", java.time.Instant.now()
                )
            );
            
            log.debug("User {} subscribed to dashboard updates", username);
            
        } catch (Exception e) {
            log.error("Error subscribing user {} to dashboard: {}", username, e.getMessage());
            
            // Send error message
            messagingTemplate.convertAndSendToUser(
                username,
                "/dashboard/error",
                Map.of(
                    "error", "Failed to subscribe to dashboard updates",
                    "details", e.getMessage()
                )
            );
        }
    }

    /**
     * Unsubscribe from dashboard updates.
     * WebSocket endpoint: /app/dashboard/unsubscribe
     */
    @MessageMapping("/dashboard/unsubscribe")
    public void unsubscribeFromDashboard(Principal principal) {
        String username = principal.getName();
        
        try {
            // Update presence
            presenceService.updatePresence(username, UserPresenceEvent.PresenceStatus.OFFLINE, null);
            
            // Send unsubscription confirmation
            messagingTemplate.convertAndSendToUser(
                username,
                "/dashboard/status",
                Map.of(
                    "status", "UNSUBSCRIBED",
                    "message", "Disconnected from live dashboard updates",
                    "timestamp", java.time.Instant.now()
                )
            );
            
            log.debug("User {} unsubscribed from dashboard updates", username);
            
        } catch (Exception e) {
            log.error("Error unsubscribing user {} from dashboard: {}", username, e.getMessage());
        }
    }

    /**
     * Request dashboard data refresh.
     * WebSocket endpoint: /app/dashboard/refresh
     */
    @MessageMapping("/dashboard/refresh")
    public void refreshDashboard(Principal principal, @Payload Map<String, Object> request) {
        String username = principal.getName();
        
        try {
            String section = (String) request.getOrDefault("section", "all");
            
            // Get fresh dashboard data
            RealTimeDashboardService.LiveDashboardData liveData = 
                dashboardService.getLiveDashboardData(username);
            
            // Send updated data based on requested section
            switch (section) {
                case "stats" -> {
                    messagingTemplate.convertAndSendToUser(
                        username,
                        "/dashboard/stats",
                        liveData.getDashboardSummary().getStatistics()
                    );
                }
                case "achievements" -> {
                    messagingTemplate.convertAndSendToUser(
                        username,
                        "/dashboard/achievements",
                        liveData.getDashboardSummary().getAchievements()
                    );
                }
                case "activity" -> {
                    messagingTemplate.convertAndSendToUser(
                        username,
                        "/dashboard/activity",
                        liveData.getRecentActivity()
                    );
                }
                default -> {
                    messagingTemplate.convertAndSendToUser(
                        username,
                        "/dashboard/data",
                        liveData
                    );
                }
            }
            
            log.debug("Refreshed dashboard section '{}' for user {}", section, username);
            
        } catch (Exception e) {
            log.error("Error refreshing dashboard for user {}: {}", username, e.getMessage());
            
            messagingTemplate.convertAndSendToUser(
                username,
                "/dashboard/error",
                Map.of(
                    "error", "Failed to refresh dashboard",
                    "details", e.getMessage()
                )
            );
        }
    }

    /**
     * Handle dashboard interaction events.
     * WebSocket endpoint: /app/dashboard/interaction
     */
    @MessageMapping("/dashboard/interaction")
    public void handleDashboardInteraction(Principal principal, @Payload Map<String, Object> interaction) {
        String username = principal.getName();
        
        try {
            String interactionType = (String) interaction.get("type");
            Object target = interaction.get("target");
            
            switch (interactionType) {
                case "view_achievement" -> {
                    // Track achievement view for analytics
                    log.debug("User {} viewed achievement: {}", username, target);
                }
                case "set_goal" -> {
                    // Handle goal setting
                    log.debug("User {} set a goal: {}", username, target);
                }
                case "share_achievement" -> {
                    // Handle achievement sharing
                    handleAchievementShare(username, (String) target);
                }
                default -> {
                    log.debug("Unknown dashboard interaction from {}: {}", username, interactionType);
                }
            }
            
        } catch (Exception e) {
            log.error("Error handling dashboard interaction from user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Send dashboard heartbeat to maintain connection.
     * WebSocket endpoint: /app/dashboard/heartbeat
     */
    @MessageMapping("/dashboard/heartbeat")
    public void dashboardHeartbeat(Principal principal) {
        String username = principal.getName();
        
        try {
            // Update presence
            presenceService.recordHeartbeat(username, null);
            
            // Send heartbeat response with current metrics
            Map<String, Object> heartbeatResponse = Map.of(
                "status", "ALIVE",
                "timestamp", java.time.Instant.now(),
                "onlineUsers", presenceService.getOnlineUserCount()
            );
            
            messagingTemplate.convertAndSendToUser(
                username,
                "/dashboard/heartbeat",
                heartbeatResponse
            );
            
            log.debug("Processed dashboard heartbeat for user {}", username);
            
        } catch (Exception e) {
            log.error("Error processing dashboard heartbeat for user {}: {}", username, e.getMessage());
        }
    }

    // Private helper methods

    private void handleAchievementShare(String username, String achievementId) {
        try {
            // Create activity feed entry for achievement sharing
            com.bmessi.pickupsportsapp.realtime.event.ActivityFeedEvent shareEvent = 
                new com.bmessi.pickupsportsapp.realtime.event.ActivityFeedEvent(
                    username,
                    "SHARED_ACHIEVEMENT",
                    "ACHIEVEMENT",
                    Long.parseLong(achievementId),
                    username + " shared an achievement"
                );
            
            realTimeEventService.publishEvent(shareEvent);
            
            log.debug("User {} shared achievement: {}", username, achievementId);
            
        } catch (Exception e) {
            log.error("Error handling achievement share: {}", e.getMessage());
        }
    }
}
