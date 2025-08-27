package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.PromotionResultResponse;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.List;
import java.util.Map;

// Swagger/OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/games/{gameId}/waitlist")
@RequiredArgsConstructor
public class GameWaitlistController {

    private final WaitlistService waitlistService;
    private final JdbcTemplate jdbc;
    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.WaitlistCountResponse> get(@PathVariable Long gameId) {
        int count = waitlistService.waitlistCount(gameId);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.WaitlistCountResponse(count));
    }

    public record PromoteRequest(Integer slots) {}

    @PostMapping("/promote")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Promote users from the waitlist")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Promotion result",
                    content = @Content(schema = @Schema(implementation = PromotionResultResponse.class),
                            examples = @ExampleObject(value = "{\n  \"requested\": 1,\n  \"waitlistSize\": 1,\n  \"added\": 1\n}"))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "RSVP closed",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\n  \"error\": \"rsvp_closed\",\n  \"message\": \"No waitlisted users to promote\"\n}"))
            )
    })
    public ResponseEntity<?> promote(@PathVariable Long gameId, @RequestBody(required = false) PromoteRequest req) {
        int slots = req != null && req.slots() != null ? Math.max(0, req.slots()) : 1;
        List<Long> userIds = waitlistService.promoteUpTo(gameId, slots);
        if (userIds.isEmpty()) {
            return ResponseEntity.status(409).headers(noStore())
                    .body(Map.of("error", "rsvp_closed", "message", "No waitlisted users to promote"));
        }
        int added = 0;
        for (Long uid : userIds) {
            try {
                int n = jdbc.update("INSERT INTO game_participants (game_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                        gameId, uid);
                added += n;
                // Notify user about promotion (best-effort)
                String username = jdbc.queryForObject("SELECT username FROM app_user WHERE id = ?", String.class, uid);
                var game = jdbc.queryForMap("SELECT COALESCE(CAST(location AS TEXT), '') AS location, COALESCE(sport, '') AS sport FROM game WHERE id = ?", gameId);
                notificationService.createGameNotification(username, "system", String.valueOf(game.get("sport")), String.valueOf(game.get("location")), "promoted");
            } catch (Exception ignore) {}
        }
        return ResponseEntity.ok().headers(noStore()).body(
                new com.bmessi.pickupsportsapp.dto.PromotionResultResponse(slots, userIds.size(), added)
        );
    }

    
}
