package com.bmessi.pickupsportsapp.dto;

import java.util.List;
import java.util.Map;

public record UserStatsDTO(
        Long userId,
        String username,
        int gamesCreated,
        int gamesParticipated,
        double averageRating,
        int totalRatings,
        Map<String, Integer> sportCounts,
        String mostPlayedSport,
        List<Integer> recentWeeklyAttendance,
        int[][] weekdayTimeHeatmap,
        int streakWeeks,
        double fairPlayScore,
        Map<String, Integer> previousSportCounts
) {}
