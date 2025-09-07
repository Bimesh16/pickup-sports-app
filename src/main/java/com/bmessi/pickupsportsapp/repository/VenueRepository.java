package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    
    @Query("""
        SELECT v FROM Venue v 
        WHERE v.isActive = true 
        AND (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(v.latitude - :lat) / 2), 2) +
            COS(RADIANS(:lat)) * COS(RADIANS(v.latitude)) * 
            POWER(SIN(RADIANS(v.longitude - :lng) / 2), 2)))) <= :radiusKm
        ORDER BY (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(v.latitude - :lat) / 2), 2) +
            COS(RADIANS(:lat)) * COS(RADIANS(v.latitude)) * 
            POWER(SIN(RADIANS(v.longitude - :lng) / 2), 2))))
        """)
    List<Venue> findNearbyVenues(
        @Param("lat") double latitude, 
        @Param("lng") double longitude, 
        @Param("radiusKm") double radiusKm
    );
    
    @Query("""
        SELECT v FROM Venue v 
        WHERE v.isActive = true 
        AND (LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) 
        OR LOWER(v.address) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY v.rating DESC, v.name
        """)
    Page<Venue> searchVenues(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT v FROM Venue v WHERE v.isActive = true ORDER BY v.rating DESC")
    List<Venue> findTopRatedVenues(Pageable pageable);
}