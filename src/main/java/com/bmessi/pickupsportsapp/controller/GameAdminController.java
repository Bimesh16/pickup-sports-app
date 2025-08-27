package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.service.HostActionAuditService;
import com.bmessi.pickupsportsapp.service.game.HostManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.lang.reflect.Method;
import java.util.Map;

@RestController
@RequestMapping("/admin/games")
@RequiredArgsConstructor
public class GameAdminController {

    private final GameRepository games;
    private final com.bmessi.pickupsportsapp.service.notification.NotificationService notificationService;
    private final HostActionAuditService hostAuditService;
    private final com.bmessi.pickupsportsapp.service.AdminAuditService adminAuditService;
    private final HostManagementService hostManagementService;
    private final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GameAdminController.class);

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lock(@PathVariable Long id, java.security.Principal principal) {
        return setStatus(id, "LOCKED", principal);
    }

    @PutMapping("/{id}/takedown")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> takedown(@PathVariable Long id, java.security.Principal principal) {
        return setStatus(id, "CANCELLED", principal);
    }

    @PostMapping("/{id}/waitlist/{userId}/promote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> promoteFromWaitlist(@PathVariable Long id, @PathVariable Long userId, java.security.Principal principal) {
        hostManagementService.promoteFromWaitlist(id, userId, principal != null ? principal.getName() : null);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("status", "promoted"));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> kickParticipant(@PathVariable Long id, @PathVariable Long userId, java.security.Principal principal) {
        hostManagementService.kickParticipant(id, userId, principal != null ? principal.getName() : null);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("status", "kicked"));
    }

    @PostMapping("/{id}/ban/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> banParticipant(@PathVariable Long id, @PathVariable Long userId, java.security.Principal principal) {
        hostManagementService.banParticipant(id, userId, principal != null ? principal.getName() : null);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("status", "banned"));
    }

    @PostMapping("/{id}/cohosts/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addCohost(@PathVariable Long id, @PathVariable Long userId, java.security.Principal principal) {
        hostManagementService.addCoHost(id, userId, principal != null ? principal.getName() : null);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("status", "added"));
    }

    @DeleteMapping("/{id}/cohosts/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeCohost(@PathVariable Long id, @PathVariable Long userId, java.security.Principal principal) {
        hostManagementService.removeCoHost(id, userId, principal != null ? principal.getName() : null);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("status", "removed"));
    }

    @PostMapping("/{id}/invite-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> generateInviteToken(@PathVariable Long id, java.security.Principal principal) {
        String token = hostManagementService.generateInviteToken(id, principal != null ? principal.getName() : null);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("token", token));
    }

    private ResponseEntity<?> setStatus(Long id, String status, java.security.Principal principal) {
        Game g = games.findById(id).orElse(null);
        if (g == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Game not found");
        }
        boolean ok = trySetStatus(g, status);
        if (!ok) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Game status field not available");
        }
        games.save(g);

        // Audit log
        log.info("Admin updated game {} status to {}", id, status);
        String actor = (principal != null && principal.getName() != null) ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "game_status_" + status.toLowerCase(), "game", id, null); } catch (Exception ignore) {}

        // Notify participants and creator, best-effort
        notifyParticipants(g, status);

        return ResponseEntity.ok().headers(noStore())
                .body(new com.bmessi.pickupsportsapp.dto.api.StatusResponse(status));
        }

    private static boolean trySetStatus(Game g, String status) {
        try {
            Method m = g.getClass().getMethod("setStatus", String.class);
            m.invoke(g, status);
            return true;
        } catch (Exception ignore) {
            // Try enum status
            try {
                Method getter = g.getClass().getMethod("getStatus");
                Class<?> type = getter.getReturnType();
                if (type.isEnum()) {
                    Object enumVal = java.util.Arrays.stream(type.getEnumConstants())
                            .filter(ec -> ((Enum<?>) ec).name().equalsIgnoreCase(status))
                            .findFirst().orElse(null);
                    if (enumVal != null) {
                        Method setter = g.getClass().getMethod("setStatus", type);
                        setter.invoke(g, enumVal);
                        return true;
                    }
                }
            } catch (Exception ignore2) {}
        }
        return false;
    }

    @SuppressWarnings("unchecked")
    private void notifyParticipants(Game g, String action) {
        try {
            // Notify creator
            String creator = tryGetUsername(g, "getUser");
            if (creator != null) {
                notificationService.createGameNotification(creator, "admin", tryGetSport(g), tryGetLocation(g), action);
            }
            // Notify participants if collection exists
            Method m = g.getClass().getMethod("getParticipants");
            Object coll = m.invoke(g);
            if (coll instanceof java.util.Collection<?> participants) {
                for (Object p : participants) {
                    String username = tryGetUsername(p, "getUser");
                    if (username == null) username = tryGetUsername(p, "getUsername");
                    if (username != null) {
                        notificationService.createGameNotification(username, "admin", tryGetSport(g), tryGetLocation(g), action);
                    }
                }
            }
        } catch (NoSuchMethodException nsme) {
            // no participants collection - ignore
        } catch (Exception e) {
            log.warn("Failed to notify participants for game {} action {}: {}", g, action, e.getMessage());
        }
    }

    private String tryGetSport(Game g) {
        try { return String.valueOf(g.getClass().getMethod("getSport").invoke(g)); } catch (Exception e) { return ""; }
    }

    private String tryGetLocation(Game g) {
        try { return String.valueOf(g.getClass().getMethod("getLocation").invoke(g)); } catch (Exception e) { return ""; }
    }

    private String tryGetUsername(Object obj, String method) {
        try {
            Object userObj = obj.getClass().getMethod(method).invoke(obj);
            if (userObj == null) return null;
            if (userObj instanceof String s) return s;
            try {
                Object un = userObj.getClass().getMethod("getUsername").invoke(userObj);
                return un != null ? un.toString() : null;
            } catch (Exception inner) {
                return null;
            }
        } catch (Exception e) {
            return null;
        }
    }

    
}
