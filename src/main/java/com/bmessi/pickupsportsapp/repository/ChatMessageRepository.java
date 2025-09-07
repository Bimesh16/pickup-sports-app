package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("""
        SELECT m FROM ChatMessage m 
        WHERE m.conversation.id = :conversationId 
        AND m.isDeleted = false 
        ORDER BY m.createdAt DESC
        """)
    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(
        @Param("conversationId") Long conversationId, 
        Pageable pageable
    );
    
    @Query("""
        SELECT COUNT(m) FROM ChatMessage m 
        WHERE m.conversation.id = :conversationId 
        AND m.isDeleted = false
        """)
    long countByConversationId(@Param("conversationId") Long conversationId);
}