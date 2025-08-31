
package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.game.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.dao.DataAccessException;

import java.util.concurrent.atomic.AtomicBoolean;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository for Game entities. Includes search, participant checks,
 * eager loading for "my games", and location-based query.
 */
public interface GameRepository extends JpaRepository<Game, Long>, JpaSpecificationExecutor<Game> {

    /**
     * Complex native search for filtering by sport, location, time range, and skill level.
     */
    @Query(
            value = """
            select g.*
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and ((cast(:lat as double precision) is null or cast(:lng as double precision) is null)
                   or (g.geom is not null and ST_DWithin(
                        g.geom,
                        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                        :radiusKm * 1000
                   )))
            order by g.time
            """,
            countQuery = """
            select count(*)
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and ((cast(:lat as double precision) is null or cast(:lng as double precision) is null)
                   or (g.geom is not null and ST_DWithin(
                        g.geom,
                        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                        :radiusKm * 1000
                   )))
            """,
            nativeQuery = true
    )
    Page<Game> search(
            @Param("sport") String sport,
            @Param("location") String location,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            @Param("skillLevel") String skillLevel,
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") Double radiusKm,
            Pageable pageable
    );

    /**
     * Retrieve all distinct sports for the sports dropdown.
     */
    @Query("select distinct g.sport from Game g")
    Set<String> findDistinctSports();

    /**
     * Fetch a game and its participants eagerly.
     */
    @EntityGraph(attributePaths = {"participants", "user"})
    @Query("select g from Game g where g.id = :id")
    Optional<Game> findWithParticipantsById(@Param("id") Long id);

    /**
     * New method for "my games": fetches participants eagerly to avoid lazy loading errors.
     */
    @EntityGraph(attributePaths = {"participants", "user"})
    @Query("SELECT g FROM Game g WHERE g.user.id = :userId ORDER BY g.time")
    Page<Game> findByUserIdWithParticipants(@Param("userId") Long userId, Pageable pageable);

    /**
     * Check if a user has already RSVPed to a game.
     */
    @Query(value = "select exists(select 1 from game_participants gp where gp.game_id = :gameId and gp.user_id = :userId)", nativeQuery = true)
    boolean existsParticipant(@Param("gameId") Long gameId, @Param("userId") Long userId);

    // Dynamic location query with PostGIS or Haversine fallback
    AtomicBoolean POSTGIS_AVAILABLE = new AtomicBoolean(true);

    @Query(
            value = """
            select g.*
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and g.geom is not null
              and g.geom && ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
              and ST_DWithin(
                    g.geom,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radiusKm * 1000
                )
            order by g.time
            """,
            countQuery = """
            select count(*)
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and g.geom is not null
              and g.geom && ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
              and ST_DWithin(
                    g.geom,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radiusKm * 1000
                )
            """,
            nativeQuery = true
    )
    Page<Game> findByLocationWithinRadiusPostgis(
            @Param("sport") String sport,
            @Param("location") String location,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            @Param("skillLevel") String skillLevel,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng,
            Pageable pageable
    );

    @Query(
            value = """
            select g.*,
                   (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(g.latitude - :lat) / 2), 2) +
                   COS(RADIANS(:lat)) * COS(RADIANS(g.latitude)) * POWER(SIN(RADIANS(g.longitude - :lng) / 2), 2)))) as distance
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and g.latitude between :minLat and :maxLat
              and g.longitude between :minLng and :maxLng
              and (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(g.latitude - :lat) / 2), 2) +
                   COS(RADIANS(:lat)) * COS(RADIANS(g.latitude)) * POWER(SIN(RADIANS(g.longitude - :lng) / 2), 2)))) <= :radiusKm
            order by distance
            """,
            countQuery = """
            select count(*)
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and g.latitude between :minLat and :maxLat
              and g.longitude between :minLng and :maxLng
              and (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(g.latitude - :lat) / 2), 2) +
                   COS(RADIANS(:lat)) * COS(RADIANS(g.latitude)) * POWER(SIN(RADIANS(g.longitude - :lng) / 2), 2)))) <= :radiusKm
            """,
            nativeQuery = true
    )
    Page<Game> findByLocationWithinRadiusHaversine(
            @Param("sport") String sport,
            @Param("location") String location,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            @Param("skillLevel") String skillLevel,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng,
            Pageable pageable
    );

    default Page<Game> findByLocationWithinRadius(
            String sport,
            String location,
            OffsetDateTime fromTime,
            OffsetDateTime toTime,
            String skillLevel,
            double lat,
            double lng,
            double radiusKm,
            Pageable pageable
    ) {
        double latDelta = radiusKm / 111.045d;
        double lngDelta = radiusKm / (111.045d * Math.cos(Math.toRadians(lat)));
        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLng = lng - lngDelta;
        double maxLng = lng + lngDelta;
        if (POSTGIS_AVAILABLE.get()) {
            try {
                return findByLocationWithinRadiusPostgis(sport, location, fromTime, toTime, skillLevel,
                        lat, lng, radiusKm, minLat, maxLat, minLng, maxLng, pageable);
            } catch (DataAccessException e) {
                POSTGIS_AVAILABLE.set(false);
            }
        }
        return findByLocationWithinRadiusHaversine(sport, location, fromTime, toTime, skillLevel,
                lat, lng, radiusKm, minLat, maxLat, minLng, maxLng, pageable);
    }

    /**
     * Cursor-based explore listing with stable ordering by (time, id).
     * Filters are optional; when cursor is provided, returns items strictly after (cursorTime, cursorId).
     */
    @Query(
            value = """
            select g.*
            from game g
            join app_user u on u.id = g.user_id
            where (nullif(btrim(cast(:sport as text)), '') is null or g.sport ILIKE nullif(btrim(cast(:sport as text)), ''))
              and (nullif(btrim(cast(:location as text)), '') is null
                   or cast(g.location as text) ILIKE concat('%%', nullif(btrim(cast(:location as text)), ''), '%%'))
              and (cast(:fromTime as timestamptz) is null or g.time >= cast(:fromTime as timestamptz))
              and (cast(:toTime as timestamptz) is null or g.time <= cast(:toTime as timestamptz))
              and (nullif(btrim(cast(:skillLevel as text)), '') is null or g.skill_level ILIKE nullif(btrim(cast(:skillLevel as text)), ''))
              and (
                    cast(:cursorTime as timestamptz) is null
                    or g.time > cast(:cursorTime as timestamptz)
                    or (g.time = cast(:cursorTime as timestamptz) and g.id > coalesce(:cursorId, 0))
                  )
            order by g.time, g.id
            limit :limit
            """,
            nativeQuery = true
    )
    List<Game> exploreCursor(
            @Param("sport") String sport,
            @Param("location") String location,
            @Param("fromTime") java.time.OffsetDateTime fromTime,
            @Param("toTime") java.time.OffsetDateTime toTime,
            @Param("skillLevel") String skillLevel,
            @Param("cursorTime") java.time.OffsetDateTime cursorTime,
            @Param("cursorId") Long cursorId,
            @Param("limit") int limit
    );

    /**
     * Count games scheduled after the provided instant.
     */
    @Query(value = "select count(*) from game g where g.time > :now", nativeQuery = true)
    long countUpcoming(@Param("now") Instant now);

    /**
     * Count upcoming games created by a specific user.
     */
    @Query(value = "select count(*) from game g where g.user_id = :userId and g.time > :now", nativeQuery = true)
    long countUpcomingByUser(@Param("userId") Long userId, @Param("now") Instant now);

    /**
     * Calculate the average number of participants per game.
     */
    @Query(value = "select coalesce(avg(cnt),0) from (select count(*) as cnt from game_participants group by game_id) gp", nativeQuery = true)
    Double averageParticipants();

    /**
     * Count games grouped by sport.
     */
    @Query("select g.sport as sport, count(g) as count from Game g group by g.sport")
    List<SportCount> countBySport();

    /**
     * Count games grouped by skill level.
     */
    @Query("select g.skillLevel as skillLevel, count(g) as count from Game g group by g.skillLevel")
    List<SkillLevelCount> countBySkillLevel();

    /**
     * Count games created by a user.
     */
    @Query("select count(g) from Game g where g.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Count games a user has participated in (past games only).
     */
    @Query("select count(g) from Game g join g.participants p where p.id = :userId and g.time <= :now")
    long countParticipatedByUser(@Param("userId") Long userId, @Param("now") Instant now);

    /**
     * Count games a user has participated in grouped by sport (past games only).
     */
    @Query("select g.sport as sport, count(g) as count from Game g join g.participants p where p.id = :userId and g.time <= :now group by g.sport")
    List<SportCount> countParticipatedByUserBySport(@Param("userId") Long userId, @Param("now") Instant now);

    /**
     * Count games a user has participated in during a time range.
     */
    @Query("select count(g) from Game g join g.participants p where p.id = :userId and g.time >= :from and g.time < :to")
    long countParticipatedByUserBetween(@Param("userId") Long userId, @Param("from") Instant from, @Param("to") Instant to);

    interface SportCount {
        String getSport();
        Long getCount();
    }

    interface SkillLevelCount {
        String getSkillLevel();
        Long getCount();
    }

    // New methods for game maintenance and business logic

    /**
     * Find active games that might need status updates (completed, etc.)
     */
    @Query("SELECT g FROM Game g WHERE g.status IN ('PUBLISHED', 'FULL') AND g.time <= :cutoffTime")
    List<Game> findActiveGamesNeedingStatusUpdate(@Param("cutoffTime") OffsetDateTime cutoffTime);

    /**
     * Update old completed games to archived status
     */
    @Modifying
    @Query("UPDATE Game g SET g.status = 'ARCHIVED', g.updatedAt = CURRENT_TIMESTAMP WHERE g.status = 'COMPLETED' AND g.updatedAt <= :cutoffDate")
    int updateOldCompletedGamesToArchived(@Param("cutoffDate") OffsetDateTime cutoffDate);

    /**
     * Delete old draft games that were never published
     */
    @Modifying
    @Query("DELETE FROM Game g WHERE g.status = 'DRAFT' AND g.createdAt <= :cutoffDate")
    int deleteOldDraftGames(@Param("cutoffDate") OffsetDateTime cutoffDate);

    /**
     * Find games that need reminder notifications (starting soon)
     */
    @Query("SELECT g FROM Game g WHERE g.status IN ('PUBLISHED', 'FULL') AND g.time BETWEEN :startTime AND :endTime")
    List<Game> findGamesNeedingReminders(@Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);

    /**
     * Find games that might need capacity management (waitlist promotion, etc.)
     */
    @Query("SELECT g FROM Game g WHERE g.status = 'PUBLISHED' AND g.waitlistEnabled = true AND g.capacity IS NOT NULL")
    List<Game> findGamesNeedingCapacityManagement();

    // Additional methods for bulk operations and analytics

    /**
     * Count games by user and status within date range.
     */
    @Query("SELECT COUNT(g) FROM Game g WHERE g.user.id = :userId AND g.status = :status AND g.createdAt BETWEEN :startDate AND :endDate")
    long countByUserIdAndStatusAndCreatedAtBetween(@Param("userId") Long userId, @Param("status") Game.GameStatus status, 
                                                   @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    /**
     * Count games by user within date range.
     */
    @Query("SELECT COUNT(g) FROM Game g WHERE g.user.id = :userId AND g.createdAt BETWEEN :startDate AND :endDate")
    long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    /**
     * Sum total cost for completed games by user within date range.
     */
    @Query("SELECT COALESCE(SUM(g.totalCost), 0) FROM Game g WHERE g.user.id = :userId AND g.status = :status AND g.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumTotalCostByUserIdAndStatusAndCreatedAtBetween(@Param("userId") Long userId, @Param("status") Game.GameStatus status, 
                                                                          @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    /**
     * Sum participants for user's games within date range.
     */
    @Query("SELECT COALESCE(SUM(SIZE(g.participants)), 0) FROM Game g WHERE g.user.id = :userId AND g.createdAt BETWEEN :startDate AND :endDate")
    long sumParticipantsByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    /**
     * Find games by user and status within time range.
     */
    @Query("SELECT g FROM Game g WHERE g.user.id = :userId AND g.status = :status AND g.time BETWEEN :startTime AND :endTime")
    List<Game> findByUserIdAndStatusAndTimeBetween(@Param("userId") Long userId, @Param("status") Game.GameStatus status, 
                                                   @Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);

    /**
     * Find venue conflicts for bulk game creation.
     */
        @Query(
            value = """
                SELECT g.*
                FROM game g
                WHERE g.venue_id = :venueId
                  AND g.status IN ('PUBLISHED', 'FULL')
                  AND (
                        (g.time <= :startTime AND (g.time + make_interval(mins => g.duration_minutes)) > :startTime)
                     OR (g.time < :endTime   AND (g.time + make_interval(mins => g.duration_minutes)) >= :endTime)
                     OR (g.time >= :startTime AND g.time < :endTime)
                  )
                """,
            nativeQuery = true
        )
        List<Game> findByVenueIdAndTimeOverlap(@Param("venueId") Long venueId,
                                               @Param("startTime") OffsetDateTime startTime,
                                           @Param("endTime") OffsetDateTime endTime);
}