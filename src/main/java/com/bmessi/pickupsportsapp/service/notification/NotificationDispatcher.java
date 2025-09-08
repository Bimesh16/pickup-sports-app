package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.dto.NotificationJob;
import com.bmessi.pickupsportsapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import io.micrometer.core.instrument.MeterRegistry;

/**
 * Consumes notification jobs from the queue and delivers them via the
 * appropriate channels.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "notification.service.enabled", havingValue = "true", matchIfMissing = false)
public class NotificationDispatcher {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final MeterRegistry meterRegistry;

    @RabbitListener(queues = "${notifications.queue:notifications.queue}")
    public void dispatch(NotificationJob job) {
        try {
            String msg = formatGameNotificationMessage(job.actor(), job.action(), job.sport(), job.location());
            notificationService.createNotification(job.recipient(), msg);
            emailService.sendGameEventEmailNow(job.recipient(), job.action(), job.model(), job.locale());
            meterRegistry.counter("notifications_dispatch_success").increment();
        } catch (Exception e) {
            meterRegistry.counter("notifications_dispatch_error").increment();
            log.error("Failed to process notification job", e);
        }
    }

    private static String formatGameNotificationMessage(String actorUsername, String action, String sport, String location) {
        return "%s %s your %s game at %s".formatted(
                actorUsername == null ? "" : actorUsername,
                action == null ? "" : action,
                sport == null ? "" : sport,
                location == null ? "" : location
        );
    }
}

