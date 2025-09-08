package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.i18n.EventI18n;
import com.bmessi.pickupsportsapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;

/**
 * Handles waitlist promotion events and delivers notifications through
 * in-app, push and email channels.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "notification.service.enabled", havingValue = "true", matchIfMissing = false)
public class PromotionNotifier {

    private final NotificationService notificationService;
    private final PushNotificationService pushNotificationService;
    private final EmailService emailService;

    @EventListener
    public void onPromotion(WaitlistPromotionEvent event) {
        String message = EventI18n.subject("promoted", Locale.getDefault());
        try {
            notificationService.createNotification(event.username(), message);
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for {}: {}", event.username(), e.getMessage());
        }
        try {
            pushNotificationService.send(event.username(), message, "");
        } catch (Exception e) {
            log.warn("Failed to enqueue push notification for {}: {}", event.username(), e.getMessage());
        }
        try {
            Map<String, String> model = Map.of(
                    "sport", event.sport() == null ? "" : event.sport(),
                    "location", event.location() == null ? "" : event.location(),
                    "actor", "system"
            );
            emailService.sendGameEventEmailNow(event.username(), "promoted", model, Locale.getDefault());
        } catch (Exception e) {
            log.warn("Failed to send email for {}: {}", event.username(), e.getMessage());
        }
    }
}
