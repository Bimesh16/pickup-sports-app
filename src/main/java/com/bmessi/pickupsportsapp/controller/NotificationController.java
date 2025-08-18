package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.NotificationDTO;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.service.NotificationService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;
    private final ApiMapper mapper;

    // Create a notification for a user (by username)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody CreateNotificationRequest request) {
        try {
            var notification = notificationService.createNotification(request.username(), request.message());
            log.debug("Created notification {} for user {}", notification.getId(), request.username());
            return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toNotificationDTO(notification));
        } catch (IllegalArgumentException e) {
            log.debug("Failed to create notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get current user's notifications
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<NotificationDTO> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        String username = principal.getName();
        log.debug("Getting notifications for user: {}, unreadOnly: {}", username, unreadOnly);

        List<com.bmessi.pickupsportsapp.entity.Notification> all = notificationService.getUserNotifications(username);
        List<com.bmessi.pickupsportsapp.entity.Notification> filtered = unreadOnly ?
                all.stream().filter(n -> !n.isRead()).toList() : all;

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        var slice = filtered.subList(start, end);

        log.debug("Returning {} notifications for user {}", slice.size(), username);
        return new PageImpl<>(mapper.toNotificationDTOs(slice), pageable, filtered.size());
    }

    // Mark notification as read using the improved service method
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        try {
            String username = principal.getName();
            log.debug("Attempting to mark notification {} as read for user {}", id, username);

            var notification = notificationService.markAsReadForUser(id, username);

            log.debug("Successfully marked notification {} as read", id);
            return ResponseEntity.ok(mapper.toNotificationDTO(notification));

        } catch (IllegalArgumentException e) {
            log.debug("Error marking notification {} as read: {}", id, e.getMessage());

            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Notification not found", "notificationId", id));
            } else if (e.getMessage().contains("your own")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only access your own notifications"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", e.getMessage()));
            }
        } catch (Exception e) {
            log.error("Unexpected error marking notification {} as read: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark notification as read"));
        }
    }

    // Delete a notification (ownership enforced)
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Principal principal) {
        try {
            String username = principal.getName();
            log.debug("Attempting to delete notification {} for user {}", id, username);
            notificationService.deleteNotificationForUser(id, username);
            log.debug("Successfully deleted notification {}", id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.debug("Failed to delete notification {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Notification not found", "notificationId", id));
        } catch (Exception e) {
            log.error("Unexpected error deleting notification {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete notification"));
        }
    }

    // Get notification count for user
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getNotificationCount(Principal principal) {
        String username = principal.getName();
        List<com.bmessi.pickupsportsapp.entity.Notification> all = notificationService.getUserNotifications(username);
        long unreadCount = all.stream().filter(n -> !n.isRead()).count();

        return ResponseEntity.ok(Map.of(
                "total", all.size(),
                "unread", unreadCount,
                "read", all.size() - unreadCount
        ));
    }

    // Mark all notifications as read
    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Principal principal) {
        String username = principal.getName();
        int updated = notificationService.markAllAsReadForUser(username);
        log.debug("Marked {} notifications as read for user {}", updated, username);

        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "updatedCount", updated
        ));
    }

    // Request DTO
    public record CreateNotificationRequest(@NotBlank String username, @NotBlank String message) {}
}