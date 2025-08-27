package com.bmessi.pickupsportsapp.service.game;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class HoldCleanupJob {

    private final JdbcTemplate jdbc;
    private final org.springframework.messaging.simp.SimpMessagingTemplate broker;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    /**
     * Periodically remove expired holds and notify game topics so UIs can refresh capacity indicators.
     * Defaults: run every 60s with initial 15s delay; configurable via properties.
     */
    @Scheduled(
            fixedDelayString = "${rsvp.holds.cleanup-interval-ms:60000}",
            initialDelayString = "${rsvp.holds.cleanup-initial-delay-ms:15000}"
    )
    @Transactional
    public void cleanupExpiredHolds() {
        try {
            // Delete expired holds and capture affected game IDs
            List<Long> gameIds = jdbc.queryForList("""
                    WITH deleted AS (
                        DELETE FROM game_hold
                         WHERE expires_at <= now()
                         RETURNING game_id
                    )
                    SELECT DISTINCT game_id FROM deleted
                    """, Long.class);

            int affected = gameIds.size();
            if (affected > 0) {
                try {
                    meterRegistry.counter("rsvp.holds.expired", "games", String.valueOf(affected)).increment(affected);
                } catch (Exception ignore) {}

                for (Long gameId : gameIds) {
                    try {
                        broker.convertAndSend(
                                "/topic/games/" + gameId,
                                Map.of(
                                        "type", "capacity_update_hint",
                                        "data", Map.of("hint", "holds_expired"),
                                        "timestamp", System.currentTimeMillis()
                                )
                        );
                    } catch (Exception e) {
                        log.debug("WS hint emit failed for game {}", gameId, e);
                    }
                }
                log.debug("Cleaned up expired holds; affected games: {}", affected);
            }
        } catch (Exception e) {
            log.warn("Hold cleanup job failed: {}", e.getMessage());
        }
    }
}
