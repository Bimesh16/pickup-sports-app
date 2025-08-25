package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collection;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationsBulkController {

    private final NotificationService notificationService;

    // POST /notifications/mark-read  { "ids": [1,2,3] }
    @PostMapping("/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UpdatedResponse> markReadBulk(@RequestBody MarkReadRequest request, Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ResponseEntity.status(401).headers(noStoreHeaders()).build();
        }
        int updated = notificationService.markAsReadForUser(request.ids(), principal.getName());
        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(new com.bmessi.pickupsportsapp.dto.api.UpdatedResponse(updated));
    }

    // Additional variant: GET /notifications/me/unread-count (non-conflicting with existing endpoints)
    @GetMapping("/me/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.CountResponse> unreadCount(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ResponseEntity.status(401).headers(noStoreHeaders()).build();
        }
        long count = notificationService.unreadCount(principal.getName());
        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(new com.bmessi.pickupsportsapp.dto.api.CountResponse(count));
    }

    public record MarkReadRequest(Collection<Long> ids) {}

    private static HttpHeaders noStoreHeaders() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
