package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.search.GeospatialSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class NearbyExploreController {

    private final GeospatialSearchService service;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @GetMapping("/nearby")
    @io.github.resilience4j.ratelimiter.annotation.RateLimiter(name = "nearby")
    public ResponseEntity<Map<String, Object>> nearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @RequestParam(defaultValue = "50") int limit
    ) {
        validateCoordinates(lat, lon);
        double r = clamp(radiusKm, 0.1, 50.0, 5.0);
        int l = clamp(limit, 1, 100, 50);

        try { meterRegistry.counter("games.nearby.requests").increment(); } catch (Exception ignore) {}
        List<com.bmessi.pickupsportsapp.dto.GameSummaryDTO> list = service.findNearby(lat, lon, r, l);
        List<Map<String, Object>> items = new ArrayList<>(list.size());
        for (com.bmessi.pickupsportsapp.dto.GameSummaryDTO g : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", g.id());
            m.put("sport", g.sport());
            m.put("location", g.location());
            m.put("time", g.time());
            // distance may be null if not computed; round only when present
            Double dk = g.distanceKm();
            m.put("distanceKm", dk == null ? null : round(dk, 2));
            items.add(m);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=15");
        return ResponseEntity.ok().headers(headers).body(Map.of("items", items));
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

    private static int clamp(int requested, int min, int max, int dflt) {
        if (requested < min) return dflt;
        if (requested > max) return max;
        return requested;
    }

    private static double round(double v, int scale) {
        double p = Math.pow(10, Math.max(0, scale));
        return Math.round(v * p) / p;
    }
}
