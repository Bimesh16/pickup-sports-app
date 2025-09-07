package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    
    @Query("""
        SELECT DISTINCT c FROM ChatConversation c 
        JOIN c.participants p 
        WHERE p.user.username = :username 
        AND c.isActive = true 
        ORDER BY c.updatedAt DESC
        """)
    Page<ChatConversation> findByParticipantUsername(@Param("username") String username, Pageable pageable);
    
    @Query("""
        SELECT c FROM ChatConversation c 
        WHERE c.game.id = :gameId 
        AND c.isActive = true
        """)
    Optional<ChatConversation> findByGameId(@Param("gameId") Long gameId);
    
    @Query("""
        SELECT c FROM ChatConversation c 
        WHERE c.type = 'DIRECT' 
        AND c.isActive = true
        AND EXISTS (SELECT 1 FROM c.participants p1 WHERE p1.user.username = :user1)
        AND EXISTS (SELECT 1 FROM c.participants p2 WHERE p2.user.username = :user2)
        """)
    Optional<ChatConversation> findDirectConversation(@Param("user1") String user1, @Param("user2") String user2);
}
