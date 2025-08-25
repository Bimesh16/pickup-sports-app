package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.GameStatsDTO;
import com.bmessi.pickupsportsapp.dto.UserStatsDTO;
import com.bmessi.pickupsportsapp.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/games/overview")
    public ResponseEntity<GameStatsDTO> getGameStats(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        GameStatsDTO body = statsService.getGameStats(sport, fromDate, toDate);
        HttpHeaders headers = com.bmessi.pickupsportsapp.web.ApiResponseUtils.cachePrivate(60);
        return ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserStatsDTO> getMyStats(Principal principal) {
        UserStatsDTO body = statsService.getUserStats(principal.getName());
        HttpHeaders headers = com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
        return ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserStatsDTO> getUserStats(@PathVariable Long userId) {
        UserStatsDTO body = statsService.getUserStats(userId);
        HttpHeaders headers = com.bmessi.pickupsportsapp.web.ApiResponseUtils.cachePrivate(30);
        return ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(Principal principal) {
        DashboardStatsDTO body = statsService.getDashboardStats(principal.getName());
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "no-store");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        return ResponseEntity.ok().headers(headers).body(body);
    }

    public record DashboardStatsDTO(
            int totalGamesPlayed,
            int upcomingGames,
            double averageRating,
            int totalRatingsReceived,
            String mostPlayedSport,
            int gamesThisMonth
    ) {}
}