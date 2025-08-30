package com.bmessi.pickupsportsapp.repository.nepal;

import com.bmessi.pickupsportsapp.entity.nepal.CityHost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for City Host management operations.
 * 
 * <p>This repository provides all the database operations needed for the Nepal expansion
 * strategy, including host discovery, performance tracking, and regional management.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Repository
public interface CityHostRepository extends JpaRepository<CityHost, Long> {
    
    /**
     * Find city host by user ID.
     */
    Optional<CityHost> findByUserId(Long userId);
    
    /**
     * Check if user is already a host.
     */
    boolean existsByUserId(Long userId);
    
    /**
     * Find hosts by status.
     */
    List<CityHost> findByStatus(CityHost.HostStatus status);
    
    /**
     * Find active hosts in a specific city.
     */
    List<CityHost> findByCityAndStatus(String city, CityHost.HostStatus status);
    
    /**
     * Find hosts by level.
     */
    List<CityHost> findByHostLevel(Integer hostLevel);
    
    /**
     * Find top performing hosts by performance score.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.performanceScore >= :minScore AND ch.status = 'ACTIVE' ORDER BY ch.performanceScore DESC")
    List<CityHost> findTopPerformers(@Param("minScore") BigDecimal minScore);
    
    /**
     * Find hosts with high game management count.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.totalGamesManaged >= :minGames AND ch.status = 'ACTIVE' ORDER BY ch.totalGamesManaged DESC")
    List<CityHost> findHighVolumeHosts(@Param("minGames") Integer minGames);
    
    /**
     * Find hosts in need of training.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.trainingCompleted = false AND ch.status IN ('PENDING_VERIFICATION', 'TRAINING')")
    List<CityHost> findHostsNeedingTraining();
    
    /**
     * Find hosts by region (province).
     */
    List<CityHost> findByProvinceAndStatus(String province, CityHost.HostStatus status);
    
    /**
     * Find hosts with recent activity.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.lastActivity >= :since AND ch.status = 'ACTIVE' ORDER BY ch.lastActivity DESC")
    List<CityHost> findRecentlyActiveHosts(@Param("since") OffsetDateTime since);
    
    /**
     * Find hosts eligible for level promotion.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.hostLevel < 5 AND ch.totalGamesManaged >= :minGames AND ch.totalRevenueGenerated >= :minRevenue AND ch.status = 'ACTIVE'")
    List<CityHost> findHostsEligibleForPromotion(@Param("minGames") Integer minGames, @Param("minRevenue") BigDecimal minRevenue);
    
    /**
     * Find hosts by performance score range.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.performanceScore BETWEEN :minScore AND :maxScore AND ch.status = 'ACTIVE' ORDER BY ch.performanceScore DESC")
    List<CityHost> findHostsByPerformanceRange(@Param("minScore") BigDecimal minScore, @Param("maxScore") BigDecimal maxScore);
    
    /**
     * Get city statistics for hosts.
     */
    @Query("SELECT ch.city, COUNT(ch), AVG(ch.performanceScore), SUM(ch.totalRevenueGenerated) FROM CityHost ch WHERE ch.status = 'ACTIVE' GROUP BY ch.city ORDER BY COUNT(ch) DESC")
    List<Object[]> getCityHostStatistics();
    
    /**
     * Find hosts with free games remaining.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.freeGamesRemaining > 0 AND ch.status = 'ACTIVE' ORDER BY ch.freeGamesRemaining DESC")
    List<CityHost> findHostsWithFreeGames();
    
    /**
     * Find hosts by commission rate range.
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.commissionRate BETWEEN :minRate AND :maxRate AND ch.status = 'ACTIVE' ORDER BY ch.commissionRate DESC")
    List<CityHost> findHostsByCommissionRange(@Param("minRate") BigDecimal minRate, @Param("maxRate") BigDecimal maxRate);
    
    /**
     * Count active hosts in a city.
     */
    @Query("SELECT COUNT(ch) FROM CityHost ch WHERE ch.city = :city AND ch.status = 'ACTIVE'")
    Long countActiveHostsInCity(@Param("city") String city);
    
    /**
     * Find hosts needing performance review (inactive for 30+ days).
     */
    @Query("SELECT ch FROM CityHost ch WHERE ch.status = 'ACTIVE' AND (ch.lastActivity IS NULL OR ch.lastActivity < :cutoffDate)")
    List<CityHost> findHostsNeedingReview(@Param("cutoffDate") OffsetDateTime cutoffDate);
}