package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import com.bmessi.pickupsportsapp.service.game.CapacityManager;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class RsvpController {

    private final JdbcTemplate jdbc;
    private final CapacityManager capacityManager;
    private final WaitlistService waitlistService;
    private final NotificationService notificationService;

    @PostMapping("/{id}/rsvp2")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> rsvp2(@PathVariable Long id, Principal principal) {
        String username = principal.getName();

        Long userId = findUserId(username);
        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "user not found");
        }

        CapacityManager.Decision d = capacityManager.enforceOnRsvp(id, userId);
        switch (d.reason()) {
            case "not_found" -> {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Game not found");
            }
            case "cutoff" -> {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "RSVP cutoff has passed");
            }
        }

        if (d.allowed()) {
            int added = jdbc.update("""
                    INSERT INTO game_participants (game_id, user_id)
                    VALUES (?, ?)
                    ON CONFLICT DO NOTHING
                    """, id, userId);

            var meta = gameMeta(id);
            if (meta != null) {
                notificationService.createGameNotification(meta.owner(), username, meta.sport(), meta.location(), "joined");
            }

            return ResponseEntity.ok().headers(noStore())
                    .body(new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(true, false, added == 0 ? "already_participant" : "ok"));
        }

        if (d.waitlisted()) {
            var meta = gameMeta(id);
            if (meta != null) {
                notificationService.createGameNotification(username, "system", meta.sport(), meta.location(), "waitlisted");
            }
            return ResponseEntity.status(202).headers(noStore())
                    .body(new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(false, true, "waitlisted"));
        }

        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "RSVP not allowed: " + d.reason());
    }

    @DeleteMapping("/{id}/rsvp2")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UnrsvpResponse> unrsvp2(@PathVariable Long id, Principal principal) {
        String username = principal.getName();
        Long userId = findUserId(username);
        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "user not found");
        }

        int removed = jdbc.update("DELETE FROM game_participants WHERE game_id = ? AND user_id = ?", id, userId);

        GameMeta meta = gameMeta(id);
        int promotedCount = 0;
        if (meta != null && meta.capacity() != null && meta.waitlistEnabled()) {
            int participants = countParticipants(id);
            int slots = Math.max(0, meta.capacity() - participants);
            if (slots > 0) {
                List<Long> promoted = waitlistService.promoteUpTo(id, slots);
                for (Long uid : promoted) {
                    promotedCount += jdbc.update("""
                            INSERT INTO game_participants (game_id, user_id)
                            VALUES (?, ?)
                            ON CONFLICT DO NOTHING
                            """, id, uid);
                    String promotedUsername = jdbc.queryForObject("SELECT username FROM app_user WHERE id = ?", String.class, uid);
                    notificationService.createGameNotification(promotedUsername, "system", meta.sport(), meta.location(), "promoted");
                }
                if (!promoted.isEmpty()) {
                    notificationService.createGameNotification(meta.owner(), "system", meta.sport(), meta.location(), "promotions");
                }
            }
        }

        return ResponseEntity.ok().headers(noStore())
                .body(new com.bmessi.pickupsportsapp.dto.api.UnrsvpResponse(removed > 0, promotedCount));
    }

    // --- helpers ---

    private Long findUserId(String username) {
        try {
            return jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, username);
        } catch (Exception e) {
            return null;
        }
    }

    private int countParticipants(Long gameId) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        return n == null ? 0 : n;
    }

    private GameMeta gameMeta(Long gameId) {
        try {
            return jdbc.queryForObject("""
                SELECT COALESCE(sport,'') AS sport,
                       COALESCE(CAST(location AS TEXT),'') AS location,
                       time,
                       user_id AS owner_id,
                       (SELECT username FROM app_user WHERE id = user_id) AS owner_username,
                       capacity,
                       waitlist_enabled
                  FROM game WHERE id = ?
                """, (rs, rn) -> new GameMeta(
                    rs.getString("sport"),
                    rs.getString("location"),
                    ((java.sql.Timestamp) rs.getObject("time")).toInstant().atOffset(java.time.ZoneOffset.UTC),
                    rs.getLong("owner_id"),
                    rs.getString("owner_username"),
                    (Integer) rs.getObject("capacity"),
                    rs.getBoolean("waitlist_enabled")
            ), gameId);
        } catch (Exception e) {
            return null;
        }
    }

    private record GameMeta(String sport, String location, OffsetDateTime time, Long ownerId, String owner, Integer capacity, boolean waitlistEnabled) {}

}
