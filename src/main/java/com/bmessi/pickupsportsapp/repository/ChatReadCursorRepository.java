package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatReadCursor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatReadCursorRepository extends JpaRepository<ChatReadCursor, Long> {
    Optional<ChatReadCursor> findByUser_IdAndGameId(Long userId, Long gameId);
}
