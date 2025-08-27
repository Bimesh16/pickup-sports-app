package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.web.ApiResponseUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class NearbyExploreController {

    private final GameRepository gameRepository;
    private final ApiMapper mapper;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

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

        Page<Game> page = gameRepository.findByLocationWithinRadius(
                normalize(sport),
                normalize(location),
                fromTime,
                toTime,
                normalize(skillLevel),
                lat,
                lon,
                r,
                pageable
        );
        Page<GameSummaryDTO> body = page.map(mapper::toGameSummaryDTO);

        HttpHeaders headers = new HttpHeaders();
        ApiResponseUtils.addPaginationLinks(request, headers, page);
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=15");
        try { meterRegistry.counter("games.nearby.requests").increment(); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(headers).body(body);
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

    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
