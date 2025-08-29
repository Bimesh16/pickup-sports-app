package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.web.ApiResponseUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class NearbyExploreController {

    private final GameRepository gameRepository;
    private final ApiMapper mapper;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final JdbcTemplate jdbc;

    @GetMapping("/nearby")
    @io.github.resilience4j.ratelimiter.annotation.RateLimiter(name = "nearby")
    @io.swagger.v3.oas.annotations.Operation(
            summary = "Explore nearby games",
            description = "Paginated list of games within a radius of the provided coordinates.")
    public ResponseEntity<Page<GameSummaryDTO>> nearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skillLevel,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            @PageableDefault(size = 20, sort = "time") Pageable pageable,
            HttpServletRequest request
    ) {
        validateCoordinates(lat, lon);
        double r = clamp(radiusKm, 0.1, 50.0, 5.0);

        // Always use Haversine-based fallback to support environments without PostGIS/geom.
        Page<Game> page = fallbackGeoSearch(
                lat, lon, r,
                normalize(sport), normalize(location), normalize(skillLevel),
                fromTime, toTime, pageable
        );

        Page<GameSummaryDTO> body = page.map(mapper::toGameSummaryDTO);

        HttpHeaders headers = new HttpHeaders();
        ApiResponseUtils.addPaginationLinks(request, headers, page);
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=15");
        try { meterRegistry.counter("games.nearby.requests").increment(); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(headers).body(body);
    }

    private Page<Game> fallbackGeoSearch(double lat, double lon, double radiusKm,
                                         String sport, String location, String skillLevel,
                                         OffsetDateTime fromTime, OffsetDateTime toTime,
                                         Pageable pageable) {
        // Bounding box to reduce scan (approximate)
        double latDelta = radiusKm / 111.0d;
        double lonDelta = radiusKm / (111.0d * Math.cos(Math.toRadians(lat)));
        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLon = lon - lonDelta;
        double maxLon = lon + lonDelta;

        // Count matching rows
        String countSql = """
                SELECT COUNT(*) 
                  FROM game g JOIN app_user u ON u.id = g.user_id
                 WHERE (COALESCE(btrim(CAST(? AS text)), '') = '' OR g.sport ILIKE btrim(CAST(? AS text)))
                   AND (COALESCE(btrim(CAST(? AS text)), '') = '' OR CAST(g.location AS text) ILIKE CONCAT('%%', btrim(CAST(? AS text)), '%%'))
                   AND (CAST(? AS timestamptz) IS NULL OR g.time >= CAST(? AS timestamptz))
                   AND (CAST(? AS timestamptz) IS NULL OR g.time <= CAST(? AS timestamptz))
                   AND (COALESCE(btrim(CAST(? AS text)), '') = '' OR g.skill_level ILIKE btrim(CAST(? AS text)))
                   AND g.latitude BETWEEN ? AND ?
                   AND g.longitude BETWEEN ? AND ?
                   AND (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(g.latitude - ?) / 2), 2) 
                        + COS(RADIANS(?)) * COS(RADIANS(g.latitude)) * POWER(SIN(RADIANS(g.longitude - ?) / 2), 2)))) <= ?
                """;
        Integer total = jdbc.queryForObject(countSql, Integer.class,
                sport, sport,
                location, location,
                fromTime, fromTime,
                toTime, toTime,
                skillLevel, skillLevel,
                minLat, maxLat,
                minLon, maxLon,
                lat, lat, lon, radiusKm
        );
        int totalCount = total == null ? 0 : total;

        if (totalCount == 0) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // Page IDs ordered by distance then time
        String pageSql = """
                SELECT g.id 
                  FROM game g JOIN app_user u ON u.id = g.user_id
                 WHERE (COALESCE(btrim(CAST(? AS text)), '') = '' OR g.sport ILIKE btrim(CAST(? AS text)))
                   AND (COALESCE(btrim(CAST(? AS text)), '') = '' OR CAST(g.location AS text) ILIKE CONCAT('%%', btrim(CAST(? AS text)), '%%'))
                   AND (CAST(? AS timestamptz) IS NULL OR g.time >= CAST(? AS timestamptz))
                   AND (CAST(? AS timestamptz) IS NULL OR g.time <= CAST(? AS timestamptz))
                   AND (COALESCE(btrim(CAST(? AS text)), '') = '' OR g.skill_level ILIKE btrim(CAST(? AS text)))
                   AND g.latitude BETWEEN ? AND ?
                   AND g.longitude BETWEEN ? AND ?
                   AND (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(g.latitude - ?) / 2), 2) 
                        + COS(RADIANS(?)) * COS(RADIANS(g.latitude)) * POWER(SIN(RADIANS(g.longitude - ?) / 2), 2)))) <= ?
                 ORDER BY 
                   (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(g.latitude - ?) / 2), 2) 
                        + COS(RADIANS(?)) * COS(RADIANS(g.latitude)) * POWER(SIN(RADIANS(g.longitude - ?) / 2), 2)))) ASC,
                   g.time ASC
                 OFFSET ? ROWS FETCH FIRST ? ROWS ONLY
                """;
        List<Long> ids = jdbc.query(pageSql, ps -> {
            int i = 1;
            ps.setObject(i++, sport); ps.setObject(i++, sport);
            ps.setObject(i++, location); ps.setObject(i++, location);
            ps.setObject(i++, fromTime); ps.setObject(i++, fromTime);
            ps.setObject(i++, toTime); ps.setObject(i++, toTime);
            ps.setObject(i++, skillLevel); ps.setObject(i++, skillLevel);
            ps.setDouble(i++, minLat); ps.setDouble(i++, maxLat);
            ps.setDouble(i++, minLon); ps.setDouble(i++, maxLon);
            ps.setDouble(i++, lat); ps.setDouble(i++, lat); ps.setDouble(i++, lon); ps.setDouble(i++, radiusKm);
            // order by distance repeats params
            ps.setDouble(i++, lat); ps.setDouble(i++, lat); ps.setDouble(i++, lon);
            ps.setInt(i++, pageable.getPageNumber() * pageable.getPageSize());
            ps.setInt(i, pageable.getPageSize());
        }, (rs, rn) -> rs.getLong(1));

        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, totalCount);
        }

        // Preserve order of IDs
        var idOrder = new java.util.HashMap<Long, Integer>(ids.size());
        for (int idx = 0; idx < ids.size(); idx++) idOrder.put(ids.get(idx), idx);

        Iterable<Game> it = gameRepository.findAllById(ids);
        List<Game> content = new ArrayList<>();
        for (Game g : it) content.add(g);
        content.sort(java.util.Comparator.comparingInt(g -> idOrder.getOrDefault(g.getId(), Integer.MAX_VALUE)));

        return new PageImpl<>(content, pageable, totalCount);
    }

    private static void validateCoordinates(double lat, double lon) {
        if (lat < -90.0 || lat > 90.0) throw new IllegalArgumentException("Latitude out of range");
        if (lon < -180.0 || lon > 180.0) throw new IllegalArgumentException("Longitude out of range");
    }

    private static double clamp(double val, double min, double max, double dflt) {
        if (Double.isNaN(val)) return dflt;
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    // Overload used in tests via reflection for integer values
    private static int clamp(int requested, int min, int max, int dflt) {
        int v = (requested <= 0) ? dflt : requested;
        return Math.min(max, Math.max(min, v));
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
