package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.controller.StatsController.DashboardStatsDTO;
import com.bmessi.pickupsportsapp.dto.GameStatsDTO;
import com.bmessi.pickupsportsapp.dto.UserStatsDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.PlayerRatingRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final PlayerRatingRepository ratingRepository;

    @Timed(value = "stats.games.overview", description = "Time to compute game overview stats")
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "stats", key = "'game:' + #sport + ':' + #fromDate + ':' + #toDate")
    public GameStatsDTO getGameStats(String sport, LocalDate fromDate, LocalDate toDate) {
        long totalGames = gameRepository.count();
        long upcomingGames = gameRepository.countUpcoming(Instant.now());
        long completedGames = totalGames - upcomingGames;

        Map<String, Long> gamesBySport = gameRepository.countBySport().stream()
                .collect(Collectors.toMap(GameRepository.SportCount::getSport, GameRepository.SportCount::getCount));

        Map<String, Long> gamesBySkillLevel = gameRepository.countBySkillLevel().stream()
                .collect(Collectors.toMap(GameRepository.SkillLevelCount::getSkillLevel, GameRepository.SkillLevelCount::getCount));

        Double avgParticipants = gameRepository.averageParticipants();
        double averageParticipants = avgParticipants != null ? avgParticipants : 0.0;

        return new GameStatsDTO(
                totalGames,
                upcomingGames,
                completedGames,
                gamesBySport,
                gamesBySkillLevel,
                averageParticipants
        );
    }

    @Timed(value = "stats.users.me", description = "Time to compute stats for current user")
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "stats", key = "'user:' + #username")
    public UserStatsDTO getUserStats(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new UserStatsDTO(null, username, 0, 0, 0.0, 0, Map.of(), "",
                    java.util.Collections.emptyList(), new int[0][0], 0, 0.0, Map.of());
        }
        return getUserStats(user.getId());
    }

    @Timed(value = "stats.users.byId", description = "Time to compute stats for a user by id")
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "stats", key = "'userId:' + #userId")
    public UserStatsDTO getUserStats(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new UserStatsDTO(userId, "", 0, 0, 0.0, 0, Map.of(), "",
                    java.util.Collections.emptyList(), new int[0][0], 0, 0.0, Map.of());
        }

        Instant now = Instant.now();
        int gamesCreated = (int) gameRepository.countByUserId(userId);
        int gamesParticipated = (int) gameRepository.countParticipatedByUser(userId, now);

        PlayerRatingRepository.RatingAggregate ratingAgg = ratingRepository.aggregateForRated(userId);
        double avgRating = ratingAgg != null && ratingAgg.getAverage() != null ? ratingAgg.getAverage() : 0.0;
        int totalRatings = ratingAgg != null && ratingAgg.getCount() != null ? ratingAgg.getCount() : 0;

        Map<String, Integer> sportCounts = gameRepository.countParticipatedByUserBySport(userId, now).stream()
                .collect(Collectors.toMap(GameRepository.SportCount::getSport, sc -> sc.getCount().intValue()));

        String mostPlayedSport = sportCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("");

        // Build simple placeholders for UI extensions
        java.util.List<Integer> recentWeeklyAttendance = java.util.stream.IntStream.range(0, 12)
                .map(i -> (int) Math.max(0, Math.round(3 + 2*Math.sin(i/2.0))))
                .boxed().toList();
        int[][] weekdayTime = new int[7][6]; // Mon..Sun × 6 slots
        // distribute gamesParticipated roughly across a few cells
        int seed = Math.max(1, gamesParticipated);
        for (int k = 0; k < Math.min(seed, 20); k++) {
            int r = (k + user.getId().intValue()) % 7; int c = (k*2 + user.getId().intValue()) % 6; weekdayTime[r][c] += 1;
        }
        int streakWeeks = Math.min(12, (int)Math.ceil(gamesParticipated / 2.0));
        Double fairPlay = user.getRatingAverage() != null && user.getRatingAverage() > 0 ? Math.min(5.0, user.getRatingAverage()+0.2) : 4.8;
        Map<String,Integer> prevSportCounts = java.util.Collections.emptyMap();

        return new UserStatsDTO(
                userId,
                user.getUsername(),
                gamesCreated,
                gamesParticipated,
                avgRating,
                totalRatings,
                sportCounts,
                mostPlayedSport,
                recentWeeklyAttendance,
                weekdayTime,
                streakWeeks,
                fairPlay,
                prevSportCounts
        );
    }

    @Timed(value = "stats.dashboard", description = "Time to compute dashboard stats for current user")
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "stats", key = "'dashboard:' + #username")
    public DashboardStatsDTO getDashboardStats(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new DashboardStatsDTO(0, 0, 0.0, 0, "", 0);
        }

        UserStatsDTO userStats = getUserStats(user.getId());

        Instant now = Instant.now();
        int upcomingGames = (int) gameRepository.countUpcomingByUser(user.getId(), now);

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant monthStart = today.withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant nextMonthStart = today.plusMonths(1).withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        int gamesThisMonth = (int) gameRepository.countParticipatedByUserBetween(user.getId(), monthStart, nextMonthStart);

        return new DashboardStatsDTO(
                userStats.gamesParticipated(),
                upcomingGames,
                userStats.averageRating(),
                userStats.totalRatings(),
                userStats.mostPlayedSport(),
                gamesThisMonth
        );
    }
}
