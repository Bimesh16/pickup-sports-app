package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserStats;
import com.bmessi.pickupsportsapp.model.SkillLevel;
import com.bmessi.pickupsportsapp.repository.UserStatsRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserStatsService {
    
    private final UserStatsRepository userStatsRepository;
    private final UserRepository userRepository;
    
    /**
     * Get or create user stats for a user
     */
    public UserStats getUserStats(Long userId) {
        return userStatsRepository.findByUserId(userId)
                .orElseGet(() -> createInitialUserStats(userId));
    }
    
    /**
     * Create initial user stats for a new user
     */
    private UserStats createInitialUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        UserStats stats = new UserStats();
        stats.setUser(user);
        
        return userStatsRepository.save(stats);
    }
    
    /**
     * Update user stats when a game is completed
     */
    public void updateStatsAfterGame(Long userId, Long gameId, boolean won, double playTimeHours) {
        UserStats stats = getUserStats(userId);
        
        // Update game counts
        stats.incrementGamesPlayed();
        if (won) {
            stats.incrementGamesWon();
        }
        
        // Update streak
        stats.updateStreak(won);
        
        // Update play time
        stats.addPlayTime(playTimeHours);
        
        // Update last game date
        stats.setLastGameDate(LocalDateTime.now());
        
        // Update most active sport (if available)
        updateMostActiveSport(stats, gameId);
        
        userStatsRepository.save(stats);
        log.info("Updated stats for user {}: games played={}, streak={}, play time={}h", 
                userId, stats.getTotalGamesPlayed(), stats.getCurrentStreak(), stats.getTotalPlayTimeHours());
    }
    
    /**
     * Update user stats when a game is created
     */
    public void updateStatsAfterGameCreation(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.incrementGamesCreated();
        userStatsRepository.save(stats);
        log.info("Updated stats for user {}: games created={}", userId, stats.getTotalGamesCreated());
    }
    
    /**
     * Update user rating
     */
    public void updateUserRating(Long userId, double newRating) {
        UserStats stats = getUserStats(userId);
        stats.updateAverageRating(newRating);
        userStatsRepository.save(stats);
        log.info("Updated rating for user {}: new average={}", userId, stats.getAverageRating());
    }
    
    /**
     * Update social score
     */
    public void updateSocialScore(Long userId, int scoreChange) {
        UserStats stats = getUserStats(userId);
        stats.setSocialScore(stats.getSocialScore() + scoreChange);
        userStatsRepository.save(stats);
        log.info("Updated social score for user {}: new score={}", userId, stats.getSocialScore());
    }
    
    /**
     * Update skill level progression
     */
    public void updateSkillLevelProgression(Long userId, String sport, double newRating) {
        UserStats stats = getUserStats(userId);
        
        // Simple skill level progression logic
        if (newRating >= 4.5) {
            stats.setSkillLevelProgression(SkillLevel.ADVANCED);
        } else if (newRating >= 3.5) {
            stats.setSkillLevelProgression(SkillLevel.INTERMEDIATE);
        } else {
            stats.setSkillLevelProgression(SkillLevel.BEGINNER);
        }
        
        userStatsRepository.save(stats);
        log.info("Updated skill level for user {}: new level={}", userId, stats.getSkillLevelProgression());
    }
    
    /**
     * Get top players by various metrics
     */
    public List<UserStats> getTopPlayersByGamesPlayed(int limit) {
        return userStatsRepository.findTopPlayersByGamesPlayed(1)
                .stream()
                .limit(limit)
                .toList();
    }
    
    public List<UserStats> getTopPlayersByStreak(int limit) {
        return userStatsRepository.findTopPlayersByCurrentStreak(1)
                .stream()
                .limit(limit)
                .toList();
    }
    
    public List<UserStats> getTopPlayersByRating(int limit) {
        return userStatsRepository.findTopPlayersByRating(3.0)
                .stream()
                .limit(limit)
                .toList();
    }
    
    public List<UserStats> getTopPlayersBySocialScore(int limit) {
        return userStatsRepository.findTopPlayersBySocialScore(50)
                .stream()
                .limit(limit)
                .toList();
    }
    
    /**
     * Get leaderboard statistics
     */
    public LeaderboardStats getLeaderboardStats() {
        return LeaderboardStats.builder()
                .totalActivePlayers(userStatsRepository.countActivePlayers(1))
                .averageRating(userStatsRepository.getAverageRatingAcrossAllPlayers())
                .averageGamesPlayed(userStatsRepository.getAverageGamesPlayedAcrossAllPlayers())
                .topPlayersByGames(getTopPlayersByGamesPlayed(10))
                .topPlayersByStreak(getTopPlayersByStreak(10))
                .topPlayersByRating(getTopPlayersByRating(10))
                .build();
    }
    
    /**
     * Update most active sport based on recent games
     */
    private void updateMostActiveSport(UserStats stats, Long gameId) {
        // This would typically query recent games to determine most active sport
        // For now, we'll leave it as a placeholder
        log.debug("Updating most active sport for user {}", stats.getUser().getId());
    }
    
    /**
     * Calculate user's ranking in various categories
     */
    public UserRanking getUserRanking(Long userId) {
        UserStats userStats = getUserStats(userId);
        
        return UserRanking.builder()
                .userId(userId)
                .gamesPlayedRank(getRankByGamesPlayed(userStats.getTotalGamesPlayed()))
                .streakRank(getRankByStreak(userStats.getCurrentStreak()))
                .ratingRank(getRankByRating(userStats.getAverageRating()))
                .socialScoreRank(getRankBySocialScore(userStats.getSocialScore()))
                .build();
    }
    
    private int getRankByGamesPlayed(int gamesPlayed) {
        if (gamesPlayed == 0) return 0;
        List<UserStats> allStats = userStatsRepository.findAll();
        return (int) allStats.stream()
                .filter(stats -> stats.getTotalGamesPlayed() > gamesPlayed)
                .count() + 1;
    }
    
    private int getRankByStreak(int streak) {
        if (streak == 0) return 0;
        List<UserStats> allStats = userStatsRepository.findAll();
        return (int) allStats.stream()
                .filter(stats -> stats.getCurrentStreak() > streak)
                .count() + 1;
    }
    
    private int getRankByRating(Double rating) {
        if (rating == null || rating == 0) return 0;
        List<UserStats> allStats = userStatsRepository.findAll();
        return (int) allStats.stream()
                .filter(stats -> stats.getAverageRating() != null && stats.getAverageRating() > rating)
                .count() + 1;
    }
    
    private int getRankBySocialScore(int socialScore) {
        if (socialScore == 0) return 0;
        List<UserStats> allStats = userStatsRepository.findAll();
        return (int) allStats.stream()
                .filter(stats -> stats.getSocialScore() > socialScore)
                .count() + 1;
    }
    
    // DTOs for API responses
    @lombok.Data
    @lombok.Builder
    public static class LeaderboardStats {
        private Long totalActivePlayers;
        private Double averageRating;
        private Double averageGamesPlayed;
        private List<UserStats> topPlayersByGames;
        private List<UserStats> topPlayersByStreak;
        private List<UserStats> topPlayersByRating;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class UserRanking {
        private Long userId;
        private int gamesPlayedRank;
        private int streakRank;
        private int ratingRank;
        private int socialScoreRank;
    }
}
