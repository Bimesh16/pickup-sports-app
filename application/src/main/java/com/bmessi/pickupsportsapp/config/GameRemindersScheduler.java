package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GameRemindersScheduler {

    private static final Logger log = LoggerFactory.getLogger(GameRemindersScheduler.class);

    private final JdbcTemplate jdbc;
    private final NotificationService notificationService;

    // Remind 24 hours before
    @Scheduled(cron = "${reminders.games.24h.cron:0 0 8 * * *}")
    public void remind24h() {
        sendReminders(24);
    }

    // Remind 1 hour before
    @Scheduled(cron = "${reminders.games.1h.cron:0 0 * * * *}")
    public void remind1h() {
        sendReminders(1);
    }

    private void sendReminders(int hoursAhead) {
        try {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            OffsetDateTime from = now.plusHours(hoursAhead);
            OffsetDateTime to = from.plusMinutes(15); // small window
            List<Map<String, Object>> games = jdbc.queryForList("""
                SELECT g.id, g.sport, COALESCE(CAST(g.location AS TEXT), '') AS location, g.time,
                       u.username AS owner
                  FROM game g
                  JOIN app_user u ON u.id = g.user_id
                 WHERE g.time >= ? AND g.time < ?
                """, java.sql.Timestamp.from(from.toInstant()), java.sql.Timestamp.from(to.toInstant()));
            for (var g : games) {
                Long gameId = ((Number) g.get("id")).longValue();
                String sport = String.valueOf(g.get("sport"));
                String location = String.valueOf(g.get("location"));
                String owner = String.valueOf(g.get("owner"));
                // notify owner
                safeDispatch(owner, "system", sport, location, "reminder");
                // notify participants
                List<String> participants = jdbc.queryForList("""
                    SELECT u.username FROM game_participants gp
                    JOIN app_user u ON u.id = gp.user_id
                    WHERE gp.game_id = ?
                    """, String.class, gameId);
                for (String p : participants) {
                    safeDispatch(p, "system", sport, location, "reminder");
                }
            }
        } catch (Exception e) {
            log.warn("Game reminder job failed: {}", e.getMessage(), e);
        }
    }

    private void safeDispatch(String recipient, String actor, String sport, String location, String action) {
        try { notificationService.createGameNotification(recipient, actor, sport, location, action); } catch (Exception ignore) {}
    }
}
