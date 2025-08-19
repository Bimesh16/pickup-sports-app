package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatMessage;
import com.bmessi.pickupsportsapp.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByGameAndSentAtLessThanEqualOrderBySentAtDesc(
            Game game, Instant before, Pageable pageable
    );
}
