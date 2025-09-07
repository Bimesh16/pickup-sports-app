package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.GameParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameParticipantRepository extends JpaRepository<GameParticipant, Long> {
    
    List<GameParticipant> findByUserId(String userId);
    
    @Query("SELECT p FROM GameParticipant p WHERE p.game.id = :gameId")
    List<GameParticipant> findByGameId(@Param("gameId") Long gameId);
    
    @Query("SELECT p FROM GameParticipant p WHERE p.userId = :userId AND p.status = :status")
    List<GameParticipant> findByUserIdAndStatus(@Param("userId") String userId, 
                                               @Param("status") GameParticipant.ParticipantStatus status);
}
