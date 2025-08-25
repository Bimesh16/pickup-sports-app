package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class ExploreController {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private final GameRepository gameRepository;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @org.springframework.cache.annotation.Cacheable(
            value = "explore-first",
            condition = "#cursor == null && #sport == null && #location == null && #fromTime == null && #toTime == null && #skillLevel == null && (#limit == null || #limit <= 20)"
    )
    @GetMapping("/explore")
    public ResponseEntity<Map<String, Object>> explore(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            @RequestParam(required = false) String skillLevel,
            @RequestParam(required = false, name = "cursor") String cursor,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        int effLimit = clamp(limit == null ? DEFAULT_PAGE_SIZE : limit, 1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE);
        Cursor decoded = decodeCursor(cursor);

        List<Game> rows = gameRepository.exploreCursor(
                normalize(sport),
                normalize(location),
                fromTime,
                toTime,
                normalize(skillLevel),
                decoded.time,
                decoded.id,
                effLimit + 1 // fetch one extra to know if there's a next page
        );

        boolean hasMore = rows.size() > effLimit;
        if (hasMore) {
            rows = rows.subList(0, effLimit);
        }

        String next = null;
        if (hasMore && !rows.isEmpty()) {
            Game last = rows.get(rows.size() - 1);
            OffsetDateTime t = extractTime(last);
            if (t != null) {
                long epochMillis = t.toInstant().toEpochMilli();
                next = encodeCursor(epochMillis, last.getId());
            }
        }

        List<Map<String, Object>> items = new ArrayList<>(rows.size());
        for (Game g : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", g.getId());
            try { m.put("sport", g.getSport()); } catch (Exception ignore) {}
            try {
                OffsetDateTime t = extractTime(g);
                if (t != null) m.put("time", t);
            } catch (Exception ignore) {}
            items.add(m);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=15");
        if (next != null) {
            String link = "</games/explore?cursor=" + next + ">; rel=\"next\"";
            headers.add(HttpHeaders.LINK, link);
        }
        try { meterRegistry.counter("games.explore.requests").increment(); } catch (Exception ignore) {}
        try { meterRegistry.counter("games.explore.items", "size", String.valueOf(items.size())).increment(); } catch (Exception ignore) {}
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("items", items);
        if (next != null) body.put("nextCursor", next);
        return ResponseEntity.ok().headers(headers).body(body);
    }

    private static int clamp(int requested, int min, int max, int dflt) {
        if (requested < min) return dflt;
        if (requested > max) return max;
        return requested;
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static OffsetDateTime extractTime(Game g) {
        try {
            // Expecting an OffsetDateTime "time" property on Game
            java.lang.reflect.Method m = g.getClass().getMethod("getTime");
            Object v = m.invoke(g);
            if (v instanceof OffsetDateTime odt) return odt;
            if (v instanceof Instant inst) return OffsetDateTime.ofInstant(inst, ZoneOffset.UTC);
        } catch (Exception ignore) {}
        return null;
    }

    private static Cursor decodeCursor(String raw) {
        if (raw == null || raw.isBlank()) return new Cursor(null, null);
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(raw);
            String s = new String(bytes, StandardCharsets.UTF_8);
            int sep = s.indexOf(':');
            if (sep <= 0) return new Cursor(null, null);
            long ms = Long.parseLong(s.substring(0, sep));
            long id = Long.parseLong(s.substring(sep + 1));
            return new Cursor(OffsetDateTime.ofInstant(Instant.ofEpochMilli(ms), ZoneOffset.UTC), id);
        } catch (Exception e) {
            return new Cursor(null, null);
        }
    }

    private static String encodeCursor(long epochMillis, Long id) {
        if (id == null) return null;
        String s = epochMillis + ":" + id;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private record Cursor(OffsetDateTime time, Long id) {}
}
