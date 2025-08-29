package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate;
import com.bmessi.pickupsportsapp.service.notification.channels.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service that routes notifications to appropriate delivery channels.
 * 
 * This service acts as a dispatcher, sending notifications through
 * the appropriate channel implementation based on the notification's channel type.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationChannelService {

    private final InAppNotificationChannel inAppChannel;
    private final EmailNotificationChannel emailChannel;
    private final PushNotificationChannel pushChannel;
    private final SmsNotificationChannel smsChannel;
    private final WebhookNotificationChannel webhookChannel;

    /**
     * Deliver a notification through the appropriate channel.
     * 
     * @param notification The notification to deliver
     * @return true if delivery was successful, false otherwise
     */
    public boolean deliver(EnhancedNotification notification) {
        try {
            NotificationTemplate.NotificationChannel channel = notification.getChannel();
            
            log.debug("Delivering notification {} via channel {}", notification.getId(), channel);
            
            switch (channel) {
                case IN_APP:
                    return inAppChannel.deliver(notification);
                case EMAIL:
                    return emailChannel.deliver(notification);
                case PUSH:
                    return pushChannel.deliver(notification);
                case SMS:
                    return smsChannel.deliver(notification);
                case WEBHOOK:
                    return webhookChannel.deliver(notification);
                default:
                    log.warn("Unknown notification channel: {}", channel);
                    return false;
            }
            
        } catch (Exception e) {
            log.error("Failed to deliver notification {} via {}: {}", 
                notification.getId(), notification.getChannel(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * Check if a channel is available and configured.
     */
    public boolean isChannelAvailable(NotificationTemplate.NotificationChannel channel) {
        switch (channel) {
            case IN_APP:
                return inAppChannel.isAvailable();
            case EMAIL:
                return emailChannel.isAvailable();
            case PUSH:
                return pushChannel.isAvailable();
            case SMS:
                return smsChannel.isAvailable();
            case WEBHOOK:
                return webhookChannel.isAvailable();
            default:
                return false;
        }
    }

    /**
     * Get channel health status for monitoring.
     */
    public ChannelHealthStatus getChannelHealth() {
        return ChannelHealthStatus.builder()
            .inApp(inAppChannel.getHealthStatus())
            .email(emailChannel.getHealthStatus())
            .push(pushChannel.getHealthStatus())
            .sms(smsChannel.getHealthStatus())
            .webhook(webhookChannel.getHealthStatus())
            .build();
    }

    /**
     * Data class for channel health monitoring.
     */
    public static class ChannelHealthStatus {
        private ChannelStatus inApp;
        private ChannelStatus email;
        private ChannelStatus push;
        private ChannelStatus sms;
        private ChannelStatus webhook;

        public static ChannelHealthStatusBuilder builder() {
            return new ChannelHealthStatusBuilder();
        }

        // Getters
        public ChannelStatus getInApp() { return inApp; }
        public ChannelStatus getEmail() { return email; }
        public ChannelStatus getPush() { return push; }
        public ChannelStatus getSms() { return sms; }
        public ChannelStatus getWebhook() { return webhook; }

        public static class ChannelHealthStatusBuilder {
            private ChannelStatus inApp;
            private ChannelStatus email;
            private ChannelStatus push;
            private ChannelStatus sms;
            private ChannelStatus webhook;

            public ChannelHealthStatusBuilder inApp(ChannelStatus inApp) {
                this.inApp = inApp;
                return this;
            }

            public ChannelHealthStatusBuilder email(ChannelStatus email) {
                this.email = email;
                return this;
            }

            public ChannelHealthStatusBuilder push(ChannelStatus push) {
                this.push = push;
                return this;
            }

            public ChannelHealthStatusBuilder sms(ChannelStatus sms) {
                this.sms = sms;
                return this;
            }

            public ChannelHealthStatusBuilder webhook(ChannelStatus webhook) {
                this.webhook = webhook;
                return this;
            }

            public ChannelHealthStatus build() {
                ChannelHealthStatus status = new ChannelHealthStatus();
                status.inApp = this.inApp;
                status.email = this.email;
                status.push = this.push;
                status.sms = this.sms;
                status.webhook = this.webhook;
                return status;
            }
        }
    }

    /**
     * Status of an individual notification channel.
     */
    public static class ChannelStatus {
        private boolean available;
        private boolean healthy;
        private String statusMessage;
        private long successCount;
        private long failureCount;
        private double successRate;

        public static ChannelStatus healthy(String message) {
            ChannelStatus status = new ChannelStatus();
            status.available = true;
            status.healthy = true;
            status.statusMessage = message;
            return status;
        }

        public static ChannelStatus unhealthy(String message) {
            ChannelStatus status = new ChannelStatus();
            status.available = true;
            status.healthy = false;
            status.statusMessage = message;
            return status;
        }

        public static ChannelStatus unavailable(String message) {
            ChannelStatus status = new ChannelStatus();
            status.available = false;
            status.healthy = false;
            status.statusMessage = message;
            return status;
        }

        // Getters and setters
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }

        public boolean isHealthy() { return healthy; }
        public void setHealthy(boolean healthy) { this.healthy = healthy; }

        public String getStatusMessage() { return statusMessage; }
        public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

        public long getSuccessCount() { return successCount; }
        public void setSuccessCount(long successCount) { this.successCount = successCount; }

        public long getFailureCount() { return failureCount; }
        public void setFailureCount(long failureCount) { this.failureCount = failureCount; }

        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
    }
}
