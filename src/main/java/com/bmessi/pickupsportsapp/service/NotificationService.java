package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Notification;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final String ERR_MESSAGE_BLANK = "Notification message must not be blank";
    private static final String ERR_USER_NOT_FOUND = "User not found: %s";
    private static final String ERR_NOTIFICATION_NOT_FOUND = "Notification not found: %d";

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate broker;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final com.bmessi.pickupsportsapp.service.UserNotificationPrefsService prefsService;
    private final com.bmessi.pickupsportsapp.service.EmailService emailService;

    @Timed(value = "notifications.create", description = "Time to create a notification")
    @Transactional
    @CacheEvict(cacheNames = "notifications-first-page", allEntries = true)
    public Notification createNotification(String username, String message) {
        String normalizedMessage = validateAndNormalizeMessage(message);
        User user = requireUserByUsername(username);

        Notification notification = Notification.builder()
                .user(user)
                .message(normalizedMessage)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        log.debug("Created notification {} for user {}", savedNotification.getId(), username);

        // WS event
        try {
            broker.convertAndSendToUser(user.getUsername(), "/queue/notifications",
                    com.bmessi.pickupsportsapp.dto.NotificationEvent.created(savedNotification));
            meterRegistry.counter("notifications.ws.sent", "type", "created").increment();
        } catch (Exception ignore) {
            meterRegistry.counter("notifications.ws.failed", "type", "created").increment();
            // do not fail user flow on WS issues
        }
        return savedNotification;
    }

    // Helper used by game flows to compose a message
    @Transactional
    public Notification createGameNotification(String recipientUsername, String actorUsername, String sport, String location, String action) {
        String msg = formatGameNotificationMessage(actorUsername, action, sport, location);
        // preferences
        var prefs = prefsService.getOrDefaults(recipientUsername);
        boolean inApp = switch ((action == null ? "" : action.toLowerCase())) {
            case "joined", "rsvp" -> prefs.isInAppOnRsvp();
            case "created", "create" -> prefs.isInAppOnCreate();
            case "cancelled", "canceled", "cancel" -> prefs.isInAppOnCancel();
            default -> true;
        };
        boolean email = switch ((action == null ? "" : action.toLowerCase())) {
            case "joined", "rsvp" -> prefs.isEmailOnRsvp();
            case "created", "create" -> prefs.isEmailOnCreate();
            case "cancelled", "canceled", "cancel" -> prefs.isEmailOnCancel();
            default -> false;
        };
        Notification result = null;
        if (inApp) {
            result = createNotification(recipientUsername, msg);
        }
        if (email) {
            try {
                java.util.Map<String, String> model = java.util.Map.of(
                        "actor", actorUsername == null ? "" : actorUsername,
                        "sport", sport == null ? "" : sport,
                        "location", location == null ? "" : location
                );
                emailService.sendGameEventEmail(recipientUsername, action, model);
            } catch (Exception ignore) {}
        }
        return result;
    }

    // Legacy API preserved: returns all notifications unpaged
    @Timed(value = "notifications.list.all", description = "Time to list all notifications (unpaged)")
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String username) {
        return getUserNotifications(username, false, Pageable.unpaged()).getContent();
    }

    // New pageable-aware API
    @Timed(value = "notifications.list.page", description = "Time to list notifications (paged)")
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(String username, Pageable pageable) {
        return getUserNotifications(username, false, pageable);
    }

    // New pageable-aware API with unreadOnly flag (DB-side filtering)
    @Timed(value = "notifications.list.page.flag", description = "Time to list notifications (paged/unreadOnly)")
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "notifications-first-page",
            key = "T(java.util.Objects).hash(#username) + '|' + #unreadOnly + '|' + #pageable.pageSize + '|' + #pageable.sort.toString()",
            condition = "#pageable != null && #pageable.pageNumber == 0")
    public Page<Notification> getUserNotifications(String username, boolean unreadOnly, Pageable pageable) {
        User user = requireUserByUsername(username);
        if (unreadOnly) {
            return notificationRepository.findByUser_IdAndReadFalseOrderByCreatedAtDesc(user.getId(), pageable);
        }
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId(), pageable);
    }

    @Timed(value = "notifications.read", description = "Time to mark one notification read")
    @Transactional
    @CacheEvict(cacheNames = "notifications-first-page", allEntries = true)
    public Notification markAsReadForUser(Long id, String username) {
        User user = requireUserByUsername(username);
        Notification notification = notificationRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException(String.format(ERR_NOTIFICATION_NOT_FOUND, id)));
        notification.markRead();
        Notification saved = notificationRepository.save(notification);
        // WS event
        try {
            broker.convertAndSendToUser(user.getUsername(), "/queue/notifications",
                    com.bmessi.pickupsportsapp.dto.NotificationEvent.read(saved));
            meterRegistry.counter("notifications.ws.sent", "type", "read").increment();
        } catch (Exception ignore) {
            meterRegistry.counter("notifications.ws.failed", "type", "read").increment();
        }
        return saved;
    }

    @Timed(value = "notifications.read.all", description = "Time to mark all notifications read")
    @Transactional
    @CacheEvict(cacheNames = "notifications-first-page", allEntries = true)
    public int markAllAsReadForUser(String username) {
        User user = requireUserByUsername(username);
        return notificationRepository.markAllAsRead(user.getId());
    }

    @Timed(value = "notifications.read.bulk", description = "Time to mark a set of notifications read")
    @Transactional
    @CacheEvict(cacheNames = "notifications-first-page", allEntries = true)
    public int markAsReadForUser(java.util.Collection<Long> ids, String username) {
        if (ids == null || ids.isEmpty()) return 0;
        User user = requireUserByUsername(username);
        return notificationRepository.markAsRead(user.getId(), ids);
    }

    @Timed(value = "notifications.unread.count", description = "Time to count unread notifications")
    @Transactional(readOnly = true)
    public long unreadCount(String username) {
        User user = requireUserByUsername(username);
        return notificationRepository.countByUser_IdAndReadFalse(user.getId());
    }

    @Timed(value = "notifications.delete", description = "Time to delete a notification")
    @Transactional
    @CacheEvict(cacheNames = "notifications-first-page", allEntries = true)
    public void deleteNotificationForUser(Long id, String username) {
        User user = requireUserByUsername(username);
        int deleted = notificationRepository.deleteByIdAndUser_Id(id, user.getId());
        if (deleted == 0) {
            throw new IllegalArgumentException(String.format(ERR_NOTIFICATION_NOT_FOUND, id));
        }
        // WS event
        try {
            broker.convertAndSendToUser(user.getUsername(), "/queue/notifications",
                    com.bmessi.pickupsportsapp.dto.NotificationEvent.deleted(id));
            meterRegistry.counter("notifications.ws.sent", "type", "deleted").increment();
        } catch (Exception ignore) {
            meterRegistry.counter("notifications.ws.failed", "type", "deleted").increment();
        }
    }

    // --- Helpers ---

    private static String validateAndNormalizeMessage(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(ERR_MESSAGE_BLANK);
        }
        return message.trim();
    }

    private static String formatGameNotificationMessage(String actorUsername, String action, String sport, String location) {
        return "%s %s your %s game at %s".formatted(actorUsername, action, sport, location);
    }

    private User requireUserByUsername(String username) {
        return userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(String.format(ERR_USER_NOT_FOUND, username)));
    }
}