package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ApiMapper mapper;

    @io.swagger.v3.oas.annotations.Operation(
            summary = "Search games",
            description = "Filters by sport, location, skill level, time range, and optional radius from provided coordinates."
    )
    @GetMapping("/games")
    public org.springframework.http.ResponseEntity<Page<GameSummaryDTO>> searchGames(
            @io.swagger.v3.oas.annotations.Parameter(description = "Filter by sport")
            @RequestParam(required = false) String sport,
            @io.swagger.v3.oas.annotations.Parameter(description = "Filter by location substring")
            @RequestParam(required = false) String location,
            @io.swagger.v3.oas.annotations.Parameter(description = "Filter by skill level")
            @RequestParam(required = false) String skillLevel,
            @io.swagger.v3.oas.annotations.Parameter(description = "Start of time window")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @io.swagger.v3.oas.annotations.Parameter(description = "End of time window")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate,
            @io.swagger.v3.oas.annotations.Parameter(description = "Latitude for radius search")
            @RequestParam(required = false) Double lat,
            @io.swagger.v3.oas.annotations.Parameter(description = "Longitude for radius search")
            @RequestParam(required = false) Double lng,
            @io.swagger.v3.oas.annotations.Parameter(description = "Radius in kilometers", example = "10.0")
            @RequestParam(required = false, defaultValue = "10.0") Double radiusKm,
            @PageableDefault(size = 20, sort = "time") Pageable pageable,
            jakarta.servlet.http.HttpServletRequest request,
            @org.springframework.web.bind.annotation.RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSince
    ) {
        // Normalize and validate filters
        String nsport = normalize(sport);
        String nloc = normalize(location);
        validateTimeRange(fromDate, toDate);

        Page<Game> games = gameRepository.search(nsport, nloc, fromDate, toDate, skillLevel, lat, lng, radiusKm, pageable);
        Page<GameSummaryDTO> body = games.map(mapper::toGameSummaryDTO);

        // Compute Last-Modified from entities (max of updatedAt/createdAt/time)
        long lastMod = games.getContent().stream()
                .mapToLong(SearchController::lastModifiedEpochMilli)
                .max()
                .orElse(System.currentTimeMillis());

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        com.bmessi.pickupsportsapp.web.ApiResponseUtils.addPaginationLinks(request, headers, games);
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add("Cache-Control", "private, max-age=30");
        headers.add("Last-Modified", com.bmessi.pickupsportsapp.web.ApiResponseUtils.httpDate(lastMod));

        Long clientMillis = parseIfModifiedSince(ifModifiedSince);
        if (clientMillis != null && lastMod <= clientMillis) {
            return org.springframework.http.ResponseEntity.status(304).headers(headers).build();
        }

        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/users")
    public org.springframework.http.ResponseEntity<Page<UserDTO>> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String preferredSport,
            @RequestParam(required = false) String location,
            @PageableDefault(size = 20) Pageable pageable,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        // Normalize inputs
        String nuser = normalize(username);
        String nsport = normalize(preferredSport);
        String nloc = normalize(location);

        Page<User> users = userRepository.search(nsport, nloc, nuser, pageable);
        Page<UserDTO> body = users.map(mapper::toUserDTO);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        com.bmessi.pickupsportsapp.web.ApiResponseUtils.addPaginationLinks(request, headers, users);
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add("Cache-Control", "private, max-age=30");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/filters")
    @Cacheable("search-filters")
    public SearchFiltersResponse getFilters() {
        Set<String> sports = gameRepository.findDistinctSports();
        Set<String> locations = userRepository.findDistinctLocations();

        return new SearchFiltersResponse(
                sports.stream().sorted().toList(),
                locations.stream().sorted().toList(),
                List.of("Beginner", "Intermediate", "Advanced", "Pro")
        );
    }

    // ===========================
    // Private helper methods
    // ===========================
    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static void validateTimeRange(OffsetDateTime from, OffsetDateTime to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "fromDate must be <= toDate");
        }
    }


    private static long lastModifiedEpochMilli(Game g) {
        if (g.getUpdatedAt() != null) return g.getUpdatedAt().toInstant().toEpochMilli();
        if (g.getCreatedAt() != null) return g.getCreatedAt().toInstant().toEpochMilli();
        if (g.getTime() != null) return g.getTime().toEpochMilli();
        return System.currentTimeMillis();
    }

    private static String httpDate(long epochMillis) {
        return java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(java.time.ZoneOffset.UTC)
                .format(java.time.Instant.ofEpochMilli(epochMillis));
    }

    private static Long parseIfModifiedSince(String header) {
        if (header == null || header.isBlank()) return null;
        try {
            var zdt = java.time.ZonedDateTime.parse(header.trim(),
                    java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME);
            return zdt.toInstant().toEpochMilli();
        } catch (Exception ignore) {
            return null;
        }
    }

    public record SearchFiltersResponse(
            List<String> availableSports,
            List<String> availableLocations,
            List<String> skillLevels
    ) {}
}