package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
    
    Optional<UserStats> findByUserId(Long userId);
    
    @Query("SELECT us FROM UserStats us WHERE us.totalGamesPlayed >= :minGames ORDER BY us.totalGamesPlayed DESC")
    List<UserStats> findTopPlayersByGamesPlayed(@Param("minGames") Integer minGames);
    
    @Query("SELECT us FROM UserStats us WHERE us.currentStreak >= :minStreak ORDER BY us.currentStreak DESC")
    List<UserStats> findTopPlayersByCurrentStreak(@Param("minStreak") Integer minStreak);
    
    @Query("SELECT us FROM UserStats us WHERE us.longestStreak >= :minStreak ORDER BY us.longestStreak DESC")
    List<UserStats> findTopPlayersByLongestStreak(@Param("minStreak") Integer minStreak);
    
    @Query("SELECT us FROM UserStats us WHERE us.averageRating >= :minRating ORDER BY us.averageRating DESC")
    List<UserStats> findTopPlayersByRating(@Param("minRating") Double minRating);
    
    @Query("SELECT us FROM UserStats us WHERE us.socialScore >= :minScore ORDER BY us.socialScore DESC")
    List<UserStats> findTopPlayersBySocialScore(@Param("minScore") Integer minScore);
    
    @Query("SELECT us FROM UserStats us WHERE us.mostActiveSport = :sport ORDER BY us.totalGamesPlayed DESC")
    List<UserStats> findTopPlayersBySport(@Param("sport") String sport);
    
    @Query("SELECT us FROM UserStats us WHERE us.totalPlayTimeHours >= :minHours ORDER BY us.totalPlayTimeHours DESC")
    List<UserStats> findTopPlayersByPlayTime(@Param("minHours") Double minHours);
    
    @Query("SELECT COUNT(us) FROM UserStats us WHERE us.totalGamesPlayed >= :minGames")
    Long countActivePlayers(@Param("minGames") Integer minGames);
    
    @Query("SELECT AVG(us.averageRating) FROM UserStats us WHERE us.averageRating IS NOT NULL")
    Double getAverageRatingAcrossAllPlayers();
    
    @Query("SELECT AVG(us.totalGamesPlayed) FROM UserStats us")
    Double getAverageGamesPlayedAcrossAllPlayers();
}
