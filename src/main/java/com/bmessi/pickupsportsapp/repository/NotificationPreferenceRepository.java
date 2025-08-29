package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.notification.NotificationPreference;
import com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for user notification preferences.
 */
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    /**
     * Find user's preference for specific event type and channel.
     */
    Optional<NotificationPreference> findByUser_IdAndEventTypeAndChannel(
        Long userId, 
        String eventType, 
        NotificationTemplate.NotificationChannel channel
    );

    /**
     * Find all preferences for a user.
     */
    List<NotificationPreference> findByUser_IdOrderByEventTypeAscChannelAsc(Long userId);

    /**
     * Find all enabled preferences for a user and event type.
     */
    @Query("SELECT np FROM NotificationPreference np WHERE np.user.id = :userId " +
           "AND np.eventType = :eventType AND np.enabled = true")
    List<NotificationPreference> findEnabledPreferencesForUserAndEvent(
        @Param("userId") Long userId, 
        @Param("eventType") String eventType
    );

    /**
     * Find all enabled preferences for a user, event type, and channel.
     */
    @Query("SELECT np FROM NotificationPreference np WHERE np.user.id = :userId " +
           "AND np.eventType = :eventType AND np.channel = :channel AND np.enabled = true")
    Optional<NotificationPreference> findEnabledPreference(
        @Param("userId") Long userId, 
        @Param("eventType") String eventType,
        @Param("channel") NotificationTemplate.NotificationChannel channel
    );

    /**
     * Find preferences for users who want notifications for a specific event type via a channel.
     */
    @Query("SELECT np FROM NotificationPreference np WHERE np.eventType = :eventType " +
           "AND np.channel = :channel AND np.enabled = true")
    List<NotificationPreference> findEnabledPreferencesForEventAndChannel(
        @Param("eventType") String eventType,
        @Param("channel") NotificationTemplate.NotificationChannel channel
    );

    /**
     * Check if user has notifications enabled for event type and channel.
     */
    @Query("SELECT CASE WHEN COUNT(np) > 0 THEN true ELSE false END FROM NotificationPreference np " +
           "WHERE np.user.id = :userId AND np.eventType = :eventType " +
           "AND np.channel = :channel AND np.enabled = true")
    boolean isNotificationEnabled(
        @Param("userId") Long userId,
        @Param("eventType") String eventType,
        @Param("channel") NotificationTemplate.NotificationChannel channel
    );

    /**
     * Get user preferences for multiple event types and a channel.
     */
    @Query("SELECT np FROM NotificationPreference np WHERE np.user.id = :userId " +
           "AND np.eventType IN :eventTypes AND np.channel = :channel")
    List<NotificationPreference> findByUserAndEventTypesAndChannel(
        @Param("userId") Long userId,
        @Param("eventTypes") List<String> eventTypes,
        @Param("channel") NotificationTemplate.NotificationChannel channel
    );

    /**
     * Count enabled preferences for a user.
     */
    long countByUser_IdAndEnabledTrue(Long userId);

    /**
     * Delete all preferences for a user (for account deletion).
     */
    void deleteByUser_Id(Long userId);
}