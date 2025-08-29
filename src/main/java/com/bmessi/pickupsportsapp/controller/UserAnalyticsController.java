package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.service.UserStatsService;
import com.bmessi.pickupsportsapp.service.AchievementService;
import com.bmessi.pickupsportsapp.service.dashboard.UserDashboardService;
import com.bmessi.pickupsportsapp.service.dashboard.GameHistoryAnalyticsService;
import com.bmessi.pickupsportsapp.service.dashboard.PerformanceTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserAnalyticsController {
    
    private final UserStatsService userStatsService;
    private final AchievementService achievementService;
    private final UserDashboardService dashboardService;
    private final GameHistoryAnalyticsService historyAnalyticsService;
    private final PerformanceTrackingService performanceTrackingService;
    
    /**
     * Get user statistics
     * GET /api/v1/users/{username}/stats
     */
    @GetMapping("/{username}/stats")
    public ResponseEntity<UserStats> getUserStats(@PathVariable String username, Authentication authentication) {
        // TODO: Get user ID from username
        Long userId = 1L; // Placeholder
        
        UserStats stats = userStatsService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get user game history
     * GET /api/v1/users/{username}/game-history
     */
    @GetMapping("/{username}/game-history")
    public ResponseEntity<List<Object>> getUserGameHistory(@PathVariable String username, Authentication authentication) {
        // TODO: Implement game history retrieval
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Get user achievements
     * GET /api/v1/users/{username}/achievements
     */
    @GetMapping("/{username}/achievements")
    public ResponseEntity<AchievementService.AchievementProgress> getUserAchievements(@PathVariable String username, Authentication authentication) {
        // TODO: Get user ID from username
        Long userId = 1L; // Placeholder
        
        var progress = achievementService.getAchievementProgress(userId);
        return ResponseEntity.ok(progress);
    }
    
    /**
     * Get user social connections
     * GET /api/v1/users/{username}/social-connections
     */
    @GetMapping("/{username}/social-connections")
    public ResponseEntity<List<Object>> getUserSocialConnections(@PathVariable String username, Authentication authentication) {
        // TODO: Implement social connections retrieval
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Get user preferences
     * GET /api/v1/users/{username}/preferences
     */
    @GetMapping("/{username}/preferences")
    public ResponseEntity<Object> getUserPreferences(@PathVariable String username, Authentication authentication) {
        // TODO: Implement preferences retrieval
        return ResponseEntity.ok(new Object());
    }
    
    /**
     * Get leaderboard statistics
     * GET /api/v1/users/leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<UserStatsService.LeaderboardStats> getLeaderboard() {
        var leaderboard = userStatsService.getLeaderboardStats();
        return ResponseEntity.ok(leaderboard);
    }
    
    /**
     * Get user ranking
     * GET /api/v1/users/{username}/ranking
     */
    @GetMapping("/{username}/ranking")
    public ResponseEntity<UserStatsService.UserRanking> getUserRanking(@PathVariable String username, Authentication authentication) {
        // TODO: Get user ID from username
        Long userId = 1L; // Placeholder
        
        var ranking = userStatsService.getUserRanking(userId);
        return ResponseEntity.ok(ranking);
    }
    
    /**
     * Get top players by games played
     * GET /api/v1/users/leaderboard/games-played
     */
    @GetMapping("/leaderboard/games-played")
    public ResponseEntity<List<UserStats>> getTopPlayersByGamesPlayed(@RequestParam(defaultValue = "10") int limit) {
        var topPlayers = userStatsService.getTopPlayersByGamesPlayed(limit);
        return ResponseEntity.ok(topPlayers);
    }
    
    /**
     * Get top players by streak
     * GET /api/v1/users/leaderboard/streak
     */
    @GetMapping("/leaderboard/streak")
    public ResponseEntity<List<UserStats>> getTopPlayersByStreak(@RequestParam(defaultValue = "10") int limit) {
        var topPlayers = userStatsService.getTopPlayersByStreak(limit);
        return ResponseEntity.ok(topPlayers);
    }
    
    /**
     * Get top players by rating
     * GET /api/v1/users/leaderboard/rating
     */
    @GetMapping("/leaderboard/rating")
    public ResponseEntity<List<UserStats>> getTopPlayersByRating(@RequestParam(defaultValue = "10") int limit) {
        var topPlayers = userStatsService.getTopPlayersByRating(limit);
        return ResponseEntity.ok(topPlayers);
    }
    
    /**
     * Get top players by social score
     * GET /api/v1/users/leaderboard/social-score
     */
    @GetMapping("/leaderboard/social-score")
    public ResponseEntity<List<UserStats>> getTopPlayersBySocialScore(@RequestParam(defaultValue = "10") int limit) {
        var topPlayers = userStatsService.getTopPlayersBySocialScore(limit);
        return ResponseEntity.ok(topPlayers);
    }
    
    /**
     * Get achievement rarity statistics
     * GET /api/v1/users/achievements/rarity-stats
     */
    @GetMapping("/achievements/rarity-stats")
    public ResponseEntity<AchievementService.AchievementRarityStats> getAchievementRarityStats() {
        var rarityStats = achievementService.getAchievementRarityStats();
        return ResponseEntity.ok(rarityStats);
    }
    
    /**
     * Get featured achievements
     * GET /api/v1/users/achievements/featured
     */
    @GetMapping("/achievements/featured")
    public ResponseEntity<List<Object>> getFeaturedAchievements() {
        var featured = achievementService.getFeaturedAchievements();
        return ResponseEntity.ok(List.copyOf(featured));
    }
    
    /**
     * Get achievements by category
     * GET /api/v1/users/achievements/category/{category}
     */
    @GetMapping("/achievements/category/{category}")
    public ResponseEntity<List<Object>> getAchievementsByCategory(@PathVariable String category) {
        try {
            var categoryEnum = com.bmessi.pickupsportsapp.entity.Achievement.AchievementCategory.valueOf(category.toUpperCase());
            var achievements = achievementService.getAchievementsByCategory(categoryEnum);
            return ResponseEntity.ok(List.copyOf(achievements));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
