package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatMessage;
import com.bmessi.pickupsportsapp.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // infinite scroll "older" (<= before), DB order DESC
    List<ChatMessage> findByGameAndSentAtLessThanEqualOrderBySentAtDesc(
            Game game, Instant before, Pageable pageable
    );

    // latest N for a room (DB order DESC)
    List<ChatMessage> findByGame_IdOrderBySentAtDesc(Long gameId, Pageable pageable);

    // reconnect/missed after a point (ASC)
    List<ChatMessage> findByGame_IdAndSentAtAfterOrderBySentAtAsc(Long gameId, Instant after, Pageable pageable);

    // optional id-based older
    List<ChatMessage> findByGame_IdAndSentAtBeforeOrderBySentAtDesc(Long gameId, Instant before, Pageable pageable);

    // idempotency by (game_id, client_id)
    Optional<ChatMessage> findByGame_IdAndClientId(Long gameId, String clientId);
    Optional<ChatMessage> findByGameAndClientId(Game game, String clientId);

    // retention cleanup
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    int deleteBySentAtBefore(Instant cutoff);

    // unread count
    long countByGame_IdAndSentAtAfter(Long gameId, Instant after);
}
