package com.bmessi.pickupsportsapp.repository.ai;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.ai.GameRecommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for game recommendation entities.
 */
@Repository
public interface GameRecommendationRepository extends JpaRepository<GameRecommendation, Long> {

    /**
     * Find recommendations by user and status, ordered by score.
     * Use Pageable to limit results.
     */
    List<GameRecommendation> findByUserAndStatusOrderByRecommendationScoreDesc(
            User user, GameRecommendation.RecommendationStatus status, Pageable pageable);

    /**
     * Find recommendations by user.
     */
    List<GameRecommendation> findByUser(User user);

    /**
     * Find recommendations by status.
     */
    List<GameRecommendation> findByStatus(GameRecommendation.RecommendationStatus status);

    /**
     * Count recommendations by status.
     */
    long countByStatus(GameRecommendation.RecommendationStatus status);

    /**
     * Find high-score recommendations.
     */
    @Query("SELECT gr FROM GameRecommendation gr WHERE gr.recommendationScore >= :minScore ORDER BY gr.recommendationScore DESC")
    List<GameRecommendation> findHighScoreRecommendations(@Param("minScore") Double minScore);

    /**
     * Find recommendations by user with pagination.
     */
    @Query("SELECT gr FROM GameRecommendation gr WHERE gr.user = :user ORDER BY gr.recommendationScore DESC")
    List<GameRecommendation> findByUserWithPagination(@Param("user") User user, Pageable pageable);

    /**
     * Find active recommendations for a specific game.
     */
    @Query("SELECT gr FROM GameRecommendation gr WHERE gr.recommendedGame.id = :gameId AND gr.status = com.bmessi.pickupsportsapp.entity.ai.GameRecommendation$RecommendationStatus.ACTIVE")
    List<GameRecommendation> findActiveRecommendationsForGame(@Param("gameId") Long gameId);
}
