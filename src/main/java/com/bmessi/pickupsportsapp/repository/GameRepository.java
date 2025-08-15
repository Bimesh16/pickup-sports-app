package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;
import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;

public interface GameRepository extends JpaRepository<Game, Long>, JpaSpecificationExecutor<Game> {

    @EntityGraph(attributePaths = {"user"})
    Page<Game> findBySportIgnoreCase(String sport, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<Game> findByUser_Id(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<Game> findByTimeGreaterThanEqualOrderByTimeAsc(OffsetDateTime from, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query(value = """
           SELECT g
             FROM Game g
            WHERE (:sport IS NULL OR LOWER(g.sport) = LOWER(:sport))
              AND (:location IS NULL OR LOWER(g.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:fromTime IS NULL OR g.time >= :fromTime)
              AND (:toTime   IS NULL OR g.time <= :toTime)
        """,
            countQuery = """
           SELECT COUNT(g)
             FROM Game g
            WHERE (:sport IS NULL OR LOWER(g.sport) = LOWER(:sport))
              AND (:location IS NULL OR LOWER(g.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:fromTime IS NULL OR g.time >= :fromTime)
              AND (:toTime   IS NULL OR g.time <= :toTime)
        """)
    Page<Game> search(String sport, String location, OffsetDateTime fromTime, OffsetDateTime toTime, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "participants"})
    Optional<Game> findWithParticipantsById(Long id);

    @Query("""
        SELECT CASE WHEN COUNT(g) > 0 THEN true ELSE false END
          FROM Game g
          JOIN g.participants p
         WHERE g.id = :gameId
           AND p.id = :userId
    """)
    boolean existsParticipant(Long gameId, Long userId);

    @Query("SELECT DISTINCT g.sport FROM Game g")
    Set<String> findDistinctSports();

    @Lock(LockModeType.OPTIMISTIC)
    Optional<Game> findWithOptimisticLockById(Long id);

    @Transactional(readOnly = true)
    @QueryHints({
            @QueryHint(name = HINT_READ_ONLY, value = "true"),
            // Optional: tune fetch size for large streams (driver-dependent)
            @QueryHint(name = HINT_FETCH_SIZE, value = "1000")
    })
    Stream<Game> streamByTimeBetween(OffsetDateTime from, OffsetDateTime to);
}