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
}
