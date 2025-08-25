package com.bmessi.pickupsportsapp.service.search;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostgisSyncService {

    private static final Logger log = LoggerFactory.getLogger(PostgisSyncService.class);

    private final JdbcTemplate jdbc;

    @Value("${geo.postgis.sync.enabled:true}")
    private boolean enabled;

    // Backfill geom for rows with lat/lon but missing geom
    @Transactional
    public int backfillOnce() {
        if (!enabled) return 0;
        try {
            int updated = jdbc.update("""
                UPDATE game
                   SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                 WHERE geom IS NULL
                   AND latitude IS NOT NULL
                   AND longitude IS NOT NULL
            """);
            log.info("PostGIS geom backfill updated {} rows", updated);
            return updated;
        } catch (Exception e) {
            log.warn("PostGIS geom backfill failed: {}", e.getMessage());
            return 0;
        }
    }

    // Optional daily job to catch drifts (lightweight)
    @Scheduled(cron = "${geo.postgis.sync.cron:0 10 4 * * *}")
    public void scheduledBackfill() {
        backfillOnce();
    }
}
