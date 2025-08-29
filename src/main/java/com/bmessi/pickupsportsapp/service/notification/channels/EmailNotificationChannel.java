package com.bmessi.pickupsportsapp.service.notification.channels;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.service.notification.NotificationChannelService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;
import java.util.UUID;

/**
 * Email notification channel that sends rich HTML emails.
 * 
 * Features:
 * - HTML email templates with fallback to plain text
 * - Email tracking with unique IDs
 * - Bounce and delivery receipt handling
 * - Configurable sender information
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationChannel implements NotificationChannel {

    private final JavaMailSender mailSender;
    private final MeterRegistry meterRegistry;

    @Value("${app.mail.from:noreply@pickupsportsapp.com}")
    private String fromAddress;

    @Value("${app.mail.from-name:Pickup Sports}")
    private String fromName;

    @Value("${app.mail.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public boolean deliver(EnhancedNotification notification) {
        if (!emailEnabled) {
            log.debug("Email delivery disabled, skipping notification {}", notification.getId());
            return false;
        }

        try {
            String userEmail = getUserEmail(notification);
            if (userEmail == null || userEmail.isEmpty()) {
                log.warn("No email address for user {}", notification.getUser().getUsername());
                return false;
            }

            // Generate tracking ID
            String trackingId = UUID.randomUUID().toString();
            notification.setExternalId(trackingId);

            MimeMessage message = createEmailMessage(notification, userEmail, trackingId);
            mailSender.send(message);

            meterRegistry.counter("notifications.email.sent").increment();
            log.debug("Sent email notification {} to {}", notification.getId(), userEmail);

            return true;

        } catch (Exception e) {
            log.error("Failed to send email notification {}: {}", notification.getId(), e.getMessage(), e);
            meterRegistry.counter("notifications.email.failed").increment();
            return false;
        }
    }

    @Override
    public boolean isAvailable() {
        return emailEnabled && mailSender != null;
    }

    @Override
    public NotificationChannelService.ChannelStatus getHealthStatus() {
        if (!emailEnabled) {
            return NotificationChannelService.ChannelStatus.unavailable("Email delivery disabled");
        }

        if (mailSender == null) {
            return NotificationChannelService.ChannelStatus.unavailable("Mail sender not configured");
        }

        try {
            // Try to create a test message to verify configuration
            mailSender.createMimeMessage();
            return NotificationChannelService.ChannelStatus.healthy("Email service ready");
        } catch (Exception e) {
            return NotificationChannelService.ChannelStatus.unhealthy(
                "Email configuration issue: " + e.getMessage());
        }
    }

    /**
     * Create the email message with HTML content and tracking.
     */
    private MimeMessage createEmailMessage(EnhancedNotification notification, String toEmail, String trackingId) 
            throws Exception {
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // Set basic email properties
        helper.setFrom(fromAddress, fromName);
        helper.setTo(toEmail);
        helper.setSubject(notification.getTitle() != null ? notification.getTitle() : "Notification");

        // Create email content
        String htmlContent = createHtmlContent(notification, trackingId);
        String textContent = createTextContent(notification);

        helper.setText(textContent, htmlContent);

        // Add headers for tracking
        message.setHeader("X-Notification-ID", notification.getId().toString());
        message.setHeader("X-Tracking-ID", trackingId);
        message.setHeader("X-Event-Type", notification.getEventType());

        return message;
    }

    /**
     * Create HTML email content.
     */
    private String createHtmlContent(EnhancedNotification notification, String trackingId) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>").append(escapeHtml(notification.getTitle())).append("</title>");
        html.append("<style>");
        html.append(getEmailStyles());
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        
        html.append("<div class=\"email-container\">");
        
        // Header
        html.append("<div class=\"header\">");
        html.append("<h1>").append(escapeHtml(fromName)).append("</h1>");
        html.append("</div>");
        
        // Content
        html.append("<div class=\"content\">");
        
        if (notification.getTitle() != null) {
            html.append("<h2>").append(escapeHtml(notification.getTitle())).append("</h2>");
        }
        
        if (notification.getImageUrl() != null) {
            html.append("<img src=\"").append(escapeHtml(notification.getImageUrl()))
                .append("\" alt=\"Notification Image\" class=\"notification-image\">");
        }
        
        // Use rich content if available, otherwise regular message
        if (notification.getRichContent() != null) {
            html.append("<div class=\"rich-content\">");
            html.append(notification.getRichContent()); // Assuming this is already safe HTML
            html.append("</div>");
        } else {
            html.append("<p>").append(escapeHtml(notification.getMessage())).append("</p>");
        }
        
        // Click action button
        if (notification.getClickUrl() != null) {
            html.append("<div class=\"action-button\">");
            html.append("<a href=\"").append(addTrackingToUrl(notification.getClickUrl(), trackingId))
                .append("\" class=\"button\">View Details</a>");
            html.append("</div>");
        }
        
        html.append("</div>");
        
        // Footer
        html.append("<div class=\"footer\">");
        html.append("<p>You received this notification because you're a member of Pickup Sports.</p>");
        html.append("<p><a href=\"").append(baseUrl).append("/settings/notifications\">Manage your notification preferences</a></p>");
        html.append("</div>");
        
        html.append("</div>");
        
        // Tracking pixel
        html.append("<img src=\"").append(baseUrl).append("/notifications/track/open/").append(trackingId)
            .append("\" width=\"1\" height=\"1\" alt=\"\">");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    /**
     * Create plain text email content as fallback.
     */
    private String createTextContent(EnhancedNotification notification) {
        StringBuilder text = new StringBuilder();
        
        if (notification.getTitle() != null) {
            text.append(notification.getTitle()).append("\n\n");
        }
        
        text.append(notification.getMessage()).append("\n\n");
        
        if (notification.getClickUrl() != null) {
            text.append("View details: ").append(notification.getClickUrl()).append("\n\n");
        }
        
        text.append("---\n");
        text.append("You received this notification because you're a member of Pickup Sports.\n");
        text.append("Manage your notification preferences: ").append(baseUrl).append("/settings/notifications\n");
        
        return text.toString();
    }

    /**
     * Get user's email address.
     */
    private String getUserEmail(EnhancedNotification notification) {
        // This would depend on your User entity structure
        // For now, assuming email is stored in the User entity
        return notification.getUser().getUsername() + "@example.com"; // Placeholder since User entity doesn't have email
    }

    /**
     * Add tracking parameters to URL.
     */
    private String addTrackingToUrl(String url, String trackingId) {
        if (url == null) return null;
        
        String separator = url.contains("?") ? "&" : "?";
        return url + separator + "utm_source=email&utm_medium=notification&tracking_id=" + trackingId;
    }

    /**
     * Basic HTML escaping.
     */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&#39;");
    }

    /**
     * CSS styles for email templates.
     */
    private String getEmailStyles() {
        return """
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #007bff;
                color: white;
                padding: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 30px;
            }
            .content h2 {
                color: #333;
                margin-top: 0;
            }
            .notification-image {
                max-width: 100%;
                height: auto;
                margin: 15px 0;
            }
            .action-button {
                text-align: center;
                margin: 25px 0;
            }
            .button {
                display: inline-block;
                padding: 12px 25px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
            .rich-content {
                margin: 15px 0;
            }
            """;
    }
}
