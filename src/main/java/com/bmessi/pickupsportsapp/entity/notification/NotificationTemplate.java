package com.bmessi.pickupsportsapp.entity.notification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Entity representing reusable notification templates for different events.
 * 
 * Templates support multiple delivery channels and internationalization.
 */
@Entity
@Table(name = "notification_template", indexes = {
    @Index(name = "idx_notification_template_event", columnList = "event_type"),
    @Index(name = "idx_notification_template_channel", columnList = "channel")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Event type this template handles (e.g., "game_joined", "game_cancelled")
     */
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    /**
     * Delivery channel (IN_APP, EMAIL, PUSH, SMS)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private NotificationChannel channel;

    /**
     * Language/locale for this template
     */
    @Column(name = "locale", nullable = false, length = 10)
    private String locale;

    /**
     * Template title (for emails, push notifications)
     */
    @Column(name = "title", length = 200)
    private String title;

    /**
     * Main message template with placeholders
     */
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    /**
     * Rich HTML content for email templates
     */
    @Column(name = "html_content", columnDefinition = "TEXT")
    private String htmlContent;

    /**
     * Priority level for this notification type
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.NORMAL;

    /**
     * Whether this template is active and should be used
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * JSON metadata for additional template configuration
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    public enum NotificationChannel {
        IN_APP,     // In-app notifications
        EMAIL,      // Email notifications
        PUSH,       // Push notifications
        SMS,        // SMS notifications
        WEBHOOK     // Webhook notifications
    }

    public enum NotificationPriority {
        LOW,        // Non-urgent information
        NORMAL,     // Standard notifications
        HIGH,       // Important updates
        URGENT      // Critical alerts requiring immediate attention
    }
}