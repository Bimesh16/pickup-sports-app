package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.controller.StatsController.DashboardStatsDTO;
import com.bmessi.pickupsportsapp.dto.GameStatsDTO;
import com.bmessi.pickupsportsapp.dto.UserStatsDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.PlayerRatingRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final PlayerRatingRepository ratingRepository;

    @Transactional(readOnly = true)
    public GameStatsDTO getGameStats(String sport, LocalDate fromDate, LocalDate toDate) {
        // Simplified version - you can enhance these with custom queries later
        long totalGames = gameRepository.count();
        long upcomingGames = gameRepository.findAll().stream()
                .filter(g -> g.getTime() != null && g.getTime().isAfter(Instant.now()))
                .count();
        long completedGames = totalGames - upcomingGames;

        // Simplified - return empty maps for now
        Map<String, Long> gamesBySport = Map.of();
        Map<String, Long> gamesBySkillLevel = Map.of();
        double averageParticipants = 0.0;

        return new GameStatsDTO(
                totalGames,
                upcomingGames,
                completedGames,
                gamesBySport,
                gamesBySkillLevel,
                averageParticipants
        );
    }

    @Transactional(readOnly = true)
    public UserStatsDTO getUserStats(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new UserStatsDTO(null, username, 0, 0, 0.0, 0, Map.of(), "");
        }
        return getUserStats(user.getId());
    }

    @Transactional(readOnly = true)
    public UserStatsDTO getUserStats(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new UserStatsDTO(userId, "", 0, 0, 0.0, 0, Map.of(), "");
        }

        // Use existing methods only
        int gamesCreated = (int) gameRepository.findByUser_Id(userId, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        int gamesParticipated = 0; // Simplified for now

        Double avgRating = ratingRepository.computeAverageForRated(userId);
        Integer totalRatings = ratingRepository.computeCountForRated(userId);

        // Simplified - return empty map for now
        Map<String, Integer> sportCounts = Map.of();
        String mostPlayedSport = "";

        return new UserStatsDTO(
                userId,
                user.getUsername(),
                gamesCreated,
                gamesParticipated,
                avgRating != null ? avgRating : 0.0,
                totalRatings != null ? totalRatings : 0,
                sportCounts,
                mostPlayedSport
        );
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new DashboardStatsDTO(0, 0, 0.0, 0, "", 0);
        }

        UserStatsDTO userStats = getUserStats(user.getId());

        // Simplified calculations
        int upcomingGames = (int) gameRepository.findAll().stream()
                .filter(g -> g.getUser().getId().equals(user.getId()) &&
                        g.getTime() != null && g.getTime().isAfter(Instant.now()))
                .count();
        int gamesThisMonth = 0; // Simplified for now

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