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
import org.springframework.web.server.ResponseStatusException;

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

    @org.springframework.beans.factory.annotation.Value("${app.http.allow-unsafe-write:false}")
    private boolean allowUnsafeWrite;

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
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSince
    ) {
        String username = principal.getName();
        log.debug("Getting notifications for user: {}, unreadOnly: {}", username, unreadOnly);

        List<com.bmessi.pickupsportsapp.entity.Notification> all = notificationService.getUserNotifications(username);
        List<com.bmessi.pickupsportsapp.entity.Notification> filtered = unreadOnly
                ? all.stream().filter(n -> !n.isRead()).toList()
                : all;

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        var slice = filtered.subList(start, end);

        var page = new PageImpl<>(mapper.toNotificationDTOs(slice), pageable, filtered.size());

        long lastMod = filtered.stream()
                .mapToLong(NotificationController::lastModifiedEpochMilli)
                .max()
                .orElse(System.currentTimeMillis());

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        addPaginationLinks(request, headers, page);
        headers.add("X-Total-Count", String.valueOf(page.getTotalElements()));
        headers.add("Cache-Control", "private, max-age=30");
        headers.add("Last-Modified", httpDate(lastMod));

        Long clientMillis = parseIfModifiedSince(ifModifiedSince);
        if (clientMillis != null && lastMod <= clientMillis) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }

        log.debug("Returning {} notifications for user {}", slice.size(), username);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    // Mark notification as read using the improved service method
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAsRead(@PathVariable Long id,
                                        @RequestHeader(value = "If-Match", required = false) String ifMatch,
                                        @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
                                        Principal principal) {
        try {
            String username = principal.getName();
            log.debug("Attempting to mark notification {} as read for user {}", id, username);

            // Pre-fetch to evaluate preconditions
            var current = notificationService.getUserNotifications(username).stream()
                    .filter(n -> n.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

            enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);
            enforceIfMatch(ifMatch, current.getVersion());
            enforceIfUnmodifiedSince(ifUnmodifiedSince, lastModifiedEpochMilli(current));

            var notification = notificationService.markAsReadForUser(id, username);

            log.debug("Successfully marked notification {} as read", id);
            String etag = (notification.getVersion() == null) ? "W/\"0\"" : "W/\"" + notification.getVersion() + "\"";
            return ResponseEntity.ok()
                    .eTag(etag)
                    .header("Cache-Control", "private, max-age=30")
                    .header("Last-Modified", httpDate(lastModifiedEpochMilli(notification)))
                    .body(mapper.toNotificationDTO(notification));

        } catch (IllegalArgumentException e) {
            log.debug("Error marking notification {} as read: {}", id, e.getMessage());

            if (e.getMessage().toLowerCase().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Notification not found", "notificationId", id));
            } else if (e.getMessage().toLowerCase().contains("your own")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only access your own notifications"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", e.getMessage()));
            }
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            log.error("Unexpected error marking notification {} as read: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark notification as read"));
        }
    }

    // Delete a notification (ownership enforced)
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id,
                                                @RequestHeader(value = "If-Match", required = false) String ifMatch,
                                                @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
                                                Principal principal) {
        try {
            String username = principal.getName();
            log.debug("Attempting to delete notification {} for user {}", id, username);

            // Pre-fetch to evaluate preconditions
            var current = notificationService.getUserNotifications(username).stream()
                    .filter(n -> n.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

            enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);
            enforceIfMatch(ifMatch, current.getVersion());
            enforceIfUnmodifiedSince(ifUnmodifiedSince, lastModifiedEpochMilli(current));

            notificationService.deleteNotificationForUser(id, username);
            log.debug("Successfully deleted notification {}", id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.debug("Failed to delete notification {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Notification not found", "notificationId", id));
        } catch (ResponseStatusException rse) {
            throw rse;
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

        // GET /notifications/{id}
        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<NotificationDTO> getById(@PathVariable Long id, Principal principal) {
            String username = principal.getName();
            var notif = notificationService.getUserNotifications(username).stream()
                    .filter(n -> n.getId().equals(id))
                    .findFirst()
                    .orElse(null);
            if (notif == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            String etag = "W/\"" + (notif.getVersion() == null ? 0L : notif.getVersion()) + "\"";
            long lastMod = (notif.getUpdatedAt() != null ? notif.getUpdatedAt().toEpochMilli()
                    : (notif.getCreatedAt() != null ? notif.getCreatedAt().toEpochMilli() : System.currentTimeMillis()));
            return ResponseEntity.ok()
                    .eTag(etag)
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "private, max-age=30")
                    .header(org.springframework.http.HttpHeaders.LAST_MODIFIED, java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                            .withZone(java.time.ZoneOffset.UTC)
                            .format(java.time.Instant.ofEpochMilli(lastMod)))
                    .body(mapper.toNotificationDTO(notif));
        }

    // ===========================
    // Private helpers
    // ===========================
    private static String normalizeIfMatch(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.startsWith("W/")) s = s.substring(2).trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s;
    }

    private static void enforceIfMatch(String ifMatchHeader, Long currentVersion) {
        if (ifMatchHeader == null || ifMatchHeader.isBlank()) return;
        String norm = normalizeIfMatch(ifMatchHeader);
        String current = String.valueOf(currentVersion == null ? 0L : currentVersion);
        if (!current.equals(norm)) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "ETag mismatch; resource changed");
        }
    }

    private void enforcePreconditionsPresent(String ifMatchHeader, String ifUnmodifiedSinceHeader) {
        if (allowUnsafeWrite) return;
        boolean noIfMatch = (ifMatchHeader == null || ifMatchHeader.isBlank());
        boolean noIus = (ifUnmodifiedSinceHeader == null || ifUnmodifiedSinceHeader.isBlank());
        if (noIfMatch && noIus) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED, "Missing precondition header");
        }
    }

    private static void enforceIfUnmodifiedSince(String ifUnmodifiedSinceHeader, long currentLastModifiedMillis) {
        if (ifUnmodifiedSinceHeader == null || ifUnmodifiedSinceHeader.isBlank()) return;
        try {
            var zdt = java.time.ZonedDateTime.parse(ifUnmodifiedSinceHeader.trim(),
                    java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME);
            long clientMillis = zdt.toInstant().toEpochMilli();
            if (currentLastModifiedMillis > clientMillis) {
                throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "Resource modified since provided date");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid If-Unmodified-Since header");
        }
    }

    private static long lastModifiedEpochMilli(com.bmessi.pickupsportsapp.entity.Notification n) {
        if (n.getUpdatedAt() != null) return n.getUpdatedAt().toEpochMilli();
        if (n.getCreatedAt() != null) return n.getCreatedAt().toEpochMilli();
        return System.currentTimeMillis();
    }

    private static String httpDate(long epochMillis) {
        return java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(java.time.ZoneOffset.UTC)
                .format(java.time.Instant.ofEpochMilli(epochMillis));
    }

    private static Long parseIfModifiedSince(String header) {
        if (header == null || header.isBlank()) return null;
        try {
            var zdt = java.time.ZonedDateTime.parse(header.trim(),
                    java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME);
            return zdt.toInstant().toEpochMilli();
        } catch (Exception ignore) {
            return null;
        }
    }

    private static void addPaginationLinks(jakarta.servlet.http.HttpServletRequest request,
                                           org.springframework.http.HttpHeaders headers,
                                           Page<?> page) {
        if (page == null) return;
        var base = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromRequest(request);
        int number = page.getNumber();
        int size = page.getSize();
        int totalPages = page.getTotalPages();

        java.util.List<String> links = new java.util.ArrayList<>();
        links.add(buildLink(base, number, size, "self"));
        if (number > 0) {
            links.add(buildLink(base, 0, size, "first"));
            links.add(buildLink(base, number - 1, size, "prev"));
        }
        if (number + 1 < totalPages) {
            links.add(buildLink(base, number + 1, size, "next"));
            links.add(buildLink(base, totalPages - 1, size, "last"));
        }
        if (!links.isEmpty()) {
            headers.add(org.springframework.http.HttpHeaders.LINK, String.join(", ", links));
        }
    }

    private static String buildLink(org.springframework.web.util.UriComponentsBuilder base, int page, int size, String rel) {
        String url = base.replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .build(true)
                .toUriString();
        return "<" + url + ">; rel=\"" + rel + "\"";
    }

    // Request DTO
    public record CreateNotificationRequest(@NotBlank String username, @NotBlank String message) {}
}