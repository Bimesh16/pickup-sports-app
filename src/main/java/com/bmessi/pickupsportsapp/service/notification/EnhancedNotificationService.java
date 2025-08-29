package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.entity.notification.NotificationPreference;
import com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate;
import com.bmessi.pickupsportsapp.repository.EnhancedNotificationRepository;
import com.bmessi.pickupsportsapp.repository.NotificationPreferenceRepository;
import com.bmessi.pickupsportsapp.repository.NotificationTemplateRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Enhanced notification service with multi-channel delivery, templates, and user preferences.
 * 
 * Features:
 * - Multiple delivery channels (in-app, email, push, SMS)
 * - Rich notification templates with internationalization
 * - User preferences and quiet hours
 * - Delivery tracking and analytics
 * - Retry logic for failed deliveries
 * - Priority-based delivery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedNotificationService {

    private final EnhancedNotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final NotificationChannelService channelService;
    private final NotificationTemplateService templateService;
    private final MeterRegistry meterRegistry;
    private final ObjectMapper objectMapper;

    /**
     * Send a notification with automatic channel selection based on user preferences.
     */
    @Transactional
    public List<EnhancedNotification> sendNotification(NotificationRequest request) {
        log.debug("Sending notification: {}", request);
        
        User user = userRepository.findOptionalByUsername(request.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUsername()));

        // Get user's enabled channels for this event type
        List<NotificationPreference> enabledPreferences = 
            preferenceRepository.findEnabledPreferencesForUserAndEvent(user.getId(), request.getEventType());

        // If user has no preferences, use default channels
        if (enabledPreferences.isEmpty()) {
            enabledPreferences = getDefaultPreferences(user, request.getEventType());
        }

        List<EnhancedNotification> notifications = new ArrayList<>();
        
        for (NotificationPreference preference : enabledPreferences) {
            // Check if we should send based on priority and quiet hours
            if (shouldSendNotification(preference, request.getPriority())) {
                EnhancedNotification notification = createNotification(user, request, preference.getChannel());
                notifications.add(notification);
                
                // Schedule async delivery
                scheduleDelivery(notification);
            }
        }

        meterRegistry.counter("notifications.created", 
            "event_type", request.getEventType(),
            "channels", String.valueOf(notifications.size())).increment();

        return notifications;
    }

    /**
     * Send a notification to specific channels (bypassing user preferences).
     */
    @Transactional
    public List<EnhancedNotification> sendNotificationToChannels(
            NotificationRequest request, 
            List<NotificationTemplate.NotificationChannel> channels) {
        
        User user = userRepository.findOptionalByUsername(request.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUsername()));

        List<EnhancedNotification> notifications = new ArrayList<>();
        
        for (NotificationTemplate.NotificationChannel channel : channels) {
            EnhancedNotification notification = createNotification(user, request, channel);
            notifications.add(notification);
            scheduleDelivery(notification);
        }

        return notifications;
    }

    /**
     * Create a notification entity from a request.
     */
    private EnhancedNotification createNotification(
            User user, 
            NotificationRequest request, 
            NotificationTemplate.NotificationChannel channel) {
        
        // Get template for this event type and channel
        NotificationTemplate template = templateService.getTemplate(
            request.getEventType(), 
            channel, 
            request.getLocale()
        );

        // Process template with context data
        String title = templateService.processTemplate(template.getTitle(), request.getContext());
        String message = templateService.processTemplate(template.getMessage(), request.getContext());
        String richContent = template.getHtmlContent() != null ? 
            templateService.processTemplate(template.getHtmlContent(), request.getContext()) : null;

        // Set expiration (default 7 days for most notifications)
        Instant expiresAt = request.getExpiresAt() != null ? 
            request.getExpiresAt() : 
            Instant.now().plus(7, ChronoUnit.DAYS);

        EnhancedNotification notification = EnhancedNotification.builder()
            .user(user)
            .eventType(request.getEventType())
            .title(title)
            .message(message)
            .richContent(richContent)
            .imageUrl(request.getImageUrl())
            .clickUrl(request.getClickUrl())
            .priority(request.getPriority())
            .channel(channel)
            .expiresAt(expiresAt)
            .metadata(serializeMetadata(request.getMetadata()))
            .actions(serializeActions(request.getActions()))
            .build();

        return notificationRepository.save(notification);
    }

    /**
     * Schedule async delivery of a notification.
     */
    @Async
    public CompletableFuture<Void> scheduleDelivery(EnhancedNotification notification) {
        try {
            deliverNotification(notification);
        } catch (Exception e) {
            log.error("Failed to deliver notification {}: {}", notification.getId(), e.getMessage(), e);
            handleDeliveryFailure(notification, e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Deliver a notification via the appropriate channel.
     */
    @Transactional
    public void deliverNotification(EnhancedNotification notification) {
        log.debug("Delivering notification {} via {}", notification.getId(), notification.getChannel());
        
        try {
            boolean delivered = channelService.deliver(notification);
            
            if (delivered) {
                notification.markDelivered();
                meterRegistry.counter("notifications.delivered", 
                    "channel", notification.getChannel().toString(),
                    "event_type", notification.getEventType()).increment();
            } else {
                handleDeliveryFailure(notification, "Channel service returned false");
            }
            
            notificationRepository.save(notification);
            
        } catch (Exception e) {
            log.error("Delivery failed for notification {}: {}", notification.getId(), e.getMessage(), e);
            handleDeliveryFailure(notification, e.getMessage());
        }
    }

    /**
     * Handle delivery failure and schedule retry if appropriate.
     */
    @Transactional
    public void handleDeliveryFailure(EnhancedNotification notification, String errorMessage) {
        notification.markFailed(errorMessage);
        
        // Schedule retry with exponential backoff
        if (notification.getDeliveryAttempts() < 5) {
            long delayMinutes = (long) Math.pow(2, notification.getDeliveryAttempts()) * 5; // 5, 10, 20, 40, 80 minutes
            Instant retryAt = Instant.now().plus(delayMinutes, ChronoUnit.MINUTES);
            notification.scheduleRetry(retryAt);
            
            log.info("Scheduled retry for notification {} in {} minutes", 
                notification.getId(), delayMinutes);
        } else {
            log.warn("Notification {} exceeded retry limit", notification.getId());
        }
        
        notificationRepository.save(notification);
        
        meterRegistry.counter("notifications.failed", 
            "channel", notification.getChannel().toString(),
            "event_type", notification.getEventType(),
            "attempt", String.valueOf(notification.getDeliveryAttempts())).increment();
    }

    /**
     * Process pending deliveries and retries.
     */
    @Transactional
    public void processPendingDeliveries() {
        List<EnhancedNotification> pending = notificationRepository.findPendingDeliveries(Instant.now());
        
        log.debug("Processing {} pending notifications", pending.size());
        
        for (EnhancedNotification notification : pending) {
            scheduleDelivery(notification);
        }
    }

    /**
     * Mark expired notifications.
     */
    @Transactional
    public int markExpiredNotifications() {
        return notificationRepository.markExpiredNotifications(Instant.now());
    }

    /**
     * Mark notification as opened/read.
     */
    @Transactional
    public void markOpened(Long notificationId, Long userId) {
        EnhancedNotification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to user");
        }
        
        notification.markOpened();
        notificationRepository.save(notification);
        
        meterRegistry.counter("notifications.opened", 
            "channel", notification.getChannel().toString(),
            "event_type", notification.getEventType()).increment();
    }

    /**
     * Mark notification as clicked.
     */
    @Transactional
    public void markClicked(Long notificationId, Long userId) {
        EnhancedNotification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to user");
        }
        
        notification.markClicked();
        notificationRepository.save(notification);
        
        meterRegistry.counter("notifications.clicked", 
            "channel", notification.getChannel().toString(),
            "event_type", notification.getEventType()).increment();
    }

    /**
     * Get notifications for a user.
     */
    @Transactional(readOnly = true)
    public Page<EnhancedNotification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get unread count for a user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Check if we should send notification based on preferences and quiet hours.
     */
    private boolean shouldSendNotification(NotificationPreference preference, NotificationTemplate.NotificationPriority priority) {
        // Check if enabled
        if (!preference.getEnabled()) {
            return false;
        }
        
        // Check priority threshold
        if (!preference.meetsPriorityThreshold(priority)) {
            return false;
        }
        
        // Check quiet hours (only for non-urgent notifications)
        if (priority != NotificationTemplate.NotificationPriority.URGENT && preference.isInQuietHours()) {
            return false;
        }
        
        return true;
    }

    /**
     * Get default preferences for users who haven't set any.
     */
    private List<NotificationPreference> getDefaultPreferences(User user, String eventType) {
        // Default to in-app notifications for all event types
        NotificationPreference defaultPref = NotificationPreference.builder()
            .user(user)
            .eventType(eventType)
            .channel(NotificationTemplate.NotificationChannel.IN_APP)
            .enabled(true)
            .minPriority(NotificationTemplate.NotificationPriority.LOW)
            .build();
        
        return List.of(defaultPref);
    }

    /**
     * Serialize metadata to JSON.
     */
    private String serializeMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to serialize metadata: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Serialize actions to JSON.
     */
    private String serializeActions(List<NotificationAction> actions) {
        if (actions == null || actions.isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(actions);
        } catch (Exception e) {
            log.warn("Failed to serialize actions: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Data class for notification requests.
     */
    public static class NotificationRequest {
        private String username;
        private String eventType;
        private String locale = "en";
        private NotificationTemplate.NotificationPriority priority = NotificationTemplate.NotificationPriority.NORMAL;
        private Map<String, Object> context = new HashMap<>();
        private Map<String, Object> metadata = new HashMap<>();
        private List<NotificationAction> actions = new ArrayList<>();
        private String imageUrl;
        private String clickUrl;
        private Instant expiresAt;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getLocale() { return locale; }
        public void setLocale(String locale) { this.locale = locale; }

        public NotificationTemplate.NotificationPriority getPriority() { return priority; }
        public void setPriority(NotificationTemplate.NotificationPriority priority) { this.priority = priority; }

        public Map<String, Object> getContext() { return context; }
        public void setContext(Map<String, Object> context) { this.context = context; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

        public List<NotificationAction> getActions() { return actions; }
        public void setActions(List<NotificationAction> actions) { this.actions = actions; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getClickUrl() { return clickUrl; }
        public void setClickUrl(String clickUrl) { this.clickUrl = clickUrl; }

        public Instant getExpiresAt() { return expiresAt; }
        public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

        @Override
        public String toString() {
            return "NotificationRequest{" +
                "username='" + username + '\'' +
                ", eventType='" + eventType + '\'' +
                ", priority=" + priority +
                '}';
        }
    }

    /**
     * Data class for notification actions (buttons).
     */
    public static class NotificationAction {
        private String id;
        private String label;
        private String url;
        private String style = "default"; // default, primary, danger

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getStyle() { return style; }
        public void setStyle(String style) { this.style = style; }
    }
}