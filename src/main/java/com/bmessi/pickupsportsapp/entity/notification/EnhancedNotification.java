package com.bmessi.pickupsportsapp.entity.notification;

import com.bmessi.pickupsportsapp.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Enhanced notification entity with rich metadata, delivery tracking, and multiple channel support.
 * 
 * This extends the basic notification system with:
 * - Multiple delivery channels
 * - Rich content and media support
 * - Delivery tracking and status
 * - Priority levels
 * - Action buttons and interactive elements
 */
@Entity
@Table(name = "enhanced_notification", indexes = {
    @Index(name = "idx_enhanced_notif_user", columnList = "user_id"),
    @Index(name = "idx_enhanced_notif_status", columnList = "delivery_status"),
    @Index(name = "idx_enhanced_notif_type", columnList = "event_type"),
    @Index(name = "idx_enhanced_notif_priority", columnList = "priority"),
    @Index(name = "idx_enhanced_notif_created", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnhancedNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Event type that triggered this notification
     */
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    /**
     * Notification title (for rich notifications)
     */
    @Column(name = "title", length = 200)
    private String title;

    /**
     * Main notification message
     */
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    /**
     * Rich content body (HTML for emails, markdown for apps)
     */
    @Column(name = "rich_content", columnDefinition = "TEXT")
    private String richContent;

    /**
     * URL to image/icon for this notification
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /**
     * URL to open when notification is clicked
     */
    @Column(name = "click_url", length = 500)
    private String clickUrl;

    /**
     * Priority level of this notification
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private NotificationTemplate.NotificationPriority priority = NotificationTemplate.NotificationPriority.NORMAL;

    /**
     * Delivery channels for this notification
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private NotificationTemplate.NotificationChannel channel;

    /**
     * Current delivery status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    /**
     * When the notification was delivered (if successful)
     */
    @Column(name = "delivered_at")
    private Instant deliveredAt;

    /**
     * When the notification was read/opened by the user
     */
    @Column(name = "opened_at")
    private Instant openedAt;

    /**
     * When the user clicked on the notification
     */
    @Column(name = "clicked_at")
    private Instant clickedAt;

    /**
     * Number of delivery attempts
     */
    @Column(name = "delivery_attempts", nullable = false)
    @Builder.Default
    private Integer deliveryAttempts = 0;

    /**
     * Error message if delivery failed
     */
    @Column(name = "error_message", length = 500)
    private String errorMessage;

    /**
     * When to retry delivery (for failed notifications)
     */
    @Column(name = "retry_at")
    private Instant retryAt;

    /**
     * Expiration time for this notification
     */
    @Column(name = "expires_at")
    private Instant expiresAt;

    /**
     * JSON metadata with additional context
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    /**
     * JSON array of action buttons for interactive notifications
     */
    @Column(name = "actions", columnDefinition = "TEXT")
    private String actions;

    /**
     * External tracking ID (for email opens, push delivery receipts, etc.)
     */
    @Column(name = "external_id", length = 100)
    private String externalId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    public enum DeliveryStatus {
        PENDING,        // Waiting to be sent
        DELIVERED,      // Successfully delivered
        FAILED,         // Delivery failed
        RETRYING,       // Retrying after failure
        EXPIRED,        // Notification expired before delivery
        OPENED,         // User opened/read the notification
        CLICKED,        // User clicked on the notification
        DISMISSED       // User dismissed the notification
    }

    // Convenience methods
    public void markDelivered() {
        this.deliveryStatus = DeliveryStatus.DELIVERED;
        this.deliveredAt = Instant.now();
    }

    public void markOpened() {
        this.deliveryStatus = DeliveryStatus.OPENED;
        this.openedAt = Instant.now();
    }

    public void markClicked() {
        this.deliveryStatus = DeliveryStatus.CLICKED;
        this.clickedAt = Instant.now();
    }

    public void markFailed(String errorMessage) {
        this.deliveryStatus = DeliveryStatus.FAILED;
        this.errorMessage = errorMessage;
        this.deliveryAttempts++;
    }

    public void scheduleRetry(Instant retryTime) {
        this.deliveryStatus = DeliveryStatus.RETRYING;
        this.retryAt = retryTime;
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean shouldRetry() {
        return deliveryStatus == DeliveryStatus.RETRYING && 
               retryAt != null && 
               Instant.now().isAfter(retryAt) &&
               deliveryAttempts < 5; // Max 5 retry attempts
    }
}
