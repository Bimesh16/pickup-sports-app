package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

/**
 * Repository for enhanced notifications with delivery tracking.
 */
public interface EnhancedNotificationRepository extends JpaRepository<EnhancedNotification, Long> {

    /**
     * Find notifications for a user, ordered by creation date (newest first).
     */
    Page<EnhancedNotification> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find undelivered notifications that are ready for delivery or retry.
     */
    @Query("SELECT en FROM EnhancedNotification en WHERE " +
           "(en.deliveryStatus = 'PENDING' OR " +
           "(en.deliveryStatus = 'RETRYING' AND en.retryAt <= :now)) " +
           "AND (en.expiresAt IS NULL OR en.expiresAt > :now) " +
           "ORDER BY en.priority DESC, en.createdAt ASC")
    List<EnhancedNotification> findPendingDeliveries(@Param("now") Instant now);

    /**
     * Find notifications that need retry.
     */
    @Query("SELECT en FROM EnhancedNotification en WHERE " +
           "en.deliveryStatus = 'RETRYING' AND en.retryAt <= :now " +
           "AND en.deliveryAttempts < 5 " +
           "AND (en.expiresAt IS NULL OR en.expiresAt > :now)")
    List<EnhancedNotification> findNotificationsForRetry(@Param("now") Instant now);

    /**
     * Find expired notifications.
     */
    @Query("SELECT en FROM EnhancedNotification en WHERE " +
           "en.expiresAt IS NOT NULL AND en.expiresAt <= :now " +
           "AND en.deliveryStatus NOT IN ('DELIVERED', 'OPENED', 'CLICKED', 'EXPIRED')")
    List<EnhancedNotification> findExpiredNotifications(@Param("now") Instant now);

    /**
     * Mark expired notifications.
     */
    @Modifying
    @Query("UPDATE EnhancedNotification en SET en.deliveryStatus = 'EXPIRED' " +
           "WHERE en.expiresAt IS NOT NULL AND en.expiresAt <= :now " +
           "AND en.deliveryStatus NOT IN ('DELIVERED', 'OPENED', 'CLICKED', 'EXPIRED')")
    int markExpiredNotifications(@Param("now") Instant now);

    /**
     * Count unread notifications for a user.
     */
    @Query("SELECT COUNT(en) FROM EnhancedNotification en WHERE en.user.id = :userId " +
           "AND en.deliveryStatus IN ('DELIVERED', 'PENDING') AND en.openedAt IS NULL")
    long countUnreadByUserId(@Param("userId") Long userId);

    /**
     * Find notifications by external ID (for tracking delivery receipts).
     */
    List<EnhancedNotification> findByExternalId(String externalId);

    /**
     * Find notifications by channel and status.
     */
    List<EnhancedNotification> findByChannelAndDeliveryStatus(
        NotificationTemplate.NotificationChannel channel, 
        EnhancedNotification.DeliveryStatus status
    );

    /**
     * Find recent notifications for analytics.
     */
    @Query("SELECT en FROM EnhancedNotification en WHERE en.createdAt >= :since " +
           "ORDER BY en.createdAt DESC")
    List<EnhancedNotification> findRecentNotifications(@Param("since") Instant since);

    /**
     * Get delivery statistics for a time period.
     */
    @Query("SELECT en.deliveryStatus, COUNT(en) FROM EnhancedNotification en " +
           "WHERE en.createdAt >= :since AND en.createdAt < :until " +
           "GROUP BY en.deliveryStatus")
    List<Object[]> getDeliveryStats(@Param("since") Instant since, @Param("until") Instant until);

    /**
     * Get notification statistics by channel.
     */
    @Query("SELECT en.channel, en.deliveryStatus, COUNT(en) FROM EnhancedNotification en " +
           "WHERE en.createdAt >= :since " +
           "GROUP BY en.channel, en.deliveryStatus")
    List<Object[]> getChannelStats(@Param("since") Instant since);

    /**
     * Delete old notifications (for cleanup).
     */
    @Modifying
    @Query("DELETE FROM EnhancedNotification en WHERE en.createdAt < :cutoff")
    int deleteOldNotifications(@Param("cutoff") Instant cutoff);

    /**
     * Find failed notifications that have exceeded retry limit.
     */
    @Query("SELECT en FROM EnhancedNotification en WHERE " +
           "en.deliveryStatus = 'FAILED' AND en.deliveryAttempts >= 5")
    List<EnhancedNotification> findFailedNotificationsBeyondRetryLimit();

    /**
     * Count notifications by event type and status for a user.
     */
    @Query("SELECT COUNT(en) FROM EnhancedNotification en WHERE en.user.id = :userId " +
           "AND en.eventType = :eventType AND en.deliveryStatus = :status")
    long countByUserEventTypeAndStatus(
        @Param("userId") Long userId,
        @Param("eventType") String eventType,
        @Param("status") EnhancedNotification.DeliveryStatus status
    );
}