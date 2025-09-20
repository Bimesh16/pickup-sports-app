package com.bmessi.pickupsportsapp.dto;

public record DashboardStatsDTO(
        int gamesParticipated,
        int upcomingGames,
        double averageRating,
        int totalRatings,
        String mostPlayedSport,
        int gamesThisMonth
) {}
