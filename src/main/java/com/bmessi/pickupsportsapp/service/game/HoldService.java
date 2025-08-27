package com.bmessi.pickupsportsapp.service.game;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HoldService {

    private final JdbcTemplate jdbc;

    public record HoldResult(boolean created, Long holdId, OffsetDateTime expiresAt, String reason) {}
    public record ConfirmResult(boolean joined, String reason) {}

    @Transactional
    public HoldResult createHold(Long gameId, Long userId, int ttlSeconds) {
        GameRow g = fetchGameForUpdate(gameId).orElse(null);
        if (g == null) return new HoldResult(false, null, null, "not_found");

        if (g.rsvpCutoff != null && java.time.Instant.now().isAfter(g.rsvpCutoff.toInstant())) {
            return new HoldResult(false, null, null, "cutoff");
        }

        int capacity = g.capacity != null ? g.capacity : Integer.MAX_VALUE;
        int participants = optCount("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", gameId);
        int activeHolds = optCount("SELECT COUNT(*) FROM game_holds WHERE game_id = ? AND expires_at > now()", gameId);

        if (participants + activeHolds >= capacity) {
            return new HoldResult(false, null, null, "full");
        }

        // Upsert-like: renew an existing hold for same user/game or create a new one
        var rs = jdbc.queryForRowSet("""
                INSERT INTO game_holds (game_id, user_id, expires_at)
                VALUES (?, ?, now() + make_interval(secs => ?))
                ON CONFLICT (game_id, user_id) DO UPDATE
                   SET expires_at = excluded.expires_at
                RETURNING id, expires_at
                """, gameId, userId, Math.max(1, ttlSeconds));
        if (rs.next()) {
            Long id = rs.getLong("id");
            java.sql.Timestamp ts = (java.sql.Timestamp) rs.getObject("expires_at");
            return new HoldResult(true, id, ts.toInstant().atOffset(ZoneOffset.UTC), "ok");
        }
        return new HoldResult(false, null, null, "db_error");
    }

    @Transactional
    public ConfirmResult confirmHold(Long gameId, Long holdId, Long userId) {
        GameRow g = fetchGameForUpdate(gameId).orElse(null);
        if (g == null) return new ConfirmResult(false, "not_found");

        // Lock the hold row to prevent double confirm
        var hold = jdbc.query("""
                SELECT id, expires_at, payment_intent_id FROM game_hold
                SELECT id, expires_at FROM game_holds
                 WHERE id = ? AND game_id = ? AND user_id = ? FOR UPDATE
                """, ps -> { ps.setLong(1, holdId); ps.setLong(2, gameId); ps.setLong(3, userId); },
                (rs, rn) -> new HoldRow(rs.getTimestamp("expires_at"), rs.getString("payment_intent_id"))).stream().findFirst().orElse(null);

        if (hold == null) {
            return new ConfirmResult(false, "invalid_hold");
        }
        if (hold.expiresAt().toInstant().isBefore(java.time.Instant.now())) {
            // Expired: delete and return 410
            jdbc.update("DELETE FROM game_holds WHERE id = ?", holdId);
            return new ConfirmResult(false, "expired");
        }

        // Ensure still capacity (participants + active holds includes this hold)
        int capacity = g.capacity != null ? g.capacity : Integer.MAX_VALUE;
        int participants = optCount("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", gameId);
        int activeHolds = optCount("SELECT COUNT(*) FROM game_holds WHERE game_id = ? AND expires_at > now()", gameId);
        if (participants >= capacity) {
            // Should not happen often because this hold already reserved a slot
            return new ConfirmResult(false, "full");
        }

        // Convert hold -> participant atomically under game row + hold row lock
        jdbc.update("DELETE FROM game_holds WHERE id = ?", holdId);
        jdbc.update("""
                INSERT INTO game_participants (game_id, user_id, payment_intent_id)
                VALUES (?, ?, ?)
                ON CONFLICT DO NOTHING
                """, gameId, userId, hold.paymentIntentId());

        return new ConfirmResult(true, "ok");
    }

    private Optional<GameRow> fetchGameForUpdate(Long gameId) {
        try {
            return Optional.ofNullable(jdbc.queryForObject("""
                SELECT capacity, rsvp_cutoff, time
                  FROM game WHERE id = ?
                  FOR UPDATE
                """, (rs, rn) -> new GameRow(
                    (Integer) rs.getObject("capacity"),
                    toOdt(rs.getObject("rsvp_cutoff")),
                    toOdt(rs.getObject("time"))
                ), gameId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private int optCount(String sql, Object... args) {
        Integer n = jdbc.queryForObject(sql, Integer.class, args);
        return n == null ? 0 : n;
    }

    private static OffsetDateTime toOdt(Object v) {
        if (v instanceof java.time.OffsetDateTime odt) return odt;
        if (v instanceof java.sql.Timestamp ts) return ts.toInstant().atOffset(ZoneOffset.UTC);
        if (v instanceof java.time.Instant i) return OffsetDateTime.ofInstant(i, ZoneOffset.UTC);
        return null;
    }

    private record GameRow(Integer capacity, OffsetDateTime rsvpCutoff, OffsetDateTime time) {}
    private record HoldRow(java.sql.Timestamp expiresAt, String paymentIntentId) {}
}
