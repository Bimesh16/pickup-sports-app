package com.bmessi.pickupsportsapp.service.game;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bmessi.pickupsportsapp.exception.WaitlistServiceException;
import com.bmessi.pickupsportsapp.service.notification.WaitlistPromotionEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WaitlistService {

    private static final Logger log = LoggerFactory.getLogger(WaitlistService.class);

    private final JdbcTemplate jdbc;
    private final ApplicationEventPublisher events;

    @Transactional(readOnly = true)
    public int participantCount(Long gameId) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        return n == null ? 0 : n;
    }

    @Transactional(readOnly = true)
    public int waitlistCount(Long gameId) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM game_waitlist WHERE game_id = ?", Integer.class, gameId);
        return n == null ? 0 : n;
    }

    @Transactional
    public boolean addToWaitlist(Long gameId, Long userId) {
        try {
            int n = jdbc.update("""
                    INSERT INTO game_waitlist (game_id, user_id, created_at)
                    VALUES (?,?,?)
                    ON CONFLICT (game_id, user_id) DO NOTHING
                    """, gameId, userId, java.sql.Timestamp.from(Instant.now()));
            return n > 0; // false means already on waitlist (idempotent)
        } catch (DataAccessException e) {
            log.error("Failed to add user {} to waitlist for game {}", userId, gameId, e);
            throw new WaitlistServiceException("Unable to add to waitlist", e);
        }
    }

    @Transactional
    public boolean removeFromWaitlist(Long gameId, Long userId) {
        int n = jdbc.update("DELETE FROM game_waitlist WHERE game_id = ? AND user_id = ?", gameId, userId);
        return n > 0;
    }

    @Transactional
    public List<Long> promoteUpTo(Long gameId, int slots) {
        Map<String, Object> game = jdbc.queryForMap("SELECT COALESCE(CAST(location AS TEXT), '') AS location, COALESCE(sport, '') AS sport FROM game WHERE id = ?", gameId);
        String sport = String.valueOf(game.get("sport"));
        String location = String.valueOf(game.get("location"));

        List<Map<String, Object>> rows = jdbc.queryForList("""
                WITH selected AS (
                    SELECT gw.game_id, gw.user_id, u.username
                    FROM game_waitlist gw
                    JOIN app_user u ON gw.user_id = u.id
                    WHERE gw.game_id = ?
                    ORDER BY gw.created_at ASC
                    FOR UPDATE SKIP LOCKED
                    LIMIT ?
                )
                DELETE FROM game_waitlist gw
                USING selected s
                WHERE gw.game_id = s.game_id AND gw.user_id = s.user_id
                RETURNING s.user_id, s.username
                """, gameId, Math.max(0, slots));

        List<Long> userIds = new ArrayList<>(rows.size());
        for (Map<String, Object> row : rows) {
            Long uid = ((Number) row.get("user_id")).longValue();
            userIds.add(uid);
            String username = (String) row.get("username");
            try {
                events.publishEvent(new WaitlistPromotionEvent(username, sport, location));
            } catch (Exception e) {
                log.warn("Failed to publish promotion event for {}", username, e);
            }
        }
        return userIds;
    }
}
