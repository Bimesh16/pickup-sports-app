package com.bmessi.pickupsportsapp.dto;

import java.util.Map;

public record UserStatsDTO(
        Long userId,
        String username,
        int gamesCreated,
        int gamesParticipated,
        double averageRating,
        int totalRatings,
        Map<String, Integer> sportCounts,
        String mostPlayedSport
) {}