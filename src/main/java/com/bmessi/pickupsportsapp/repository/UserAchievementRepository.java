package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    
    List<UserAchievement> findByUserId(Long userId);
    
    List<UserAchievement> findByUserIdAndStatus(Long userId, UserAchievement.AchievementStatus status);
    
    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, Long achievementId);
    
    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);
    
    List<UserAchievement> findByUserIdAndIsFeaturedTrue(Long userId);
    
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user.id = :userId AND ua.earnedAt >= :since ORDER BY ua.earnedAt DESC")
    List<UserAchievement> findRecentAchievements(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user.id = :userId AND ua.achievement.category = :category ORDER BY ua.earnedAt DESC")
    List<UserAchievement> findByUserIdAndCategory(@Param("userId") Long userId, @Param("category") String category);
    
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.user.id = :userId AND ua.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") UserAchievement.AchievementStatus status);
    
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user.id = :userId ORDER BY ua.pointsEarned DESC")
    List<UserAchievement> findByUserIdOrderByPointsDesc(Long userId);
    
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user.id = :userId AND ua.achievement.type = :type ORDER BY ua.earnedAt DESC")
    List<UserAchievement> findByUserIdAndAchievementType(@Param("userId") Long userId, @Param("type") String type);
    
    /**
     * Find completed achievements for a user ordered by completion date.
     */
    List<UserAchievement> findByUserIdAndIsCompletedTrueOrderByCompletedAtDesc(Long userId);
    
    /**
     * Get top users by total achievement points.
     */
    @Query("SELECT u.username, SUM(ua.pointsEarned) FROM UserAchievement ua JOIN ua.user u WHERE ua.isCompleted = true GROUP BY u.id, u.username ORDER BY SUM(ua.pointsEarned) DESC")
    List<Object[]> findTopUsersByTotalPoints();
    
    /**
     * Get top users by achievement count.
     */
    @Query("SELECT u.username, COUNT(ua) FROM UserAchievement ua JOIN ua.user u WHERE ua.isCompleted = true GROUP BY u.id, u.username ORDER BY COUNT(ua) DESC")
    List<Object[]> findTopUsersByAchievementCount();
    
    /**
     * Find recent achievement earners.
     */
    @Query("SELECT u.username, a.name, ua.completedAt, ua.pointsEarned FROM UserAchievement ua JOIN ua.user u JOIN ua.achievement a WHERE ua.isCompleted = true AND ua.completedAt >= :since ORDER BY ua.completedAt DESC")
    List<Object[]> findRecentAchievementEarners(@Param("since") LocalDateTime since);
    
    /**
     * Find recent achievement earners (last 7 days).
     */
    @Query("SELECT u.username, a.name, ua.completedAt, ua.pointsEarned FROM UserAchievement ua JOIN ua.user u JOIN ua.achievement a WHERE ua.isCompleted = true AND ua.completedAt >= CURRENT_TIMESTAMP - 7 ORDER BY ua.completedAt DESC")
    List<Object[]> findRecentAchievementEarners();
}
