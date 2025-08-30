package com.bmessi.pickupsportsapp.repository.nepal;

import com.bmessi.pickupsportsapp.entity.nepal.HostVenuePartnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Host-Venue Partnership management operations.
 * 
 * <p>This repository manages the business relationships between City Champions
 * and venue owners, supporting revenue sharing and partnership analytics.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Repository
public interface HostVenuePartnershipRepository extends JpaRepository<HostVenuePartnership, Long> {
    
    /**
     * Find partnership by host and venue.
     */
    Optional<HostVenuePartnership> findByCityHostIdAndVenueId(Long cityHostId, Long venueId);
    
    /**
     * Check if partnership exists between host and venue.
     */
    boolean existsByCityHostIdAndVenueId(Long cityHostId, Long venueId);
    
    /**
     * Find all partnerships for a host.
     */
    List<HostVenuePartnership> findByCityHostId(Long cityHostId);
    
    /**
     * Find all partnerships for a venue.
     */
    List<HostVenuePartnership> findByVenueId(Long venueId);
    
    /**
     * Find partnerships by status.
     */
    List<HostVenuePartnership> findByStatus(HostVenuePartnership.PartnershipStatus status);
    
    /**
     * Find active partnerships for a host.
     */
    List<HostVenuePartnership> findByCityHostIdAndStatus(Long cityHostId, HostVenuePartnership.PartnershipStatus status);
    
    /**
     * Find active partnerships for a venue.
     */
    List<HostVenuePartnership> findByVenueIdAndStatus(Long venueId, HostVenuePartnership.PartnershipStatus status);
    
    /**
     * Find partnerships expiring soon.
     */
    @Query("SELECT hvp FROM HostVenuePartnership hvp WHERE hvp.status = 'ACTIVE' AND hvp.partnershipEndDate BETWEEN :now AND :futureDate ORDER BY hvp.partnershipEndDate")
    List<HostVenuePartnership> findPartnershipsExpiringSoon(@Param("now") OffsetDateTime now, @Param("futureDate") OffsetDateTime futureDate);
    
    /**
     * Find top performing partnerships by revenue.
     */
    @Query("SELECT hvp FROM HostVenuePartnership hvp WHERE hvp.status = 'ACTIVE' ORDER BY hvp.totalRevenueGenerated DESC")
    List<HostVenuePartnership> findTopPerformingPartnerships();
    
    /**
     * Find partnerships with high ratings.
     */
    @Query("SELECT hvp FROM HostVenuePartnership hvp WHERE hvp.status = 'ACTIVE' AND hvp.venueRating >= :minRating AND hvp.hostRating >= :minRating ORDER BY (hvp.venueRating + hvp.hostRating) DESC")
    List<HostVenuePartnership> findHighRatedPartnerships(@Param("minRating") BigDecimal minRating);
    
    /**
     * Calculate total revenue for a host across all partnerships.
     */
    @Query("SELECT COALESCE(SUM(hvp.totalRevenueGenerated), 0) FROM HostVenuePartnership hvp WHERE hvp.cityHost.id = :hostId")
    BigDecimal sumRevenueByHostId(@Param("hostId") Long hostId);
    
    /**
     * Calculate total commission for a host across all partnerships.
     */
    @Query("SELECT COALESCE(SUM(hvp.hostCommissionEarned), 0) FROM HostVenuePartnership hvp WHERE hvp.cityHost.id = :hostId")
    BigDecimal sumCommissionByHostId(@Param("hostId") Long hostId);
    
    /**
     * Count active partnerships for a host.
     */
    @Query("SELECT COUNT(hvp) FROM HostVenuePartnership hvp WHERE hvp.cityHost.id = :hostId AND hvp.status = 'ACTIVE'")
    Long countActivePartnershipsByHost(@Param("hostId") Long hostId);
    
    /**
     * Count active partnerships for a venue.
     */
    @Query("SELECT COUNT(hvp) FROM HostVenuePartnership hvp WHERE hvp.venue.id = :venueId AND hvp.status = 'ACTIVE'")
    Long countActivePartnershipsByVenue(@Param("venueId") Long venueId);
    
    /**
     * Find partnerships needing renewal (ending within specified days).
     */
    @Query("SELECT hvp FROM HostVenuePartnership hvp WHERE hvp.status = 'ACTIVE' AND hvp.partnershipEndDate IS NOT NULL AND hvp.partnershipEndDate <= :renewalDate ORDER BY hvp.partnershipEndDate")
    List<HostVenuePartnership> findPartnershipsNeedingRenewal(@Param("renewalDate") OffsetDateTime renewalDate);
    
    /**
     * Get partnership performance metrics by city.
     */
    @Query("SELECT ch.city, COUNT(hvp), AVG(hvp.venueRating), AVG(hvp.hostRating), SUM(hvp.totalRevenueGenerated) FROM HostVenuePartnership hvp JOIN hvp.cityHost ch WHERE hvp.status = 'ACTIVE' GROUP BY ch.city ORDER BY SUM(hvp.totalRevenueGenerated) DESC")
    List<Object[]> getPartnershipMetricsByCity();
    
    /**
     * Find partnerships with low performance (need attention).
     */
    @Query("SELECT hvp FROM HostVenuePartnership hvp WHERE hvp.status = 'ACTIVE' AND ((hvp.venueRating IS NOT NULL AND hvp.venueRating < :minRating) OR (hvp.hostRating IS NOT NULL AND hvp.hostRating < :minRating) OR hvp.totalGamesManaged < :minGames)")
    List<HostVenuePartnership> findUnderperformingPartnerships(@Param("minRating") BigDecimal minRating, @Param("minGames") Integer minGames);
}