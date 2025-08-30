package com.bmessi.pickupsportsapp.service.search;

import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;

@Service
@lombok.RequiredArgsConstructor
public class GeospatialSearchService {

    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private volatile boolean postgisAvailable = false;

    @jakarta.annotation.PostConstruct
    void detectPostgis() {
        try {
            String v = jdbcTemplate.queryForObject("SELECT postgis_version()", String.class);
            postgisAvailable = (v != null && !v.isBlank());
        } catch (Exception ignore) {
            postgisAvailable = false;
        }
    }

    @org.springframework.beans.factory.annotation.Value("${geo.postgis.force-fallback:false}")
    private boolean forceFallback;

    @Cacheable(cacheNames = "nearby-games", key = "#lat + ':' + #lon + ':' + #radiusKm + ':' + #limit")
    public List<com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO> findNearby(double lat, double lon, double radiusKm, int limit) {
        int effLimit = Math.max(1, Math.min(limit, 100));
        double clampedRadius = Math.max(0.1, Math.min(radiusKm, 50.0)); // cap at 50km

        if (postgisAvailable && !forceFallback) {
            String sql = """
                    SELECT g.id,
                           g.sport,
                           CAST(g.location AS TEXT) AS location,
                           g.time,
                           g.skill_level,
                           g.latitude,
                           g.longitude,
                           ST_Distance(g.geom, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0 AS distance_km
                      FROM game g
                     WHERE g.geom IS NOT NULL
                       AND ST_DWithin(g.geom, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ? * 1000.0)
                     ORDER BY distance_km, g.time, g.id
                     LIMIT ?
                    """;
            long t0 = System.nanoTime();
            List<com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO> out = jdbcTemplate.query(sql, (rs, rowNum) ->
                    com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO.builder()
                            .id(rs.getLong("id"))
                            .sport(rs.getString("sport"))
                            .location(rs.getString("location"))
                            .time(rs.getObject("time", java.time.OffsetDateTime.class))
                            .skillLevel(rs.getString("skill_level"))
                            .latitude((Double) rs.getObject("latitude"))
                            .longitude((Double) rs.getObject("longitude"))
                            .creatorName("Unknown") // Will be populated later if needed
                            .currentPlayers(0) // Will be populated later if needed
                            .maxPlayers(null) // Will be populated later if needed
                            .status("ACTIVE") // Default status
                            .build(), lon, lat, lon, lat, clampedRadius, effLimit);
            long t1 = System.nanoTime();
            try { meterRegistry.timer("games.nearby.query.postgis").record(t1 - t0, java.util.concurrent.TimeUnit.NANOSECONDS); } catch (Exception ignore) {}
            return out;
        }

        // Fallback: Haversine with bounding box (native SQL)
        double latRad = Math.toRadians(lat);
        double deltaLat = clampedRadius / 111.32d;
        double deltaLon = clampedRadius / (111.32d * Math.cos(latRad) + 1e-12d);

        double minLat = lat - deltaLat;
        double maxLat = lat + deltaLat;
        double minLon = lon - deltaLon;
        double maxLon = lon + deltaLon;

        String sql = """
            SELECT g.id,
                   g.sport,
                   CAST(g.location AS TEXT) AS location,
                   g.time,
                   g.skill_level,
                   g.latitude,
                   g.longitude,
                   (6371.0 * acos(cos(radians(?)) * cos(radians(g.latitude)) *
                    cos(radians(g.longitude) - radians(?)) + sin(radians(?)) *
                    sin(radians(g.latitude)))) AS distance_km
              FROM game g
             WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL
               AND g.latitude BETWEEN ? AND ?
               AND g.longitude BETWEEN ? AND ?
               AND (6371.0 * acos(cos(radians(?)) * cos(radians(g.latitude)) *
                    cos(radians(g.longitude) - radians(?)) + sin(radians(?)) *
                    sin(radians(g.latitude)))) <= ?
             ORDER BY distance_km, g.time, g.id
             LIMIT ?
            """;

        long t0 = System.nanoTime();
        List<com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO> out = jdbcTemplate.query(sql, (rs, rowNum) ->
                com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO.builder()
                        .id(rs.getLong("id"))
                        .sport(rs.getString("sport"))
                        .location(rs.getString("location"))
                        .time(rs.getObject("time", java.time.OffsetDateTime.class))
                        .skillLevel(rs.getString("skill_level"))
                        .latitude((Double) rs.getObject("latitude"))
                        .longitude((Double) rs.getObject("longitude"))
                        .creatorName("Unknown") // Will be populated later if needed
                        .currentPlayers(0) // Will be populated later if needed
                        .maxPlayers(null) // Will be populated later if needed
                        .status("ACTIVE") // Default status
                        .build(),
                lat, lon, lat,
                minLat, maxLat, minLon, maxLon,
                lat, lon, lat,
                clampedRadius,
                effLimit
        );
        long t1 = System.nanoTime();
        try { meterRegistry.timer("games.nearby.query.haversine").record(t1 - t0, java.util.concurrent.TimeUnit.NANOSECONDS); } catch (Exception ignore) {}
        return out;
    }
}
