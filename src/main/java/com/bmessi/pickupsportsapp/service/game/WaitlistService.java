package com.bmessi.pickupsportsapp.service.game;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bmessi.pickupsportsapp.exception.WaitlistServiceException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitlistService {

    private static final Logger log = LoggerFactory.getLogger(WaitlistService.class);

    private final JdbcTemplate jdbc;

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
            int n = jdbc.update("INSERT INTO game_waitlist (game_id, user_id, created_at) VALUES (?,?,?)",
                    gameId, userId, java.sql.Timestamp.from(Instant.now()));
            return n > 0;
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
        // Select earliest on waitlist up to N
        List<Long> userIds = jdbc.queryForList("""
                SELECT user_id FROM game_waitlist
                 WHERE game_id = ?
                 ORDER BY created_at ASC
                 LIMIT ?
                """, Long.class, gameId, Math.max(0, slots));
        // Remove them from waitlist now; caller should add as participants
        if (!userIds.isEmpty()) {
            jdbc.update("DELETE FROM game_waitlist WHERE game_id = ? AND user_id = ANY(?)",
                    gameId, userIds.toArray(new Long[0]));
        }
        return userIds;
    }
}
