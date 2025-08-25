package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.NotificationJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * Consumes notification jobs from the queue and delivers them via the
 * appropriate channels.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationDispatcher {

    private final NotificationService notificationService;
    private final EmailService emailService;

    @RabbitListener(queues = "${notifications.queue:notifications.queue}")
    public void dispatch(NotificationJob job) {
        try {
            String msg = formatGameNotificationMessage(job.actor(), job.action(), job.sport(), job.location());
            notificationService.createNotification(job.recipient(), msg);
            emailService.sendGameEventEmailNow(job.recipient(), job.action(), job.model(), job.locale());
        } catch (Exception e) {
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

