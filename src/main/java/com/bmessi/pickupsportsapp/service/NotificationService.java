package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Notification;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Notification createNotification(String username, String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Notification message must not be blank");
        }
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + username);
        }
        Notification n = Notification.builder()
                .user(user)
                .message(message.trim())
                .build();
        Notification saved = notificationRepository.save(n);
        log.debug("Created notification {} for user {}", saved.getId(), username);
        return saved;
    }

    // Helper for game-related events (keeps message construction centralized)
    @Transactional
    public Notification createGameNotification(String recipientUsername, String actorUsername, String sport, String location, String action) {
        String msg = String.format("User %s %s %s at %s", actorUsername, action, sport, location);
        return createNotification(recipientUsername, msg);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return List.of();
        }
        // Sorted newest first (leverages index on user and timestamps)
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId(), Pageable.unpaged()).getContent();
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        if (!n.isRead()) {
            n.setRead(true);
            n.setReadAt(Instant.now());
            n = notificationRepository.save(n);
            log.debug("Marked notification {} as read", notificationId);
        }
        return n;
    }

    @Transactional
    public int markAllAsReadForUser(String username) {
        User u = userRepository.findByUsername(username);
        if (u == null) return 0;
        int updated = notificationRepository.markAllAsRead(u.getId());
        log.debug("Marked {} notifications as read for user {}", updated, username);
        return updated;
    }

    @Transactional
    public int markAsReadForUser(String username, Collection<Long> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) return 0;
        User u = userRepository.findByUsername(username);
        if (u == null) return 0;
        int updated = notificationRepository.markAsRead(u.getId(), notificationIds);
        log.debug("Marked {} notifications as read for user {}", updated, username);
        return updated;
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            log.debug("Delete skipped, notification {} not found", notificationId);
            return;
        }
        notificationRepository.deleteById(notificationId);
        log.debug("Deleted notification {}", notificationId);
    }

    @Transactional
    public int deleteAllReadForUser(String username) {
        User u = userRepository.findByUsername(username);
        if (u == null) return 0;
        int deleted = notificationRepository.deleteReadByUser(u.getId());
        log.debug("Deleted {} read notifications for user {}", deleted, username);
        return deleted;
    }
}