package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.i18n.EventI18n;
import com.bmessi.pickupsportsapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Scheduled reminders for upcoming games.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GameReminderNotifier {

    private final JdbcTemplate jdbc;
    private final NotificationService notificationService;
    private final PushNotificationService pushNotificationService;
    private final Optional<EmailService> emailService;

    // Remind 24 hours before
    @Scheduled(cron = "${reminders.games.24h.cron:0 0 8 * * *}")
    public void remind24h() {
        sendReminders(24);
    }

    // Remind 2 hours before
    @Scheduled(cron = "${reminders.games.2h.cron:0 0 * * * *}")
    public void remind2h() {
        sendReminders(2);
    }

    void sendReminders(int hoursAhead) {
        try {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            OffsetDateTime from = now.plusHours(hoursAhead);
            OffsetDateTime to = from.plusMinutes(15);
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
                dispatch(owner, sport, location, "reminder");
                List<String> participants = jdbc.queryForList("""
                    SELECT u.username FROM game_participants gp
                    JOIN app_user u ON u.id = gp.user_id
                    WHERE gp.game_id = ?
                    """, String.class, gameId);
                for (String p : participants) {
                    dispatch(p, sport, location, "reminder");
                }
            }
        } catch (Exception e) {
            log.warn("Game reminder job failed: {}", e.getMessage(), e);
        }
    }

    private void dispatch(String username, String sport, String location, String action) {
        String message = EventI18n.subject(action, Locale.getDefault());
        try { notificationService.createNotification(username, message); } catch (Exception ignore) {}
        try { pushNotificationService.send(username, message, ""); } catch (Exception ignore) {}
        try {
            Map<String, String> model = Map.of(
                    "sport", sport == null ? "" : sport,
                    "location", location == null ? "" : location,
                    "actor", "system"
            );
            emailService.ifPresent(es -> {
                try {
                    es.sendGameEventEmailNow(username, action, model, Locale.getDefault());
                } catch (Exception ignore) {}
            });
        } catch (Exception ignore) {}
    }
}
