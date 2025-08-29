package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.GameParticipation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameParticipationRepository extends JpaRepository<GameParticipation, Long> {
    
    /**
     * Find all participations for a user, ordered by creation date descending.
     */
    Page<GameParticipation> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find all participations for a user as a list.
     */
    List<GameParticipation> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find recent participations for a user after a specific date.
     */
    List<GameParticipation> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);
    
    /**
     * Find recent participations for a user after a specific date, ordered by creation date descending.
     */
    List<GameParticipation> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(Long userId, LocalDateTime after);
    
    /**
     * Find participation for a specific user and game.
     */
    Optional<GameParticipation> findByUserIdAndGameId(Long userId, Long gameId);
    
    /**
     * Find all participations for a specific game.
     */
    List<GameParticipation> findByGameId(Long gameId);
    
    /**
     * Count total participations for a user.
     */
    long countByUserId(Long userId);
    
    /**
     * Count wins for a user.
     */
    @Query("SELECT COUNT(gp) FROM GameParticipation gp WHERE gp.user.id = :userId AND gp.gameResult = 'WIN'")
    long countWinsByUserId(@Param("userId") Long userId);
    
    /**
     * Count participations by sport for a user.
     */
    @Query("SELECT g.sport, COUNT(gp) FROM GameParticipation gp JOIN gp.game g WHERE gp.user.id = :userId GROUP BY g.sport")
    List<Object[]> countParticipationsBySportForUser(@Param("userId") Long userId);
    
    /**
     * Find participations with performance ratings for a user.
     */
    @Query("SELECT gp FROM GameParticipation gp WHERE gp.user.id = :userId AND gp.performanceRating IS NOT NULL ORDER BY gp.createdAt DESC")
    List<GameParticipation> findByUserIdWithPerformanceRating(@Param("userId") Long userId);
    
    /**
     * Get average performance rating for a user.
     */
    @Query("SELECT AVG(gp.performanceRating) FROM GameParticipation gp WHERE gp.user.id = :userId AND gp.performanceRating IS NOT NULL")
    Optional<Double> getAveragePerformanceRatingByUserId(@Param("userId") Long userId);
    
    /**
     * Get average sportsmanship rating for a user.
     */
    @Query("SELECT AVG(gp.sportsmanshipRating) FROM GameParticipation gp WHERE gp.user.id = :userId AND gp.sportsmanshipRating IS NOT NULL")
    Optional<Double> getAverageSportsmanshipRatingByUserId(@Param("userId") Long userId);
    
    /**
     * Find participations where user was present.
     */
    List<GameParticipation> findByUserIdAndWasPresentTrue(Long userId);
    
    /**
     * Find participations by participation type.
     */
    List<GameParticipation> findByUserIdAndParticipationType(Long userId, GameParticipation.ParticipationType type);
    
    /**
     * Find recent participations with specific game results.
     */
    @Query("SELECT gp FROM GameParticipation gp WHERE gp.user.id = :userId AND gp.gameResult = :result AND gp.createdAt >= :since ORDER BY gp.createdAt DESC")
    List<GameParticipation> findByUserIdAndGameResultAndCreatedAtAfter(@Param("userId") Long userId, 
                                                                       @Param("result") GameParticipation.GameResult result,
                                                                       @Param("since") LocalDateTime since);
    
    /**
     * Find users who played with a specific user (co-participation).
     */
    @Query("SELECT DISTINCT gp2.user.username FROM GameParticipation gp1 " +
           "JOIN GameParticipation gp2 ON gp1.game.id = gp2.game.id " +
           "WHERE gp1.user.id = :userId AND gp2.user.id != :userId " +
           "ORDER BY gp2.createdAt DESC")
    List<String> findCoParticipantUsernames(@Param("userId") Long userId);
    
    /**
     * Get participation statistics for a user by sport.
     */
    @Query("SELECT g.sport, " +
           "COUNT(gp), " +
           "SUM(CASE WHEN gp.gameResult = 'WIN' THEN 1 ELSE 0 END), " +
           "AVG(gp.performanceRating), " +
           "AVG(gp.sportsmanshipRating) " +
           "FROM GameParticipation gp JOIN gp.game g " +
           "WHERE gp.user.id = :userId " +
           "GROUP BY g.sport")
    List<Object[]> getParticipationStatsBySport(@Param("userId") Long userId);
    
    /**
     * Find most active sport for a user.
     */
    @Query("SELECT g.sport FROM GameParticipation gp JOIN gp.game g " +
           "WHERE gp.user.id = :userId " +
           "GROUP BY g.sport " +
           "ORDER BY COUNT(gp) DESC")
    List<String> findMostActiveSportForUser(@Param("userId") Long userId);
    
    /**
     * Find recent performance trend for a user.
     */
    @Query("SELECT gp.createdAt, gp.performanceRating, g.sport FROM GameParticipation gp JOIN gp.game g " +
           "WHERE gp.user.id = :userId AND gp.performanceRating IS NOT NULL AND gp.createdAt >= :since " +
           "ORDER BY gp.createdAt ASC")
    List<Object[]> findPerformanceTrendForUser(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    /**
     * Count total play time hours for a user (estimated).
     */
    @Query("SELECT SUM(CASE WHEN g.durationMinutes IS NOT NULL THEN g.durationMinutes ELSE 120 END) / 60.0 " +
           "FROM GameParticipation gp JOIN gp.game g " +
           "WHERE gp.user.id = :userId AND gp.wasPresent = true")
    Optional<Double> getTotalPlayTimeHoursForUser(@Param("userId") Long userId);
}
