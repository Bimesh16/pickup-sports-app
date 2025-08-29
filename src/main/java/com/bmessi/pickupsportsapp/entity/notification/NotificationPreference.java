package com.bmessi.pickupsportsapp.entity.notification;

import com.bmessi.pickupsportsapp.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Entity representing user preferences for notification delivery.
 * 
 * Users can control which types of notifications they receive
 * and through which channels.
 */
@Entity
@Table(name = "notification_preference", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "event_type", "channel"}),
       indexes = {
           @Index(name = "idx_notification_pref_user", columnList = "user_id"),
           @Index(name = "idx_notification_pref_event", columnList = "event_type")
       })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Event type this preference applies to
     */
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    /**
     * Delivery channel for this preference
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private NotificationTemplate.NotificationChannel channel;

    /**
     * Whether the user wants to receive this type of notification via this channel
     */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    /**
     * Quiet hours start time (24-hour format, e.g., 22 for 10 PM)
     */
    @Column(name = "quiet_hours_start")
    private Integer quietHoursStart;

    /**
     * Quiet hours end time (24-hour format, e.g., 8 for 8 AM)
     */
    @Column(name = "quiet_hours_end")
    private Integer quietHoursEnd;

    /**
     * User's timezone for quiet hours calculation
     */
    @Column(name = "timezone", length = 50)
    private String timezone;

    /**
     * Minimum priority level to send notifications for this channel
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "min_priority")
    @Builder.Default
    private NotificationTemplate.NotificationPriority minPriority = NotificationTemplate.NotificationPriority.LOW;

    /**
     * Additional configuration in JSON format
     */
    @Column(name = "config", columnDefinition = "TEXT")
    private String config;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    /**
     * Check if notifications should be sent during quiet hours
     */
    public boolean isInQuietHours() {
        if (quietHoursStart == null || quietHoursEnd == null) {
            return false;
        }

        java.time.LocalTime now = java.time.LocalTime.now();
        int currentHour = now.getHour();

        if (quietHoursStart <= quietHoursEnd) {
            // Quiet hours within same day (e.g., 22:00 to 08:00 next day)
            return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
        } else {
            // Quiet hours span midnight (e.g., 22:00 to 08:00)
            return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
        }
    }

    /**
     * Check if the notification priority meets the minimum threshold
     */
    public boolean meetsPriorityThreshold(NotificationTemplate.NotificationPriority notificationPriority) {
        return notificationPriority.ordinal() >= minPriority.ordinal();
    }
}
