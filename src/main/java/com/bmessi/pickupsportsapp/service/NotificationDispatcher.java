package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Notification;
import com.bmessi.pickupsportsapp.service.push.PushSenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

/**
 * Centralized dispatcher for user notifications across channels.
 * Future: introduce templates/i18n per event type and dedupe logic.
 */
@Service
@RequiredArgsConstructor
public class NotificationDispatcher {

    private final NotificationService inApp;
    private final EmailService email;
    private final PushSenderService push;
    private final UserNotificationPrefsService prefs;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    // optional Redis for cross-node dedupe
    private final java.util.Optional<org.springframework.data.redis.core.StringRedisTemplate> redis;

    // in-memory fallback dedupe for short window
    private final java.util.concurrent.ConcurrentHashMap<String, Long> dedupe = new java.util.concurrent.ConcurrentHashMap<>();
    @org.springframework.beans.factory.annotation.Value("${notifications.dedupe.seconds:30}")
    private long dedupeSeconds;

    @Transactional
    public void dispatchGameEvent(String recipient, String actor, String sport, String location, String action) {
        // Dedupe key: recipient+action+sport+location
        String key = "notif:dedupe:" + recipient + "|" + norm(action) + "|" + safe(sport) + "|" + safe(location);
        if (!dedupePass(key)) return;

        var p = prefs.getOrDefaults(recipient);

        boolean allowInApp = switch (norm(action)) {
            case "joined", "rsvp" -> p.isInAppOnRsvp();
            case "created", "create" -> p.isInAppOnCreate();
            case "cancelled", "canceled", "cancel" -> p.isInAppOnCancel();
            case "promoted" -> true;
            case "reminder" -> true;
            default -> true;
        };
        boolean allowEmail = switch (norm(action)) {
            case "joined", "rsvp" -> p.isEmailOnRsvp();
            case "created", "create" -> p.isEmailOnCreate();
            case "cancelled", "canceled", "cancel" -> p.isEmailOnCancel();
            case "promoted" -> true;
            case "reminder" -> true;
            default -> false;
        };
        boolean allowPush = switch (norm(action)) {
            case "joined", "rsvp" -> p.isPushOnRsvp();
            case "created", "create" -> p.isPushOnCreate();
            case "cancelled", "canceled", "cancel" -> p.isPushOnCancel();
            case "promoted" -> true;
            case "reminder" -> true;
            default -> true;
        };

        // Fetch user locale (best-effort)
        java.util.Locale locale = resolveLocale(recipient);

        if (allowInApp) {
            inApp.createGameNotification(recipient, actor, sport, location, action);
        }
        if (allowEmail) {
            try {
                email.sendGameEventEmail(recipient, action, Map.of(
                        "actor", safe(actor), "sport", safe(sport), "location", safe(location)
                ), locale);
            } catch (Exception ignore) {}
        }
        if (allowPush) {
            String title = switch (norm(action)) {
                case "created", "create" -> "New game created";
                case "cancelled", "canceled", "cancel" -> "Game canceled";
                case "joined", "rsvp" -> "Game updated";
                case "promoted" -> "You’ve been promoted from the waitlist";
                case "reminder" -> "Game reminder";
                default -> "Game notification";
            };
            String body = (safe(actor).isEmpty() ? "" : actor + " ") + action + " " + safe(sport) + " at " + safe(location);
            push.enqueue(recipient, title, body, null);
        }
    }

    private java.util.Locale resolveLocale(String username) {
        try {
            String tag = jdbc.queryForObject("SELECT locale FROM app_user WHERE username = ?", String.class, username);
            if (tag == null || tag.isBlank()) return java.util.Locale.getDefault();
            return java.util.Locale.forLanguageTag(tag);
        } catch (Exception e) {
            return java.util.Locale.getDefault();
        }
    }

    private boolean dedupePass(String key) {
        long ttlMs = Math.max(0, dedupeSeconds) * 1000L;
        try {
            if (redis != null && redis.isPresent()) {
                var ops = redis.get().opsForValue();
                Boolean set = ops.setIfAbsent(key, "1", java.time.Duration.ofMillis(ttlMs));
                if (Boolean.FALSE.equals(set)) {
                    return false;
                }
                return true;
            }
        } catch (Exception ignore) {}
        // fallback in-memory dedupe
        long now = System.currentTimeMillis();
        Long last = dedupe.get(key);
        if (last != null && (now - last) < ttlMs) return false;
        dedupe.put(key, now);
        return true;
    }

    private static String norm(String s) { return s == null ? "" : s.toLowerCase(Locale.ROOT).trim(); }
    private static String safe(String s) { return s == null ? "" : s; }
}
