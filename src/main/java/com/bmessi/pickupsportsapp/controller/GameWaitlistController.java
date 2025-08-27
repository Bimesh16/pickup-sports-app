package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.PromotionResultResponse;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.List;

@RestController
@RequestMapping("/games/{gameId}/waitlist")
@RequiredArgsConstructor
public class GameWaitlistController {

    private final WaitlistService waitlistService;
    private final JdbcTemplate jdbc;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.WaitlistCountResponse> get(@PathVariable Long gameId) {
        int count = waitlistService.waitlistCount(gameId);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.WaitlistCountResponse(count));
    }

    public record PromoteRequest(Integer slots) {}

    @PostMapping("/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionResultResponse> promote(@PathVariable Long gameId, @RequestBody(required = false) PromoteRequest req) {
        int slots = req != null && req.slots() != null ? Math.max(0, req.slots()) : 1;
        List<Long> userIds = waitlistService.promoteUpTo(gameId, slots);
        int added = 0;
        for (Long uid : userIds) {
            try {
                int n = jdbc.update("INSERT INTO game_participants (game_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                        gameId, uid);
                added += n;
            } catch (Exception ignore) {}
        }
        return ResponseEntity.ok().headers(noStore()).body(
                new com.bmessi.pickupsportsapp.dto.PromotionResultResponse(slots, userIds.size(), added)
        );
    }

    
}
