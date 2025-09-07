package com.bmessi.pickupsportsapp.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class NotificationService {

    public List<NotificationSummary> getNotifications(String username, int page, int size) {
        // Mock notifications for now - in real implementation, this would query a notifications table
        return Arrays.asList(
            NotificationSummary.builder()
                .id(1L)
                .title("Game Invitation")
                .message("You've been invited to join Evening Futsal League")
                .type("GAME_INVITE")
                .isRead(false)
                .createdAt(LocalDateTime.now().minusHours(2).toString())
                .build(),
            NotificationSummary.builder()
                .id(2L)
                .title("Game Update")
                .message("Your game 'Morning Basketball' has been updated")
                .type("GAME_UPDATE")
                .isRead(true)
                .createdAt(LocalDateTime.now().minusDays(1).toString())
                .build(),
            NotificationSummary.builder()
                .id(3L)
                .title("Achievement Unlocked")
                .message("Congratulations! You've unlocked the 'First Game' achievement")
                .type("ACHIEVEMENT")
                .isRead(false)
                .createdAt(LocalDateTime.now().minusDays(2).toString())
                .build()
        );
    }

    public int getUnreadCount(String username) {
        // Mock unread count - in real implementation, this would query the database
        return 2;
    }

    public void markAsRead(Long notificationId, String username) {
        // Mock implementation - in real implementation, this would update the database
        System.out.println("Marking notification " + notificationId + " as read for user " + username);
    }

    public void markAllAsRead(String username) {
        // Mock implementation - in real implementation, this would update all notifications for the user
        System.out.println("Marking all notifications as read for user " + username);
    }

    // DTO
    @lombok.Data
    @lombok.Builder
    public static class NotificationSummary {
        private Long id;
        private String title;
        private String message;
        private String type;
        private boolean isRead;
        private String createdAt;
    }
}
