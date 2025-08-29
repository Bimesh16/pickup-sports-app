package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for notification templates.
 */
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {

    /**
     * Find active template for specific event type, channel, and locale.
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.eventType = :eventType " +
           "AND nt.channel = :channel AND nt.locale = :locale AND nt.active = true")
    Optional<NotificationTemplate> findActiveTemplate(
        @Param("eventType") String eventType,
        @Param("channel") NotificationTemplate.NotificationChannel channel,
        @Param("locale") String locale
    );

    /**
     * Find template with fallback to default locale if specific locale not found.
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.eventType = :eventType " +
           "AND nt.channel = :channel AND nt.active = true " +
           "AND (nt.locale = :locale OR nt.locale = 'en') " +
           "ORDER BY CASE WHEN nt.locale = :locale THEN 1 ELSE 2 END")
    List<NotificationTemplate> findTemplateWithFallback(
        @Param("eventType") String eventType,
        @Param("channel") NotificationTemplate.NotificationChannel channel,
        @Param("locale") String locale
    );

    /**
     * Find all active templates for an event type.
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.eventType = :eventType AND nt.active = true")
    List<NotificationTemplate> findActiveTemplatesForEvent(@Param("eventType") String eventType);

    /**
     * Find all templates for a specific channel.
     */
    List<NotificationTemplate> findByChannelAndActiveTrue(NotificationTemplate.NotificationChannel channel);

    /**
     * Find all active templates.
     */
    List<NotificationTemplate> findByActiveTrue();

    /**
     * Check if template exists for event type and channel.
     */
    boolean existsByEventTypeAndChannelAndActiveTrue(String eventType, NotificationTemplate.NotificationChannel channel);
}
