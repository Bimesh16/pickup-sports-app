package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.Venue.VenueStatus;
import com.bmessi.pickupsportsapp.entity.Venue.VenueType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for venue operations.
 */
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    /**
     * Find venues by status.
     */
    List<Venue> findByStatus(VenueStatus status);

    /**
     * Find venues by type.
     */
    List<Venue> findByVenueType(VenueType venueType);

    /**
     * Find venues by city.
     */
    List<Venue> findByCityIgnoreCase(String city);

    /**
     * Find venues by state.
     */
    List<Venue> findByStateIgnoreCase(String state);

    /**
     * Find venues by country.
     */
    List<Venue> findByCountryIgnoreCase(String country);

    /**
     * Find venues that support a specific sport.
     */
    @Query("SELECT DISTINCT v FROM Venue v JOIN v.supportedSports s WHERE s.id = :sportId AND v.status = 'ACTIVE'")
    List<Venue> findBySupportedSportId(@Param("sportId") Long sportId);

    /**
     * Find venues by owner.
     */
    List<Venue> findByOwnerId(Long ownerId);

    /**
     * Find verified venues.
     */
    List<Venue> findByIsVerifiedTrue();

    /**
     * Search venues with filters.
     */
    @Query("SELECT v FROM Venue v WHERE " +
           "(:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:state IS NULL OR LOWER(v.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(:venueType IS NULL OR v.venueType = :venueType) AND " +
           "(:minCapacity IS NULL OR v.maxCapacity >= :minCapacity) AND " +
           "(:maxCapacity IS NULL OR v.minCapacity <= :maxCapacity) AND " +
           "(:sportId IS NULL OR EXISTS (SELECT 1 FROM v.supportedSports s WHERE s.id = :sportId)) AND " +
           "v.status = 'ACTIVE'")
    Page<Venue> searchVenues(
            @Param("city") String city,
            @Param("state") String state,
            @Param("venueType") VenueType venueType,
            @Param("minCapacity") Integer minCapacity,
            @Param("maxCapacity") Integer maxCapacity,
            @Param("sportId") Long sportId,
            Pageable pageable
    );

    /**
     * Find venues within a radius of given coordinates.
     */
    @Query(value = "SELECT v.*, " +
           "ST_Distance(ST_MakePoint(v.longitude, v.latitude)::geography, " +
           "ST_MakePoint(:longitude, :latitude)::geography) / 1000 as distance_km " +
           "FROM venues v " +
           "WHERE v.status = 'ACTIVE' " +
           "AND ST_DWithin(ST_MakePoint(v.longitude, v.latitude)::geography, " +
           "ST_MakePoint(:longitude, :latitude)::geography, :radiusKm * 1000) " +
           "ORDER BY distance_km", nativeQuery = true)
    List<Object[]> findVenuesWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm
    );

    /**
     * Find venues available at a specific time.
     */
    @Query("SELECT DISTINCT v FROM Venue v " +
           "JOIN v.businessHours bh " +
           "WHERE bh.dayOfWeek = :dayOfWeek " +
           "AND bh.isClosed = false " +
           "AND bh.openTime <= :time " +
           "AND bh.closeTime > :time " +
           "AND v.status = 'ACTIVE'")
    List<Venue> findAvailableVenuesAtTime(
            @Param("dayOfWeek") java.time.DayOfWeek dayOfWeek,
            @Param("time") LocalTime time
    );

    /**
     * Find venues by price range.
     */
    @Query("SELECT v FROM Venue v WHERE " +
           "(:minPrice IS NULL OR v.basePricePerHour >= :minPrice) AND " +
           "(:maxPrice IS NULL OR v.basePricePerHour <= :maxPrice) AND " +
           "v.status = 'ACTIVE'")
    Page<Venue> findByPriceRange(
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable
    );

    /**
     * Find venues with specific amenities.
     */
    @Query("SELECT DISTINCT v FROM Venue v " +
           "JOIN v.amenities a " +
           "WHERE a.name IN :amenityNames " +
           "AND a.isAvailable = true " +
           "AND v.status = 'ACTIVE'")
    List<Venue> findByAmenities(@Param("amenityNames") Set<String> amenityNames);

    /**
     * Check if venue name is unique in a city.
     */
    @Query("SELECT COUNT(v) > 0 FROM Venue v WHERE v.name = :name AND v.city = :city AND v.id != :excludeId")
    boolean existsByNameAndCity(@Param("name") String name, @Param("city") String city, @Param("excludeId") Long excludeId);

    /**
     * Find venues by multiple sport IDs.
     */
    @Query("SELECT DISTINCT v FROM Venue v " +
           "JOIN v.supportedSports s " +
           "WHERE s.id IN :sportIds " +
           "AND v.status = 'ACTIVE' " +
           "GROUP BY v " +
           "HAVING COUNT(DISTINCT s.id) = :sportCount")
    List<Venue> findByMultipleSports(
            @Param("sportIds") Set<Long> sportIds,
            @Param("sportCount") Long sportCount
    );
}
