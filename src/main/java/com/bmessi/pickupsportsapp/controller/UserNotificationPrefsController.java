package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.UserNotificationPrefs;
import com.bmessi.pickupsportsapp.service.UserNotificationPrefsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/users/me/notification-prefs")
@RequiredArgsConstructor
public class UserNotificationPrefsController {

    private final UserNotificationPrefsService prefs;

    // Compact DTO returned to clients (avoid serializing JPA entity)
    public record PrefsResponse(
            boolean inAppOnRsvp,
            boolean inAppOnCreate,
            boolean inAppOnCancel,
            boolean emailOnRsvp,
            boolean emailOnCreate,
            boolean emailOnCancel,
            boolean pushOnRsvp,
            boolean pushOnCreate,
            boolean pushOnCancel,
            boolean emailDigestDaily,
            boolean emailDigestWeekly
    ) {}

    // DTO accepted from clients to update flags
    public record UpdatePrefsRequest(
            Boolean inAppOnRsvp,
            Boolean inAppOnCreate,
            Boolean inAppOnCancel,
            Boolean emailOnRsvp,
            Boolean emailOnCreate,
            Boolean emailOnCancel,
            Boolean pushOnRsvp,
            Boolean pushOnCreate,
            Boolean pushOnCancel,
            Boolean emailDigestDaily,
            Boolean emailDigestWeekly
    ) {}

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrefsResponse> get(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ResponseEntity.status(401).headers(noStore()).build();
        }
        UserNotificationPrefs p = prefs.getOrDefaults(principal.getName());
        return ResponseEntity.ok()
                .headers(noStore())
                .body(toResponse(p));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@RequestBody UpdatePrefsRequest body, Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ResponseEntity.status(401).headers(noStore()).body(Map.of(
                    "error", "unauthorized",
                    "message", "Authentication required",
                    "timestamp", System.currentTimeMillis()
            ));
        }
        // Map incoming DTO to an entity carrying only flags to update
        UserNotificationPrefs in = new UserNotificationPrefs();
        // Use current defaults as base to allow partial updates
        UserNotificationPrefs current = prefs.getOrDefaults(principal.getName());
        in.setInAppOnRsvp(nvl(body.inAppOnRsvp(), current.isInAppOnRsvp()));
        in.setInAppOnCreate(nvl(body.inAppOnCreate(), current.isInAppOnCreate()));
        in.setInAppOnCancel(nvl(body.inAppOnCancel(), current.isInAppOnCancel()));
        in.setEmailOnRsvp(nvl(body.emailOnRsvp(), current.isEmailOnRsvp()));
        in.setEmailOnCreate(nvl(body.emailOnCreate(), current.isEmailOnCreate()));
        in.setEmailOnCancel(nvl(body.emailOnCancel(), current.isEmailOnCancel()));
        in.setPushOnRsvp(nvl(body.pushOnRsvp(), current.isPushOnRsvp()));
        in.setPushOnCreate(nvl(body.pushOnCreate(), current.isPushOnCreate()));
        in.setPushOnCancel(nvl(body.pushOnCancel(), current.isPushOnCancel()));
        in.setEmailDigestDaily(nvl(body.emailDigestDaily(), current.isEmailDigestDaily()));
        in.setEmailDigestWeekly(nvl(body.emailDigestWeekly(), current.isEmailDigestWeekly()));

        UserNotificationPrefs saved = prefs.update(principal.getName(), in);
        return ResponseEntity.ok()
                .headers(noStore())
                .body(toResponse(saved));
    }

    private static PrefsResponse toResponse(UserNotificationPrefs p) {
        return new PrefsResponse(
                p.isInAppOnRsvp(),
                p.isInAppOnCreate(),
                p.isInAppOnCancel(),
                p.isEmailOnRsvp(),
                p.isEmailOnCreate(),
                p.isEmailOnCancel(),
                p.isPushOnRsvp(),
                p.isPushOnCreate(),
                p.isPushOnCancel(),
                // Include digest flags for completeness
                p.isEmailDigestDaily(),
                p.isEmailDigestWeekly()
        );
    }

    private static boolean nvl(Boolean v, boolean dflt) {
        return v != null ? v : dflt;
    }

    
}
