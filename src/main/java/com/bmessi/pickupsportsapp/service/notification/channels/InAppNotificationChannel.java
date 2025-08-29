package com.bmessi.pickupsportsapp.service.notification.channels;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.entity.notification.Notification;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import com.bmessi.pickupsportsapp.service.notification.NotificationChannelService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * In-app notification channel that stores notifications in the database
 * and sends real-time WebSocket updates to connected users.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InAppNotificationChannel implements NotificationChannel {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MeterRegistry meterRegistry;

    @Override
    public boolean deliver(EnhancedNotification enhancedNotification) {
        try {
            // Create traditional notification for backward compatibility
            Notification notification = createCompatibilityNotification(enhancedNotification);
            Notification saved = notificationRepository.save(notification);
            
            // Send real-time WebSocket update
            sendWebSocketNotification(enhancedNotification, saved);
            
            // Update metrics
            meterRegistry.counter("notifications.inapp.delivered").increment();
            
            log.debug("Delivered in-app notification {} to user {}", 
                saved.getId(), enhancedNotification.getUser().getUsername());
            
            return true;
            
        } catch (Exception e) {
            log.error("Failed to deliver in-app notification: {}", e.getMessage(), e);
            meterRegistry.counter("notifications.inapp.failed").increment();
            return false;
        }
    }

    @Override
    public boolean isAvailable() {
        // In-app notifications are always available as they only require database
        return true;
    }

    @Override
    public NotificationChannelService.ChannelStatus getHealthStatus() {
        try {
            // Simple health check - can we access the database?
            notificationRepository.count();
            
            return NotificationChannelService.ChannelStatus.healthy("Database accessible");
            
        } catch (Exception e) {
            return NotificationChannelService.ChannelStatus.unhealthy(
                "Database connection issue: " + e.getMessage());
        }
    }

    /**
     * Create a traditional Notification entity for backward compatibility.
     */
    private Notification createCompatibilityNotification(EnhancedNotification enhanced) {
        return Notification.builder()
            .user(enhanced.getUser())
            .message(enhanced.getMessage())
            .build();
    }

    /**
     * Send real-time WebSocket notification to the user.
     */
    private void sendWebSocketNotification(EnhancedNotification enhanced, Notification saved) {
        try {
            String username = enhanced.getUser().getUsername();
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", saved.getId());
            payload.put("enhancedId", enhanced.getId());
            payload.put("type", "notification");
            payload.put("eventType", enhanced.getEventType());
            payload.put("title", enhanced.getTitle());
            payload.put("message", enhanced.getMessage());
            payload.put("priority", enhanced.getPriority().toString());
            payload.put("imageUrl", enhanced.getImageUrl());
            payload.put("clickUrl", enhanced.getClickUrl());
            payload.put("actions", enhanced.getActions());
            payload.put("metadata", enhanced.getMetadata());
            payload.put("timestamp", enhanced.getCreatedAt().toEpochMilli());
            
            // Send to user's personal notification queue
            messagingTemplate.convertAndSendToUser(
                username, 
                "/queue/notifications", 
                payload
            );
            
            // Also send to general notification topic for that user
            messagingTemplate.convertAndSend(
                "/topic/user/" + username + "/notifications", 
                payload
            );
            
            meterRegistry.counter("notifications.websocket.sent").increment();
            
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification: {}", e.getMessage(), e);
            meterRegistry.counter("notifications.websocket.failed").increment();
            // Don't fail the entire delivery for WebSocket issues
        }
    }
}
