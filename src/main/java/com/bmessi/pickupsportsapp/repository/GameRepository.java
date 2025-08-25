
package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.game.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
            """,
            nativeQuery = true
    )
    Page<Game> search(
            @Param("sport") String sport,
            @Param("location") String location,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            @Param("skillLevel") String skillLevel,
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

    /**
     * Find games within a radius using PostGIS, ordered by distance.
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
              and g.geom is not null
              and ST_DWithin(
                    g.geom,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radiusKm * 1000
                )
            order by ST_Distance(g.geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)
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
              and ST_DWithin(
                    g.geom,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radiusKm * 1000
                )
            """,
            nativeQuery = true
    )
    Page<Game> findByLocationWithinRadius(
            @Param("sport") String sport,
            @Param("location") String location,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            @Param("skillLevel") String skillLevel,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm,
            Pageable pageable
    );

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
}