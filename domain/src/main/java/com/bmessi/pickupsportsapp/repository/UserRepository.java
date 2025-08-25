package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.transaction.annotation.Transactional;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;
import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    User findByUsername(String username);
    Optional<User> findOptionalByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) IN :usernames")
    Page<User> findByUsernamesIgnoreCase(@Param("usernames") Set<String> usernames, Pageable pageable);

    Page<User> findByPreferredSportIgnoreCase(String preferredSport, Pageable pageable);
    Page<User> findByLocationContainingIgnoreCase(String locationPart, Pageable pageable);

    @Query("""
        SELECT u
          FROM User u
         WHERE (:preferredSport IS NULL OR LOWER(u.preferredSport) = LOWER(:preferredSport))
           AND (:location      IS NULL OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))
           AND (:usernamePart  IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :usernamePart, '%')))
    """)
    Page<User> search(String preferredSport, String location, String usernamePart, Pageable pageable);

    Page<Summary> findByUsernameStartingWithIgnoreCase(String prefix, Pageable pageable);

    Slice<User> findByIdLessThanOrderByIdDesc(Long beforeId, Pageable pageable);

    @Query("SELECT DISTINCT u.preferredSport FROM User u WHERE u.preferredSport IS NOT NULL")
    Set<String> findDistinctPreferredSports();

    @Query("SELECT DISTINCT u.location FROM User u WHERE u.location IS NOT NULL")
    Set<String> findDistinctLocations();

    @Lock(LockModeType.OPTIMISTIC)
    Optional<User> findWithOptimisticLockById(Long id);

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

    interface Summary {
        Long getId();
        String getUsername();
        String getPreferredSport();
        String getLocation();
    }

    // NEW: All non-null avatar URLs for cleanup
    @Query("select u.avatarUrl from User u where u.avatarUrl is not null")
    List<String> findAllAvatarUrls();
}