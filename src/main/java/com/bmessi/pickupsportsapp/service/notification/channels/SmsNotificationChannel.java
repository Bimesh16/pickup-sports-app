package com.bmessi.pickupsportsapp.service.notification.channels;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.service.notification.NotificationChannelService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * SMS notification channel for urgent notifications.
 * 
 * This is typically used for high-priority notifications like:
 * - Game cancellations
 * - Last-minute changes
 * - Security alerts
 * 
 * Integration options:
 * - Twilio
 * - AWS SNS
 * - Nexmo/Vonage
 * - MessageBird
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationChannel implements NotificationChannel {

    private final MeterRegistry meterRegistry;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.provider:}")
    private String smsProvider;

    @Value("${app.sms.api.key:}")
    private String smsApiKey;

    @Override
    public boolean deliver(EnhancedNotification notification) {
        if (!smsEnabled) {
            log.debug("SMS notifications disabled, skipping notification {}", notification.getId());
            return false;
        }

        try {
            String phoneNumber = getUserPhoneNumber(notification);
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                log.debug("No phone number for user {}", notification.getUser().getUsername());
                return false;
            }

            // Create SMS message
            String message = createSmsMessage(notification);
            
            // Send SMS
            boolean sent = sendSms(phoneNumber, message, notification);
            
            if (sent) {
                meterRegistry.counter("notifications.sms.sent").increment();
                log.debug("Sent SMS notification {} to user {}", 
                    notification.getId(), notification.getUser().getUsername());
            } else {
                meterRegistry.counter("notifications.sms.failed").increment();
            }

            return sent;

        } catch (Exception e) {
            log.error("Failed to send SMS notification {}: {}", notification.getId(), e.getMessage(), e);
            meterRegistry.counter("notifications.sms.failed").increment();
            return false;
        }
    }

    @Override
    public boolean isAvailable() {
        return smsEnabled && 
               smsProvider != null && 
               !smsProvider.isEmpty() &&
               smsApiKey != null && 
               !smsApiKey.isEmpty();
    }

    @Override
    public NotificationChannelService.ChannelStatus getHealthStatus() {
        if (!smsEnabled) {
            return NotificationChannelService.ChannelStatus.unavailable("SMS notifications disabled");
        }

        if (smsProvider == null || smsProvider.isEmpty()) {
            return NotificationChannelService.ChannelStatus.unavailable("SMS provider not configured");
        }

        if (smsApiKey == null || smsApiKey.isEmpty()) {
            return NotificationChannelService.ChannelStatus.unavailable("SMS API key not configured");
        }

        // In production, you would test connectivity to your SMS provider
        return NotificationChannelService.ChannelStatus.healthy("SMS service configured");
    }

    /**
     * Send SMS via the configured provider.
     */
    private boolean sendSms(String phoneNumber, String message, EnhancedNotification notification) {
        try {
            switch (smsProvider.toLowerCase()) {
                case "twilio":
                    return sendViaTwilio(phoneNumber, message, notification);
                case "aws":
                    return sendViaAwsSns(phoneNumber, message, notification);
                default:
                    log.warn("Unknown SMS provider: {}", smsProvider);
                    return false;
            }
        } catch (Exception e) {
            log.error("Failed to send SMS via {}: {}", smsProvider, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send SMS via Twilio (placeholder implementation).
     */
    private boolean sendViaTwilio(String phoneNumber, String message, EnhancedNotification notification) {
        // Placeholder for Twilio integration
        log.info("Would send SMS via Twilio to {}: {}", phoneNumber, message);
        
        // In production:
        // TwilioRestClient client = new TwilioRestClient(accountSid, authToken);
        // Message.creator(new PhoneNumber(phoneNumber), new PhoneNumber(fromNumber), message).create();
        
        return true; // Simulate success
    }

    /**
     * Send SMS via AWS SNS (placeholder implementation).
     */
    private boolean sendViaAwsSns(String phoneNumber, String message, EnhancedNotification notification) {
        // Placeholder for AWS SNS integration
        log.info("Would send SMS via AWS SNS to {}: {}", phoneNumber, message);
        
        // In production:
        // AmazonSNS snsClient = AmazonSNSClientBuilder.standard().build();
        // PublishRequest request = new PublishRequest().withPhoneNumber(phoneNumber).withMessage(message);
        // snsClient.publish(request);
        
        return true; // Simulate success
    }

    /**
     * Create SMS message text (keep it short due to character limits).
     */
    private String createSmsMessage(EnhancedNotification notification) {
        StringBuilder sms = new StringBuilder();
        
        // Add short title if available
        if (notification.getTitle() != null && !notification.getTitle().isEmpty()) {
            sms.append(notification.getTitle()).append(": ");
        }
        
        // Add main message (truncate if needed)
        String message = notification.getMessage();
        if (message.length() > 120) {
            message = message.substring(0, 117) + "...";
        }
        sms.append(message);
        
        // Add action URL if available and short enough
        if (notification.getClickUrl() != null && 
            sms.length() + notification.getClickUrl().length() < 150) {
            sms.append(" ").append(notification.getClickUrl());
        }
        
        return sms.toString();
    }

    /**
     * Get user's phone number.
     */
    private String getUserPhoneNumber(EnhancedNotification notification) {
        // This would depend on your User entity structure
        // For now, return null to indicate no phone number available
        
        // Example implementation:
        // return notification.getUser().getPhoneNumber();
        
        return null; // Placeholder
    }
}
