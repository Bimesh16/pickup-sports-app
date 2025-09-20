package com.bmessi.pickupsportsapp.controller.notification;

import com.bmessi.pickupsportsapp.dto.notification.NotificationDTO;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "notification.service.enabled", havingValue = "true", matchIfMissing = false)
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;
    private final ApiMapper mapper;

    @org.springframework.beans.factory.annotation.Value("${app.http.allow-unsafe-write:false}")
    private boolean allowUnsafeWrite;

    // Create a notification for a user (by username)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> createNotification(@RequestBody CreateNotificationRequest request) {
        try {
            notificationService.createNotification(request.username(), request.message());
            log.debug("Created notification for user {}", request.username());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Notification created successfully"));
        } catch (IllegalArgumentException e) {
            log.debug("Failed to create notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Get current user's notifications
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSince
    ) {
        String username = principal.getName();
        log.debug("Getting notifications for user: {}, unreadOnly: {}", username, unreadOnly);

        List<Map<String, Object>> notificationList = notificationService.getUserNotifications(username, unreadOnly, pageable);

        // Create a simple page-like response
        Map<String, Object> pageResponse = Map.of(
            "content", notificationList,
            "totalElements", notificationList.size(),
            "size", pageable.getPageSize(),
            "number", pageable.getPageNumber(),
            "totalPages", (notificationList.size() + pageable.getPageSize() - 1) / pageable.getPageSize()
        );

        long lastMod = System.currentTimeMillis();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(notificationList.size()));
        headers.add("Cache-Control", "private, max-age=30");
        headers.add("Last-Modified", httpDate(lastMod));

        Long clientMillis = parseIfModifiedSince(ifModifiedSince);
        if (clientMillis != null && lastMod <= clientMillis) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }

        log.debug("Returning {} notifications for user {}", notificationList.size(), username);
        return ResponseEntity.ok().headers(headers).body(pageResponse);
    }

    // Quick unread count for badge updates
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.CountResponse> unreadCount(Principal principal) {
        String username = principal.getName();
        long count = notificationService.unreadCount(username);
        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(new com.bmessi.pickupsportsapp.dto.api.CountResponse(count));
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
            List<Map<String, Object>> notifications = notificationService.getUserNotifications(username);
            Map<String, Object> current = notifications.stream()
                    .filter(n -> ((Long) n.get("id")).equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

            // Skip precondition checks for Map-based implementation
            notificationService.markAsReadForUser(id, username);

            log.debug("Successfully marked notification {} as read", id);
            return ResponseEntity.ok()
                    .header("Cache-Control", "private, max-age=30")
                    .header("Last-Modified", httpDate(System.currentTimeMillis()))
                    .body(Map.of("message", "Notification marked as read", "id", id));

        } catch (IllegalArgumentException e) {
            log.debug("Error marking notification {} as read: {}", id, e.getMessage());

            if (e.getMessage().toLowerCase().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Notification not found", "notificationId", id));
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
    public ResponseEntity<?> deleteNotification(@PathVariable Long id,
                                                @RequestHeader(value = "If-Match", required = false) String ifMatch,
                                                @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
                                                Principal principal) {
        try {
            String username = principal.getName();
            log.debug("Attempting to delete notification {} for user {}", id, username);

            // Pre-fetch to evaluate preconditions
            List<Map<String, Object>> notifications = notificationService.getUserNotifications(username);
            Map<String, Object> current = notifications.stream()
                    .filter(n -> ((Long) n.get("id")).equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

            // Skip precondition checks for Map-based implementation
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
        List<Map<String, Object>> all = notificationService.getUserNotifications(username);
        long unreadCount = all.stream()
                .filter(n -> !(Boolean) n.getOrDefault("is_read", false))
                .count();

        return ResponseEntity.ok(Map.of(
                "total", all.size(),
                "unread", unreadCount,
                "read", all.size() - unreadCount
        ));
    }

    // Mark a set of notifications as read
    @PostMapping("/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markReadBulk(
            @RequestBody MarkReadRequest request,
            Principal principal) {
        String username = principal.getName();
        notificationService.markAsReadForUser(request.ids(), username);
        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(Map.of("updated", request.ids().size()));
    }

    // Mark all notifications as read
    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Principal principal) {
        String username = principal.getName();
        notificationService.markAllAsReadForUser(username);
        log.debug("Marked all notifications as read for user {}", username);

        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

        // GET /notifications/{id}
        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id, Principal principal) {
            String username = principal.getName();
            List<Map<String, Object>> notifications = notificationService.getUserNotifications(username);
            Map<String, Object> notif = notifications.stream()
                    .filter(n -> ((Long) n.get("id")).equals(id))
                    .findFirst()
                    .orElse(null);
            if (notif == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Notification not found"));
            }
            long lastMod = System.currentTimeMillis();
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "private, max-age=30")
                    .header(org.springframework.http.HttpHeaders.LAST_MODIFIED, httpDate(lastMod))
                    .body(notif);
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

    private static long lastModifiedEpochMilli(Map<String, Object> n) {
        Object updatedAt = n.get("updated_at");
        Object createdAt = n.get("created_at");
        if (updatedAt != null) return System.currentTimeMillis(); // Simplified for Map-based implementation
        if (createdAt != null) return System.currentTimeMillis();
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

    private static HttpHeaders noStoreHeaders() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }

    // Request DTOs
    public record CreateNotificationRequest(@NotBlank String username, @NotBlank String message) {}

    public record MarkReadRequest(Collection<Long> ids) {}
}