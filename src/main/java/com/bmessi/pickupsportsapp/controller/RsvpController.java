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

// Swagger/OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

// Rate limiting
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

// DTOs for documentation
import com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse;
import com.bmessi.pickupsportsapp.dto.api.UnrsvpResponse;
import com.bmessi.pickupsportsapp.dto.api.ParticipantsResponse;
import com.bmessi.pickupsportsapp.dto.api.WaitlistResponse;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@Tag(name = "RSVP", description = "Join/Leave games, waitlist and participants")
public class RsvpController {

    private final JdbcTemplate jdbc;
    private final CapacityManager capacityManager;
    private final WaitlistService waitlistService;
    private final NotificationService notificationService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate broker;
    private final com.bmessi.pickupsportsapp.service.game.RsvpIdempotencyService rsvpIdempotencyService;



    // Friendly "join" alias for RSVP
    @RateLimiter(name = "rsvp")
    @Operation(
            summary = "Join a game (RSVP)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Joined", content = @Content(schema = @Schema(implementation = RsvpResultResponse.class))),
            @ApiResponse(responseCode = "202", description = "Waitlisted", content = @Content(schema = @Schema(implementation = RsvpResultResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Game not found"),
            @ApiResponse(responseCode = "409", description = "RSVP not allowed")
    })
    @PostMapping("/{id}/join")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> join(@PathVariable Long id,
                                  Principal principal,
                                  @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        String username = principal.getName();

        // Early idempotency replay
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var cached = rsvpIdempotencyService.getJoin(username, id, idempotencyKey);
            if (cached.isPresent()) {
                return ResponseEntity.status(cached.get().status())
                        .headers(noStore())
                        .body(cached.get().body());
            }
        }

        Long userId = findUserId(username);
        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "user not found");
        }

        CapacityManager.JoinResult jr = capacityManager.join(id, userId);
        switch (jr.reason()) {
            case "not_found" -> {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Game not found");
            }
            case "cutoff" -> {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "RSVP cutoff has passed");
            }
        }
        if (jr.success()) {
            var meta = gameMeta(id);
            if (meta != null) {
                notificationService.createGameNotification(meta.owner(), username, meta.sport(), meta.location(), "joined");
            }

            // Live events
            try {
                emit(id, "participant_joined", java.util.Map.of("user", username, "userId", userId));
                if (meta != null && meta.capacity() != null) {
                    emit(id, "capacity_update", java.util.Map.of("remainingSlots", jr.remainingSlots()));
                }
            } catch (Exception ignore) {}

            var body = new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(true, false, jr.reason());
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                rsvpIdempotencyService.putJoin(username, id, idempotencyKey, 200, body);
            }
            return ResponseEntity.ok().headers(noStore()).body(body);
        }

        if (jr.waitlisted()) {
            var meta = gameMeta(id);
            if (meta != null) {
                notificationService.createGameNotification(username, "system", meta.sport(), meta.location(), "waitlisted");
            }

            // Live event: waitlist joined
            try {
                emit(id, "waitlist_joined", java.util.Map.of("user", username, "userId", userId));
                if (meta != null && meta.capacity() != null) {
                    emit(id, "capacity_update", java.util.Map.of("remainingSlots", jr.remainingSlots()));
                }
            } catch (Exception ignore) {}

            var body = new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(false, true, "waitlisted");
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                rsvpIdempotencyService.putJoin(username, id, idempotencyKey, 202, body);
            }
            return ResponseEntity.status(202).headers(noStore()).body(body);
        }

        // Already on waitlist: respond consistently with 202
        if ("waitlist_exists".equals(jr.reason())) {
            try {
                emit(id, "waitlist_joined", java.util.Map.of("user", username, "userId", userId));
            } catch (Exception ignore) {}
            var body = new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(false, true, "waitlisted");
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                rsvpIdempotencyService.putJoin(username, id, idempotencyKey, 202, body);
            }
            return ResponseEntity.status(202).headers(noStore()).body(body);
        }

        // Game full and waitlist disabled: return clear 409
        if ("full".equals(jr.reason())) {
            var body = java.util.Map.of("error", "game_full", "message", "No slots available", "remainingSlots", jr.remainingSlots());
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                rsvpIdempotencyService.putJoin(username, id, idempotencyKey, 409, body);
            }
            return ResponseEntity.status(409).headers(noStore()).body(body);
        }

        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "RSVP not allowed: " + jr.reason());
    }

    // Friendly "leave" alias for unRSVP
    @RateLimiter(name = "rsvp")
    @Operation(
            summary = "Leave a game (unRSVP)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Left game; may include promotions", content = @Content(schema = @Schema(implementation = UnrsvpResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Game not found")
    })
    @DeleteMapping("/{id}/leave")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UnrsvpResponse> leave(@PathVariable Long id,
                                                                                   Principal principal,
                                                                                   @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        String username = principal.getName();

        // Early idempotency replay
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var cached = rsvpIdempotencyService.getLeave(username, id, idempotencyKey);
            if (cached.isPresent()) {
                @SuppressWarnings("unchecked")
                var body = (com.bmessi.pickupsportsapp.dto.api.UnrsvpResponse) cached.get().body();
                return ResponseEntity.status(cached.get().status()).headers(noStore()).body(body);
            }
        }
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
                    // Live: one user promoted
                    try {
                        emit(id, "waitlist_promoted", java.util.Map.of("user", promotedUsername, "userId", uid));
                    } catch (Exception ignore) {}
                }
                if (!promoted.isEmpty()) {
                    notificationService.createGameNotification(meta.owner(), "system", meta.sport(), meta.location(), "promotions");
                }
            }
        }

        // Live: participant left + capacity update
        try {
            emit(id, "participant_left", java.util.Map.of("user", username, "userId", userId));
            var meta2 = gameMeta(id);
            if (meta2 != null && meta2.capacity() != null) {
                int remaining = Math.max(0, meta2.capacity() - countParticipants(id));
                emit(id, "capacity_update", java.util.Map.of("remainingSlots", remaining));
            }
        } catch (Exception ignore) {}

        var body = new com.bmessi.pickupsportsapp.dto.api.UnrsvpResponse(removed > 0, promotedCount);
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            rsvpIdempotencyService.putLeave(username, id, idempotencyKey, 200, body);
        }
        return ResponseEntity.ok().headers(noStore()).body(body);
    }

    // List current participants
    @Operation(summary = "List participants of a game")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Participants list", content = @Content(schema = @Schema(implementation = ParticipantsResponse.class))),
            @ApiResponse(responseCode = "404", description = "Game not found", content = @Content)
    })
    @GetMapping("/{id}/participants")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ParticipantsResponse> participants(@PathVariable Long id, Principal principal) {
        List<com.bmessi.pickupsportsapp.dto.api.ParticipantsResponse.Item> items = jdbc.query("""
                SELECT gp.user_id, u.username, gp.joined_at
                  FROM game_participants gp
                  JOIN app_user u ON u.id = gp.user_id
                 WHERE gp.game_id = ?
                 ORDER BY gp.joined_at ASC
                """, ps -> ps.setLong(1, id), (rs, rn) -> new com.bmessi.pickupsportsapp.dto.api.ParticipantsResponse.Item(
                        rs.getLong("user_id"),
                        rs.getString("username"),
                        ((java.sql.Timestamp) rs.getObject("joined_at")).toInstant().atOffset(java.time.ZoneOffset.UTC)
                ));
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, id);
        return ResponseEntity.ok().headers(noStore())
                .body(new com.bmessi.pickupsportsapp.dto.api.ParticipantsResponse(items, total == null ? 0 : total));
    }

    // List waitlist and the caller's position (if authenticated)
    @Operation(summary = "List waitlist for a game; includes your queue position when authenticated")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Waitlist", content = @Content(schema = @Schema(implementation = WaitlistResponse.class))),
            @ApiResponse(responseCode = "404", description = "Game not found", content = @Content)
    })
    @GetMapping("/{id}/waitlist")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.WaitlistResponse> waitlist(@PathVariable Long id, Principal principal) {
        List<com.bmessi.pickupsportsapp.dto.api.WaitlistResponse.Item> items = jdbc.query("""
                SELECT gw.user_id, u.username, gw.created_at
                  FROM game_waitlist gw
                  JOIN app_user u ON u.id = gw.user_id
                 WHERE gw.game_id = ?
                 ORDER BY gw.created_at ASC
                """, ps -> ps.setLong(1, id), (rs, rn) -> new com.bmessi.pickupsportsapp.dto.api.WaitlistResponse.Item(
                        rs.getLong("user_id"),
                        rs.getString("username"),
                        ((java.sql.Timestamp) rs.getObject("created_at")).toInstant().atOffset(java.time.ZoneOffset.UTC)
                ));
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM game_waitlist WHERE game_id = ?", Integer.class, id);

        Integer myPosition = null;
        if (principal != null) {
            Long uid = findUserId(principal.getName());
            if (uid != null) {
                java.sql.Timestamp mine = null;
                try {
                    mine = jdbc.queryForObject("SELECT created_at FROM game_waitlist WHERE game_id = ? AND user_id = ?", java.sql.Timestamp.class, id, uid);
                } catch (Exception ignore) {}
                if (mine != null) {
                    Integer before = jdbc.queryForObject("""
                            SELECT COUNT(*) FROM game_waitlist
                             WHERE game_id = ? AND created_at < ?
                            """, Integer.class, id, mine);
                    myPosition = (before == null ? 0 : before) + 1;
                }
            }
        }

        return ResponseEntity.ok().headers(noStore())
                .body(new com.bmessi.pickupsportsapp.dto.api.WaitlistResponse(
                        items,
                        total == null ? 0 : total,
                        myPosition
                ));
    }

    @PostMapping("/{id}/rsvp2")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> rsvp2(@PathVariable Long id, Principal principal) {
        String username = principal.getName();

        Long userId = findUserId(username);
        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "user not found");
        }

        CapacityManager.JoinResult jr = capacityManager.join(id, userId);
        switch (jr.reason()) {
            case "not_found" -> {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Game not found");
            }
            case "cutoff" -> {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "RSVP cutoff has passed");
            }
        }

        if (jr.success()) {
            var meta = gameMeta(id);
            if (meta != null) {
                notificationService.createGameNotification(meta.owner(), username, meta.sport(), meta.location(), "joined");
            }

            return ResponseEntity.ok().headers(noStore())
                    .body(new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(true, false, jr.reason()));
        }

        if (jr.waitlisted()) {
            var meta = gameMeta(id);
            if (meta != null) {
                notificationService.createGameNotification(username, "system", meta.sport(), meta.location(), "waitlisted");
            }
            return ResponseEntity.status(202).headers(noStore())
                    .body(new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(false, true, "waitlisted"));
        }

        if ("waitlist_exists".equals(jr.reason())) {
            return ResponseEntity.status(202).headers(noStore())
                    .body(new com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse(false, true, "waitlisted"));
        }

        if ("full".equals(jr.reason())) {
            return ResponseEntity.status(409).headers(noStore())
                    .body(java.util.Map.of("error", "game_full", "message", "No slots available", "remainingSlots", jr.remainingSlots()));
        }

        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "RSVP not allowed: " + jr.reason());
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

    private void emit(Long gameId, String type, java.util.Map<String, Object> data) {
        try {
            broker.convertAndSend("/topic/games/" + gameId,
                    java.util.Map.of(
                            "type", type,
                            "data", data,
                            "timestamp", System.currentTimeMillis()
                    ));
        } catch (Exception ignore) {
            // do not fail user flow on WS issues
        }
    }

}
