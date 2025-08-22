package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.GameStatsDTO;
import com.bmessi.pickupsportsapp.dto.UserStatsDTO;
import com.bmessi.pickupsportsapp.service.StatsService;
import lombok.RequiredArgsConstructor;
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
    public GameStatsDTO getGameStats(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return statsService.getGameStats(sport, fromDate, toDate);
    }

    @GetMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public UserStatsDTO getMyStats(Principal principal) {
        return statsService.getUserStats(principal.getName());
    }

    @GetMapping("/users/{userId}")
    public UserStatsDTO getUserStats(@PathVariable Long userId) {
        return statsService.getUserStats(userId);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public DashboardStatsDTO getDashboardStats(Principal principal) {
        return statsService.getDashboardStats(principal.getName());
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