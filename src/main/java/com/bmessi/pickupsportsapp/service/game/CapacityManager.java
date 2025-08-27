package com.bmessi.pickupsportsapp.service.game;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

/**
 * Enforces capacity, waitlist, and RSVP cutoff policies for games.
 * Integrate by calling enforceOnRsvp(...) from RSVP flow and handleOnLeave(...) from unRSVP/cancel flow.
 */
@Service
@RequiredArgsConstructor
public class CapacityManager {

    private final JdbcTemplate jdbc;
    private final WaitlistService waitlist;

    public record Decision(boolean allowed, boolean waitlisted, String reason) {}
    public record LeaveResult(boolean removed, List<Long> promoted) {}

    // Lock the game row to prevent race conditions on capacity checks
    @Transactional
    public Decision enforceOnRsvp(Long gameId, Long userId) {
        GameRow g = fetchGameForUpdate(gameId).orElse(null);
        if (g == null) return new Decision(false, false, "not_found");

        // Cutoff enforcement
        if (g.rsvpCutoff != null && Instant.now().isAfter(g.rsvpCutoff.toInstant())) {
            return new Decision(false, false, "cutoff");
        }

        // Already participating?
        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ? AND user_id = ?", Integer.class, gameId, userId);
        if (exists != null && exists > 0) {
            return new Decision(true, false, "already_participant");
        }

        // Capacity check
        int capacity = g.capacity != null ? g.capacity : Integer.MAX_VALUE;
        int participants = Optional.ofNullable(jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId)).orElse(0);
        boolean full = participants >= capacity;

        if (!full) {
            return new Decision(true, false, "ok");
        }

        // Waitlist path
        if (!g.waitlistEnabled) {
            return new Decision(false, false, "full");
        }
        boolean added = waitlist.addToWaitlist(gameId, userId);
        return new Decision(false, added, added ? "waitlisted" : "waitlist_exists");
    }

    /**
     * Call on participant cancellation: promote from waitlist if capacity available.
     * Returns number of promotions performed.
     */
    @Transactional
    public int handleOnCancel(Long gameId) {
        GameRow g = fetchGameForUpdate(gameId).orElse(null);
        if (g == null) return 0;

        int capacity = g.capacity != null ? g.capacity : Integer.MAX_VALUE;
        int participants = Optional.ofNullable(jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId)).orElse(0);
        int slots = Math.max(0, capacity - participants);
        if (slots <= 0) return 0;

        var promote = waitlist.promoteUpTo(gameId, slots);
        int added = 0;
        for (Long uid : promote) {
            try {
                added += jdbc.update("INSERT INTO game_participants (game_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", gameId, uid);
            } catch (Exception ignore) {}
        }
        return added;
    }

    /**
     * Handle participant leaving: remove from participants and promote from waitlist when capacity allows.
     */
    @Transactional
    public LeaveResult handleOnLeave(Long gameId, Long userId) {
        GameRow g = fetchGameForUpdate(gameId).orElse(null);
        if (g == null) return new LeaveResult(false, List.of());

        boolean removed = jdbc.update("DELETE FROM game_participants WHERE game_id = ? AND user_id = ?", gameId, userId) > 0;

        List<Long> promoted = List.of();
        if (g.capacity != null && g.waitlistEnabled) {
            int participants = Optional.ofNullable(jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId)).orElse(0);
            int slots = Math.max(0, g.capacity - participants);
            if (slots > 0) {
                promoted = waitlist.promoteUpTo(gameId, slots);
                for (Long uid : promoted) {
                    try {
                        jdbc.update("INSERT INTO game_participants (game_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", gameId, uid);
                    } catch (Exception ignore) {}
                }
            }
        }

        return new LeaveResult(removed, promoted);
    }

    private Optional<GameRow> fetchGame(Long gameId) {
        try {
            return Optional.ofNullable(jdbc.queryForObject("""
                SELECT capacity, waitlist_enabled, rsvp_cutoff, time
                  FROM game WHERE id = ?
                """, (rs, rn) -> new GameRow(
                    (Integer) rs.getObject("capacity"),
                    rs.getBoolean("waitlist_enabled"),
                    toOdt(rs.getObject("rsvp_cutoff")),
                    toOdt(rs.getObject("time"))
                ), gameId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Optional<GameRow> fetchGameForUpdate(Long gameId) {
        try {
            return Optional.ofNullable(jdbc.queryForObject("""
                SELECT capacity, waitlist_enabled, rsvp_cutoff, time
                  FROM game WHERE id = ?
                  FOR UPDATE
                """, (rs, rn) -> new GameRow(
                    (Integer) rs.getObject("capacity"),
                    rs.getBoolean("waitlist_enabled"),
                    toOdt(rs.getObject("rsvp_cutoff")),
                    toOdt(rs.getObject("time"))
                ), gameId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private static OffsetDateTime toOdt(Object v) {
        if (v instanceof java.time.OffsetDateTime odt) return odt;
        if (v instanceof java.sql.Timestamp ts) return OffsetDateTime.ofInstant(ts.toInstant(), ZoneOffset.UTC);
        if (v instanceof java.time.Instant i) return OffsetDateTime.ofInstant(i, ZoneOffset.UTC);
        return null;
    }

    private record GameRow(Integer capacity, boolean waitlistEnabled, OffsetDateTime rsvpCutoff, OffsetDateTime time) {}
}
