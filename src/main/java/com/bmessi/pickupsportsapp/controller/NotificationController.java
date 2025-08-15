package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.NotificationDTO;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.service.NotificationService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final ApiMapper mapper;

    // Create a notification for a user (by username)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody CreateNotificationRequest request) {
        var notification = notificationService.createNotification(request.username(), request.message());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toNotificationDTO(notification));
    }

    // Get current user's notifications (paged view derived from existing service list)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<NotificationDTO> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        String username = principal.getName();
        List<com.bmessi.pickupsportsapp.entity.Notification> all = notificationService.getUserNotifications(username);
        List<com.bmessi.pickupsportsapp.entity.Notification> filtered = unreadOnly ? all.stream().filter(n -> !n.isRead()).toList() : all;

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        var slice = filtered.subList(start, end);
        return new PageImpl<>(mapper.toNotificationDTOs(slice), pageable, filtered.size());
    }

    // Mark single notification as read
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id, Principal principal) {
        var notification = notificationService.markAsRead(id);
        // Optional ownership guard if needed:
        if (notification.getUser() != null && notification.getUser().getUsername() != null) {
            if (!notification.getUser().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(mapper.toNotificationDTO(notification));
    }

    // Delete a notification
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Principal principal) {
        // Optionally fetch and check ownership before deleting
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    // Request DTO
    public record CreateNotificationRequest(@NotBlank String username, @NotBlank String message) {}
}