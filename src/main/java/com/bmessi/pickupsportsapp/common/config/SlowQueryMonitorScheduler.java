package com.bmessi.pickupsportsapp.common.config;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SlowQueryMonitorScheduler {

    private static final Logger log = LoggerFactory.getLogger(SlowQueryMonitorScheduler.class);

    private final JdbcTemplate jdbc;
    private final MeterRegistry metrics;

    // Run every hour
    @Scheduled(cron = "${perf.slowquery.cron:0 5 * * * *}")
    public void run() {
        explain("EXPLAIN ANALYZE SELECT id, sport, time FROM game ORDER BY time DESC LIMIT 50", "games.top");
        explain("EXPLAIN ANALYZE SELECT DISTINCT sport FROM game", "sports.distinct");
    }

    private void explain(String sql, String name) {
        long t0 = System.nanoTime();
        try {
            jdbc.queryForList(sql);
            long dur = System.nanoTime() - t0;
            metrics.timer("slowquery.explain", "name", name).record(dur, java.util.concurrent.TimeUnit.NANOSECONDS);
        } catch (Exception e) {
            log.debug("EXPLAIN failed for {}: {}", name, e.toString());
        }
    }
}
