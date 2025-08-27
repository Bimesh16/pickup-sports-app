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
public class ExploreController {

    private final GameRepository gameRepository;
    private final ApiMapper mapper;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @io.swagger.v3.oas.annotations.Operation(
            summary = "Explore games",
            description = "Paginated list of games with optional filters.")
    @GetMapping("/explore")
    public ResponseEntity<Page<GameSummaryDTO>> explore(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            @RequestParam(required = false) String skillLevel,
            @PageableDefault(size = 20, sort = "time") Pageable pageable,
            HttpServletRequest request
    ) {
        Page<Game> page = gameRepository.search(
                normalize(sport),
                normalize(location),
                fromTime,
                toTime,
                normalize(skillLevel),
                null, null, null,
                pageable
        );
        Page<GameSummaryDTO> body = page.map(mapper::toGameSummaryDTO);

        HttpHeaders headers = new HttpHeaders();
        ApiResponseUtils.addPaginationLinks(request, headers, page);
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=15");
        try { meterRegistry.counter("games.explore.requests").increment(); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(headers).body(body);
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
