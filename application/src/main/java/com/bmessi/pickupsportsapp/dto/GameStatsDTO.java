package com.bmessi.pickupsportsapp.dto;

import java.util.Map;

public record GameStatsDTO(
        long totalGames,
        long upcomingGames,
        long completedGames,
        Map<String, Long> gamesBySport,
        Map<String, Long> gamesBySkillLevel,
        double averageParticipants
) {}