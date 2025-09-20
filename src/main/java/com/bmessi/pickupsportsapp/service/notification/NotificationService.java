package com.bmessi.pickupsportsapp.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for managing user notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Create a notification for a user.
     */
    @Transactional
    public void createNotification(String username, String message) {
        try {
            jdbcTemplate.update("""
                INSERT INTO user_notifications (user_id, message, created_at, is_read)
                SELECT u.id, ?, ?, false
                FROM app_user u
                WHERE u.username = ?
                """, message, OffsetDateTime.now(), username);
            log.debug("Created notification for user: {}", username);
        } catch (Exception e) {
            log.error("Failed to create notification for user: {}", username, e);
            throw e;
        }
    }

    /**
     * Mark a notification as read.
     */
    @Transactional
    public void markAsRead(Long notificationId, String username) {
        int updated = jdbcTemplate.update("""
            UPDATE user_notifications
            SET is_read = true, read_at = ?
            WHERE id = ? AND user_id = (SELECT id FROM app_user WHERE username = ?)
            """, OffsetDateTime.now(), notificationId, username);

        if (updated == 0) {
            log.warn("No notification found with id {} for user {}", notificationId, username);
        }
    }

    /**
     * Get unread notifications for a user.
     */
    public List<Map<String, Object>> getUnreadNotifications(String username) {
        return jdbcTemplate.queryForList("""
            SELECT n.id, n.message, n.created_at
            FROM user_notifications n
            JOIN app_user u ON u.id = n.user_id
            WHERE u.username = ? AND n.is_read = false
            ORDER BY n.created_at DESC
            LIMIT 50
            """, username);
    }

    /**
     * Get notification count for a user.
     */
    public int getUnreadCount(String username) {
        return jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM user_notifications n
            JOIN app_user u ON u.id = n.user_id
            WHERE u.username = ? AND n.is_read = false
            """, Integer.class, username);
    }

    /**
     * Create a game notification for a user.
     */
    @Transactional
    public void createGameNotification(String username, String title, String message, String gameId, String type) {
        try {
            String fullMessage = title + ": " + message;
            jdbcTemplate.update("""
                INSERT INTO user_notifications (user_id, message, created_at, is_read)
                SELECT u.id, ?, ?, false
                FROM app_user u
                WHERE u.username = ?
                """, fullMessage, OffsetDateTime.now(), username);
            log.debug("Created game notification for user: {} with type: {}", username, type);
        } catch (Exception e) {
            log.error("Failed to create game notification for user: {}", username, e);
            throw e;
        }
    }

    /**
     * Get user notifications with pagination and read status filter.
     */
    public List<Map<String, Object>> getUserNotifications(String username, boolean unreadOnly, org.springframework.data.domain.Pageable pageable) {
        String sql = """
            SELECT n.id, n.message, n.created_at, n.is_read, n.read_at
            FROM user_notifications n
            JOIN app_user u ON u.id = n.user_id
            WHERE u.username = ?
            """ + (unreadOnly ? " AND n.is_read = false" : "") + """
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
            """;

        return jdbcTemplate.queryForList(sql, username, pageable.getPageSize(), pageable.getOffset());
    }

    /**
     * Get user notifications without pagination.
     */
    public List<Map<String, Object>> getUserNotifications(String username) {
        return jdbcTemplate.queryForList("""
            SELECT n.id, n.message, n.created_at, n.is_read, n.read_at
            FROM user_notifications n
            JOIN app_user u ON u.id = n.user_id
            WHERE u.username = ?
            ORDER BY n.created_at DESC
            LIMIT 100
            """, username);
    }

    /**
     * Get unread notification count with alias method.
     */
    public int unreadCount(String username) {
        return getUnreadCount(username);
    }

    /**
     * Mark notification as read with alias method.
     */
    @Transactional
    public void markAsReadForUser(Long notificationId, String username) {
        markAsRead(notificationId, username);
    }

    /**
     * Mark multiple notifications as read.
     */
    @Transactional
    public void markAsReadForUser(java.util.Collection<Long> notificationIds, String username) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            return;
        }

        String placeholders = String.join(",", java.util.Collections.nCopies(notificationIds.size(), "?"));
        Object[] params = new Object[notificationIds.size() + 2];
        params[0] = OffsetDateTime.now();
        params[params.length - 1] = username;

        int i = 1;
        for (Long id : notificationIds) {
            params[i++] = id;
        }

        String sql = "UPDATE user_notifications " +
                    "SET is_read = true, read_at = ? " +
                    "WHERE id IN (" + placeholders + ") " +
                    "AND user_id = (SELECT id FROM app_user WHERE username = ?)";

        jdbcTemplate.update(sql, params);
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public void markAllAsReadForUser(String username) {
        jdbcTemplate.update("""
            UPDATE user_notifications
            SET is_read = true, read_at = ?
            WHERE is_read = false
            AND user_id = (SELECT id FROM app_user WHERE username = ?)
            """, OffsetDateTime.now(), username);
    }

    /**
     * Delete a notification for a user.
     */
    @Transactional
    public void deleteNotificationForUser(Long notificationId, String username) {
        int deleted = jdbcTemplate.update("""
            DELETE FROM user_notifications
            WHERE id = ? AND user_id = (SELECT id FROM app_user WHERE username = ?)
            """, notificationId, username);

        if (deleted == 0) {
            log.warn("No notification found with id {} for user {}", notificationId, username);
        }
    }
}
