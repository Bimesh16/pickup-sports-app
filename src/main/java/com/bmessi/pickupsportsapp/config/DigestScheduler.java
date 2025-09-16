package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Component
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "digest.enabled", havingValue = "true", matchIfMissing = false)
public class DigestScheduler {

    private static final Logger log = LoggerFactory.getLogger(DigestScheduler.class);

    private final JdbcTemplate jdbc;
    private final Optional<EmailService> email;

    // Daily at 07:00 UTC by default
    @Scheduled(cron = "${digest.daily.cron:0 0 7 * * *}")
    public void dailyDigest() {
        sendDigest(true);
    }

    // Weekly on Monday at 07:30 UTC by default
    @Scheduled(cron = "${digest.weekly.cron:0 30 7 * * MON}")
    public void weeklyDigest() {
        sendDigest(false);
    }

    private void sendDigest(boolean daily) {
        try {
            String prefCol = daily ? "email_digest_daily" : "email_digest_weekly";
            List<Map<String, Object>> rows = jdbc.queryForList("SELECT u.username FROM user_notification_prefs p JOIN app_user u ON u.id = p.user_id WHERE p." + prefCol + " = TRUE");
            if (rows.isEmpty()) return;

            for (Map<String, Object> r : rows) {
                String username = String.valueOf(r.get("username"));
                List<Map<String, String>> items = fetchUpcomingGames(username, daily ? 1 : 7);
                if (items.isEmpty()) continue;
                try {
                    email.ifPresent(es -> {
                        try {
                            es.sendDigestEmail(username, items, java.util.Locale.getDefault());
                        } catch (Exception ignore) {}
                    });
                } catch (Exception e) {
                    log.warn("Failed sending digest to {}: {}", username, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Digest job failed: {}", e.getMessage(), e);
        }
    }

    private List<Map<String, String>> fetchUpcomingGames(String username, int daysAhead) {
        // Example: games user created or is participating in within next N days
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime until = now.plusDays(daysAhead);
        String sql = """
            SELECT g.sport, COALESCE(CAST(g.location AS TEXT), '') AS location, g.time
              FROM game g
              LEFT JOIN game_participants gp ON gp.game_id = g.id
              LEFT JOIN app_user u ON u.id = g.user_id
             WHERE (u.username = ? OR gp.user_id = u.id)
               AND g.time >= ? AND g.time < ?
             ORDER BY g.time
            """;
        List<Map<String, Object>> raw = jdbc.queryForList(sql, username, java.sql.Timestamp.from(now.toInstant()), java.sql.Timestamp.from(until.toInstant()));
        List<Map<String, String>> items = new ArrayList<>(raw.size());
        for (var row : raw) {
            String sport = String.valueOf(row.getOrDefault("sport", ""));
            String loc = String.valueOf(row.getOrDefault("location", ""));
            Object t = row.get("time");
            String iso = (t instanceof java.time.OffsetDateTime odt) ? odt.toString() : String.valueOf(t);
            items.add(Map.of("sport", sport, "location", loc, "time", iso));
        }
        return items;
    }
}
