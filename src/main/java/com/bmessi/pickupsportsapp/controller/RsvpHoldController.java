package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.api.HoldConfirmRequest;
import com.bmessi.pickupsportsapp.dto.api.HoldResponse;
import com.bmessi.pickupsportsapp.dto.api.RsvpResultResponse;
import com.bmessi.pickupsportsapp.service.game.HoldService;
import com.bmessi.pickupsportsapp.service.game.RsvpIdempotencyService;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import com.bmessi.pickupsportsapp.service.payment.PaymentService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import io.micrometer.core.instrument.MeterRegistry;

import java.security.Principal;
import java.util.Map;

import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@Tag(name = "RSVP Holds", description = "Two-phase booking flow (hold then confirm)")
public class RsvpHoldController {

    private final HoldService holdService;
    private final JdbcTemplate jdbc;
    private final NotificationService notificationService;
    private final PaymentService paymentService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate broker;
    private final MeterRegistry meterRegistry;
    private final RsvpIdempotencyService rsvpIdempotencyService;

    @RateLimiter(name = "rsvp")
    @Operation(summary = "Create a temporary hold for a game slot", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Hold created", content = @Content(schema = @Schema(implementation = HoldResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Game not found"),
            @ApiResponse(responseCode = "409", description = "Game full or cutoff reached")
    })
    @PostMapping("/{id}/hold")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> hold(@PathVariable Long id,
                                  @RequestParam(name = "ttl", required = false, defaultValue = "120") int ttlSeconds,
                                  Principal principal,
                                  @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        String username = principal.getName();
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var cached = rsvpIdempotencyService.getHold(username, id, idempotencyKey);
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

        var res = holdService.createHold(id, userId, ttlSeconds);
        if (!res.created()) {
            meterRegistry.counter("holds_error", "action", "create", "reason", res.reason()).increment();
            return switch (res.reason()) {
                case "not_found" -> ResponseEntity.status(404).headers(noStore()).build();
                case "cutoff" -> {
                    var body = Map.of("error", "rsvp_closed", "message", "RSVP cutoff has passed");
                    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                        rsvpIdempotencyService.putHold(username, id, idempotencyKey, 409, body);
                    }
                    yield ResponseEntity.status(409).headers(noStore()).body(body);
                }
                case "full" -> {
                    var body = Map.of("error", "game_full", "message", "No slots available");
                    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                        rsvpIdempotencyService.putHold(username, id, idempotencyKey, 409, body);
                    }
                    yield ResponseEntity.status(409).headers(noStore()).body(body);
                }
                default -> {
                    var body = Map.of("error", "internal", "message", "Failed to create hold");
                    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                        rsvpIdempotencyService.putHold(username, id, idempotencyKey, 500, body);
                    }
                    yield ResponseEntity.status(500).headers(noStore()).body(body);
                }
            };
        }

        meterRegistry.counter("holds_created").increment();
        String paymentIntentId = paymentService.createIntentForHold(id, res.holdId(), userId);

        // Live event: capacity update (one slot reserved)
        try {
            emitCapacityUpdate(id, "hold_created");
        } catch (Exception ignore) {}

        return ResponseEntity.status(201).headers(noStore())
                .body(new HoldResponse(res.holdId(), paymentIntentId, res.expiresAt()));
        var body = new HoldResponse(res.holdId(), res.expiresAt());
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            rsvpIdempotencyService.putHold(username, id, idempotencyKey, 201, body);
        }
        return ResponseEntity.status(201).headers(noStore()).body(body);
    }

    @RateLimiter(name = "rsvp")
    @Operation(summary = "Confirm a previously created hold", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Joined", content = @Content(schema = @Schema(implementation = RsvpResultResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Game/hold not found"),
            @ApiResponse(responseCode = "409", description = "Game full"),
            @ApiResponse(responseCode = "410", description = "Hold expired")
    })
    @PostMapping("/{id}/confirm")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> confirm(@PathVariable Long id,
                                     @Valid @RequestBody HoldConfirmRequest request,
                                     Principal principal,
                                     @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        String username = principal.getName();
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var cached = rsvpIdempotencyService.getConfirm(username, id, request.holdId(), idempotencyKey);
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

        var res = holdService.confirmHold(id, request.holdId(), userId);
        if (!res.joined()) {
            if ("expired".equals(res.reason())) {
                meterRegistry.counter("holds_expired").increment();
            }
            meterRegistry.counter("holds_error", "action", "confirm", "reason", res.reason()).increment();
            return switch (res.reason()) {
                case "not_found", "invalid_hold" -> ResponseEntity.status(404).headers(noStore()).build();
                case "expired" -> {
                    var body = Map.of("error", "hold_expired", "message", "Hold expired");
                    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                        rsvpIdempotencyService.putConfirm(username, id, request.holdId(), idempotencyKey, 410, body);
                    }
                    yield ResponseEntity.status(410).headers(noStore()).body(body);
                }
                case "full" -> {
                    var body = Map.of("error", "game_full", "message", "No slots available");
                    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                        rsvpIdempotencyService.putConfirm(username, id, request.holdId(), idempotencyKey, 409, body);
                    }
                    yield ResponseEntity.status(409).headers(noStore()).body(body);
                }
                default -> {
                    var body = Map.of("error", "internal", "message", "Failed to confirm hold");
                    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                        rsvpIdempotencyService.putConfirm(username, id, request.holdId(), idempotencyKey, 500, body);
                    }
                    yield ResponseEntity.status(500).headers(noStore()).body(body);
                }
            };
        }

        meterRegistry.counter("holds_confirmed").increment();

        String username = principal.getName();
        // Live event: participant joined + capacity update
        try {
            emit(id, "participant_joined", Map.of("user", username, "userId", userId));
            emitCapacityUpdate(id, "hold_confirmed");
        } catch (Exception ignore) {}

        // Optional notification to owner
        try {
            var meta = jdbc.queryForMap("SELECT sport, CAST(location AS TEXT) AS location, user_id FROM game WHERE id = ?", id);
            String owner = jdbc.queryForObject("SELECT username FROM app_user WHERE id = ?", String.class, ((Number) meta.get("user_id")).longValue());
            notificationService.createGameNotification(owner, username, (String) meta.get("sport"), (String) meta.get("location"), "joined");
        } catch (Exception ignore) {}

        var body = new RsvpResultResponse(true, false, "ok");
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            rsvpIdempotencyService.putConfirm(username, id, request.holdId(), idempotencyKey, 200, body);
        }
        return ResponseEntity.ok().headers(noStore()).body(body);
    }

    private Long findUserId(String username) {
        try {
            return jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, username);
        } catch (Exception e) {
            return null;
        }
    }

    private void emitCapacityUpdate(Long gameId, String hint) {
        Integer capacity = jdbc.queryForObject("SELECT capacity FROM game WHERE id = ?", Integer.class, gameId);
        if (capacity == null) return;
        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        Integer holds = jdbc.queryForObject(
                "SELECT COUNT(*) FROM game_hold WHERE game_id = ? AND expires_at > now()", Integer.class, gameId);
        int remaining = capacity - (participants == null ? 0 : participants) - (holds == null ? 0 : holds);
        var data = new java.util.HashMap<String, Object>();
        data.put("remainingSlots", Math.max(0, remaining));
        if (hint != null) data.put("hint", hint);
        emit(gameId, "capacity_update", data);
    }

    private void emit(Long gameId, String type, Map<String, Object> data) {
        try {
            broker.convertAndSend("/topic/games/" + gameId,
                    Map.of("type", type, "data", data, "timestamp", System.currentTimeMillis()));
        } catch (Exception ignore) {}
    }
}
