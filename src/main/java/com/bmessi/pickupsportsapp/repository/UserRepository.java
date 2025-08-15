package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.*;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;
import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    // Keep existing API for compatibility
    User findByUsername(String username);

    // Safer optional variant for new code paths
    Optional<User> findOptionalByUsername(String username);

    // Fast checks and case-insensitive lookup
    boolean existsByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);

    // Collections and pagination helpers
    @Query("SELECT u FROM User u WHERE LOWER(u.username) IN :usernames")
    Page<User> findByUsernamesIgnoreCase(Collection<String> usernames, Pageable pageable);

    // Search helpers (adjust fields to your entity as needed)
    Page<User> findByPreferredSportIgnoreCase(String preferredSport, Pageable pageable);
    Page<User> findByLocationContainingIgnoreCase(String locationPart, Pageable pageable);

    // Combined search with optional filters
    @Query("""
        SELECT u
          FROM User u
         WHERE (:preferredSport IS NULL OR LOWER(u.preferredSport) = LOWER(:preferredSport))
           AND (:location      IS NULL OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))
           AND (:usernamePart  IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :usernamePart, '%')))
    """)
    Page<User> search(String preferredSport, String location, String usernamePart, Pageable pageable);

    // Lightweight projection for list views
    Page<Summary> findByUsernameStartingWithIgnoreCase(String prefix, Pageable pageable);

    // Keyset-like pagination option (descending by id)
    Slice<User> findByIdLessThanOrderByIdDesc(Long beforeId, Pageable pageable);

    // Distinct facets for filters
    @Query("SELECT DISTINCT u.preferredSport FROM User u WHERE u.preferredSport IS NOT NULL")
    Set<String> findDistinctPreferredSports();

    @Query("SELECT DISTINCT u.location FROM User u WHERE u.location IS NOT NULL")
    Set<String> findDistinctLocations();

    // Optimistic lock accessor for safe concurrent edits
    @Lock(LockModeType.OPTIMISTIC)
    Optional<User> findWithOptimisticLockById(Long id);

    // Read-only streaming for batch jobs/exports (close the Stream in caller)
    @Transactional(readOnly = true)
    @QueryHints({
            @QueryHint(name = HINT_READ_ONLY, value = "true"),
            @QueryHint(name = HINT_FETCH_SIZE, value = "1000")
    })
    Stream<User> streamAllBy();

    @Transactional(readOnly = true)
    @QueryHints({
            @QueryHint(name = HINT_READ_ONLY, value = "true"),
            @QueryHint(name = HINT_FETCH_SIZE, value = "1000")
    })
    Stream<User> streamByPreferredSportIgnoreCase(String preferredSport);

    // Projection for efficient user list responses
    interface Summary {
        Long getId();
        String getUsername();
        String getPreferredSport();
        String getLocation();
    }
}