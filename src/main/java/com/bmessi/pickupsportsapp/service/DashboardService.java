package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.GameParticipant;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.GameParticipantRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameParticipantRepository gameParticipantRepository;

    public DashboardSummary getDashboardSummary(String userId) {
        User user = userRepository.findByUsername(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Get user statistics
        UserStats userStats = calculateUserStats(userId);

        // Get upcoming games
        List<GameSummary> upcomingGames = getUpcomingGames(userId);

        // Get recent activity
        List<ActivityItem> recentActivity = getRecentActivity(userId);

        // Get achievements
        List<Achievement> achievements = getAchievements(userId);

        // Get recommendations
        List<Recommendation> recommendations = getRecommendations(userId);

        return DashboardSummary.builder()
            .userStats(userStats)
            .upcomingGames(upcomingGames)
            .recentActivity(recentActivity)
            .achievements(achievements)
            .recommendations(recommendations)
            .build();
    }

    private UserStats calculateUserStats(String userId) {
        // Get all games where user participated
        List<GameParticipant> participations = gameParticipantRepository.findByUserId(userId);
        
        int totalGamesPlayed = participations.size();
        int totalGamesWon = (int) participations.stream()
            .filter(p -> p.getStatus() == GameParticipant.ParticipantStatus.CONFIRMED)
            .filter(p -> p.getGame().getStatus() == com.bmessi.pickupsportsapp.entity.game.Game.GameStatus.COMPLETED)
            .filter(p -> isWinner(p))
            .count();
        
        int totalGamesLost = (int) participations.stream()
            .filter(p -> p.getStatus() == GameParticipant.ParticipantStatus.CONFIRMED)
            .filter(p -> p.getGame().getStatus() == com.bmessi.pickupsportsapp.entity.game.Game.GameStatus.COMPLETED)
            .filter(p -> !isWinner(p))
            .count();
        
        int totalGamesDrawn = totalGamesPlayed - totalGamesWon - totalGamesLost;
        
        double winRate = totalGamesPlayed > 0 ? (double) totalGamesWon / totalGamesPlayed * 100 : 0.0;
        
        // Calculate current streak
        int currentStreak = calculateCurrentStreak(userId);
        
        // Calculate longest streak
        int longestStreak = calculateLongestStreak(userId);
        
        // Calculate average rating
        double averageRating = participations.stream()
            .filter(p -> p.getRating() != null)
            .mapToDouble(GameParticipant::getRating)
            .average()
            .orElse(0.0);
        
        // Calculate total hours (assuming 90 minutes per game)
        double totalHours = totalGamesPlayed * 1.5;
        
        // Get favorite sport
        String favoriteSport = getFavoriteSport(userId);

        return UserStats.builder()
            .totalGamesPlayed(totalGamesPlayed)
            .totalGamesWon(totalGamesWon)
            .totalGamesLost(totalGamesLost)
            .totalGamesDrawn(totalGamesDrawn)
            .currentStreak(currentStreak)
            .longestStreak(longestStreak)
            .winRate(winRate)
            .averageRating(averageRating)
            .totalHours(totalHours)
            .favoriteSport(favoriteSport)
            .build();
    }

    private boolean isWinner(GameParticipant participant) {
        // This is a simplified logic - in reality, you'd need to check game results
        // For now, we'll use a random approach based on participant ID
        return participant.getId().hashCode() % 2 == 0;
    }

    private int calculateCurrentStreak(String userId) {
        // Simplified current streak calculation
        // In reality, you'd need to check recent game results
        return 3; // Mock value
    }

    private int calculateLongestStreak(String userId) {
        // Simplified longest streak calculation
        // In reality, you'd need to analyze all game results
        return 7; // Mock value
    }

    private String getFavoriteSport(String userId) {
        // Get most played sport
        Map<Object, Long> sportCounts = gameParticipantRepository.findByUserId(userId)
            .stream()
            .collect(Collectors.groupingBy(
                p -> p.getGame().getSport(),
                Collectors.counting()
            ));
        
        return sportCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(entry -> entry.getKey().toString())
            .orElse("FUTSAL");
    }

    private List<GameSummary> getUpcomingGames(String userId) {
        LocalDateTime now = LocalDateTime.now();
        
        return gameRepository.findUpcomingGamesByUserId(userId, now)
            .stream()
            .map(this::convertToGameSummary)
            .collect(Collectors.toList());
    }

    private List<ActivityItem> getRecentActivity(String userId) {
        // Get recent game participations and convert to activity items
        return gameParticipantRepository.findByUserId(userId)
            .stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(10)
            .map(this::convertToActivityItem)
            .collect(Collectors.toList());
    }

    private List<Achievement> getAchievements(String userId) {
        // Mock achievements - in reality, you'd have an achievement system
        return Arrays.asList(
            Achievement.builder()
                .id("first_game")
                .title("First Game")
                .description("Played your first game")
                .unlocked(true)
                .date("2024-01-01")
                .build(),
            Achievement.builder()
                .id("win_streak")
                .title("Win Streak")
                .description("Won 5 games in a row")
                .unlocked(true)
                .date("2024-01-10")
                .build(),
            Achievement.builder()
                .id("social_player")
                .title("Social Player")
                .description("Played with 20 different players")
                .unlocked(false)
                .progress(15)
                .build()
        );
    }

    private List<Recommendation> getRecommendations(String userId) {
        // Mock recommendations - in reality, you'd have an AI recommendation system
        return Arrays.asList(
            Recommendation.builder()
                .type("game")
                .title("Recommended: Evening Cricket")
                .reason("Based on your location and skill level")
                .build(),
            Recommendation.builder()
                .type("player")
                .title("Connect with John Doe")
                .reason("Similar playing style and schedule")
                .build(),
            Recommendation.builder()
                .type("venue")
                .title("Try Pokhara Sports Complex")
                .reason("Great facilities for your favorite sports")
                .build()
        );
    }

    private GameSummary convertToGameSummary(Game game) {
        return GameSummary.builder()
            .id(game.getId().toString())
            .title(game.getDescription() != null ? game.getDescription() : "Game")
            .sport(game.getSport())
            .dateTime(game.getTime().toString())
            .location(game.getLocation())
            .currentPlayers(0) // TODO: Calculate from participants
            .maxPlayers(game.getMaxPlayers() != null ? game.getMaxPlayers() : 10)
            .cost(game.getTotalCost() != null ? game.getTotalCost().doubleValue() : 0.0)
            .skillLevel(game.getSkillLevel() != null ? game.getSkillLevel() : "BEGINNER")
            .status(game.getStatus().toString())
            .build();
    }

    private ActivityItem convertToActivityItem(GameParticipant participant) {
        String message = "Joined " + (participant.getGame().getDescription() != null ? participant.getGame().getDescription() : "Game");
        String date = participant.getCreatedAt().toLocalDate().toString();
        
        return ActivityItem.builder()
            .type("game_joined")
            .message(message)
            .date(date)
            .build();
    }

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class DashboardSummary {
        private UserStats userStats;
        private List<GameSummary> upcomingGames;
        private List<ActivityItem> recentActivity;
        private List<Achievement> achievements;
        private List<Recommendation> recommendations;
    }

    @lombok.Data
    @lombok.Builder
    public static class UserStats {
        private int totalGamesPlayed;
        private int totalGamesWon;
        private int totalGamesLost;
        private int totalGamesDrawn;
        private int currentStreak;
        private int longestStreak;
        private double winRate;
        private double averageRating;
        private double totalHours;
        private String favoriteSport;
    }

    @lombok.Data
    @lombok.Builder
    public static class GameSummary {
        private String id;
        private String title;
        private String sport;
        private String dateTime;
        private String location;
        private int currentPlayers;
        private int maxPlayers;
        private double cost;
        private String skillLevel;
        private String status;
    }

    @lombok.Data
    @lombok.Builder
    public static class ActivityItem {
        private String type;
        private String message;
        private String date;
    }

    @lombok.Data
    @lombok.Builder
    public static class Achievement {
        private String id;
        private String title;
        private String description;
        private boolean unlocked;
        private String date;
        private Integer progress;
    }

    @lombok.Data
    @lombok.Builder
    public static class Recommendation {
        private String type;
        private String title;
        private String reason;
    }
}
