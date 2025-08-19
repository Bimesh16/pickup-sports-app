package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatMessage;
import com.bmessi.pickupsportsapp.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // ✅ infinite scroll "older" (<= before), DB order DESC
    List<ChatMessage> findByGameAndSentAtLessThanEqualOrderBySentAtDesc(
            Game game, Instant before, Pageable pageable
    );

    // ✅ Latest N for a room (DB order DESC). Use when opening the room.
    List<ChatMessage> findByGame_IdOrderBySentAtDesc(
            Long gameId, Pageable pageable
    );

    // ✅ Reconnect/missed messages after a point (server returns ASC for natural reading)
    List<ChatMessage> findByGame_IdAndSentAtAfterOrderBySentAtAsc(
            Long gameId, Instant after, Pageable pageable
    );

    // (Optional mirror of your existing method, if you ever want id-based “older” lookups)
    List<ChatMessage> findByGame_IdAndSentAtBeforeOrderBySentAtDesc(
            Long gameId, Instant before, Pageable pageable
    );
}
