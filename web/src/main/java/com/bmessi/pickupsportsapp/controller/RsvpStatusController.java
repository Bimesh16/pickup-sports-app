package com.bmessi.pickupsportsapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class RsvpStatusController {

    private final JdbcTemplate jdbc;

    @GetMapping("/{id}/rsvp-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.RsvpStatusResponse> status(@PathVariable Long id, Principal principal) {
        String username = principal.getName();
        Long userId = findUserId(username);
        if (userId == null) {
            return ResponseEntity.status(401).headers(noStore()).build();
        }

        GameMeta g = gameMeta(id);
        if (g == null) {
            return ResponseEntity.status(404).headers(noStore()).build();
        }

        boolean joined = exists("SELECT 1 FROM game_participants WHERE game_id = ? AND user_id = ?", id, userId);
        boolean waitlisted = exists("SELECT 1 FROM game_waitlist WHERE game_id = ? AND user_id = ?", id, userId);
        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, id);
        int count = participants == null ? 0 : participants;
        Integer cap = g.capacity();
        int openSlots = cap == null ? -1 : Math.max(0, cap - count);
        boolean cutoff = g.cutoff() != null && java.time.Instant.now().isAfter(g.cutoff().toInstant());

        return ResponseEntity.ok().headers(noStore())
                .body(new com.bmessi.pickupsportsapp.dto.api.RsvpStatusResponse(joined, waitlisted, cap, openSlots, cutoff));
    }

    private boolean exists(String sql, Object... args) {
        try {
            Integer one = jdbc.queryForObject(sql, Integer.class, args);
            return one != null;
        } catch (Exception e) {
            return false;
        }
    }

    private Long findUserId(String username) {
        try {
            return jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, username);
        } catch (Exception e) {
            return null;
        }
    }

    private GameMeta gameMeta(Long gameId) {
        try {
            return jdbc.queryForObject("""
                SELECT capacity, rsvp_cutoff
                  FROM game WHERE id = ?
                """, (rs, rn) -> new GameMeta(
                    (Integer) rs.getObject("capacity"),
                    ((java.sql.Timestamp) rs.getObject("rsvp_cutoff")) == null
                        ? null
                        : ((java.sql.Timestamp) rs.getObject("rsvp_cutoff")).toInstant().atOffset(ZoneOffset.UTC)
            ), gameId);
        } catch (Exception e) {
            return null;
        }
    }

    private record GameMeta(Integer capacity, OffsetDateTime cutoff) {}

}
