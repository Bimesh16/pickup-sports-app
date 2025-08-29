package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    List<Achievement> findByIsActiveTrue();
    
    List<Achievement> findByIsFeaturedTrueAndIsActiveTrue();
    
    List<Achievement> findByCategoryAndIsActiveTrue(Achievement.AchievementCategory category);
    
    List<Achievement> findByTypeAndIsActiveTrue(Achievement.AchievementType type);
    
    @Query("SELECT a FROM Achievement a WHERE a.basePoints >= :minPoints AND a.isActive = true ORDER BY a.basePoints DESC")
    List<Achievement> findByMinPoints(@Param("minPoints") Integer minPoints);
    
    @Query("SELECT a FROM Achievement a WHERE a.requirementMetric = :metric AND a.isActive = true ORDER BY a.requirementValue ASC")
    List<Achievement> findByRequirementMetric(@Param("metric") String metric);
    
    @Query("SELECT COUNT(a) FROM Achievement a WHERE a.isActive = true")
    Long countActiveAchievements();
    
    @Query("SELECT COUNT(a) FROM Achievement a WHERE a.category = :category AND a.isActive = true")
    Long countByCategory(@Param("category") Achievement.AchievementCategory category);
}
