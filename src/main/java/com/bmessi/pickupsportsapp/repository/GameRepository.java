package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Game;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface GameRepository extends JpaRepository<Game, Long>, JpaSpecificationExecutor<Game> {

    // Native query:
    // - Explicit casts for parameters (avoid untyped NULL errors)
    // - Case-insensitive matching for sport and skillLevel (ILIKE)
    // - btrim + nullif to ignore accidental spaces and empty strings
    // - location remains ILIKE with column cast to handle bytea/text mismatch
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
    Page<Game> search(@Param("sport") String sport,
                      @Param("location") String location,
                      @Param("fromTime") OffsetDateTime fromTime,
                      @Param("toTime") OffsetDateTime toTime,
                      @Param("skillLevel") String skillLevel,
                      Pageable pageable);

    @Query("select distinct g.sport from Game g")
    Set<String> findDistinctSports();

    @EntityGraph(attributePaths = {"participants", "user"})
    @Query("select g from Game g where g.id = :id")
    Optional<Game> findWithParticipantsById(@Param("id") Long id);

    Page<Game> findByUser_Id(Long userId, Pageable pageable);

    @Query(value = "select exists(select 1 from game_participants gp where gp.game_id = :gameId and gp.user_id = :userId)", nativeQuery = true)
    boolean existsParticipant(@Param("gameId") Long gameId, @Param("userId") Long userId);
}