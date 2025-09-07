package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    
    @Query("""
        SELECT p FROM ChatParticipant p 
        WHERE p.conversation.id = :conversationId 
        AND p.isActive = true
        """)
    List<ChatParticipant> findByConversationId(@Param("conversationId") Long conversationId);
    
    @Query("""
        SELECT p FROM ChatParticipant p 
        WHERE p.conversation.id = :conversationId 
        AND p.user.username = :username
        """)
    Optional<ChatParticipant> findByConversationIdAndUsername(
        @Param("conversationId") Long conversationId, 
        @Param("username") String username
    );
    
    @Query("""
        SELECT p FROM ChatParticipant p 
        WHERE p.user.username = :username 
        AND p.isActive = true
        """)
    List<ChatParticipant> findByUsername(@Param("username") String username);
}
