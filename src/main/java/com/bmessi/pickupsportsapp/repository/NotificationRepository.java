package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.notification.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.*;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;
import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;

public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    @EntityGraph(attributePaths = "user")
    Page<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Notification> findByUser_IdAndReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Slice<Notification> findByUser_IdAndIdLessThanOrderByIdDesc(Long userId, Long beforeId, Pageable pageable);

    long countByUser_IdAndReadFalse(Long userId);
    long countByUser_Id(Long userId);

    Page<Notification> findByUser_IdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, Instant from, Instant to, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Notification n
           SET n.read = true,
               n.readAt = :readTime
         WHERE n.user.id = :userId
           AND n.read = false
    """)
    int markAllAsRead(Long userId, Instant readTime);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Notification n
           SET n.read = true,
               n.readAt = :readTime
         WHERE n.user.id = :userId
           AND n.id IN :ids
           AND n.read = false
    """)
    int markAsRead(Long userId, Collection<Long> ids, Instant readTime);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId AND n.read = true")
    int deleteReadByUser(Long userId);

    Page<Summary> findByUser_IdOrderByIdDesc(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT n.message FROM Notification n WHERE n.user.id = :userId")
    Set<String> findDistinctMessagesByUser(Long userId);

    @Lock(LockModeType.OPTIMISTIC)
    Optional<Notification> findWithOptimisticLockById(Long id);

    @Transactional(readOnly = true)
    @QueryHints({
            @QueryHint(name = HINT_READ_ONLY, value = "true"),
            @QueryHint(name = HINT_FETCH_SIZE, value = "1000")
    })
    Stream<Notification> streamByUser_IdAndCreatedAtBetween(Long userId, Instant from, Instant to);

    // Added: enforce ownership for single-id operations
    Optional<Notification> findByIdAndUser_Id(Long id, Long userId);

    @Modifying
    int deleteByIdAndUser_Id(Long id, Long userId);

    // retention cleanup: remove old read notifications
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    int deleteByReadTrueAndCreatedAtBefore(Instant cutoff);

    interface Summary {
        Long getId();
        String getMessage();
        boolean isRead();
        Instant getCreatedAt();
    }
}