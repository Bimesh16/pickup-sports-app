package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
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
    private final com.bmessi.pickupsportsapp.service.NotificationService notificationService;
    private final com.bmessi.pickupsportsapp.service.AdminAuditService adminAuditService;
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
        try { adminAuditService.record(actor, "game_status_" + status.toLowerCase(), "game", id, null); } catch (Exception ignore) {}

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
