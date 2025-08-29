package com.bmessi.pickupsportsapp.repository.ai;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.ai.PlayerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for player recommendation entities.
 */
@Repository
public interface PlayerRecommendationRepository extends JpaRepository<PlayerRecommendation, Long> {

    /**
     * Find recommendations by game and requesting player.
     */
    List<PlayerRecommendation> findByGameAndRequestingPlayer(Game game, User requestingPlayer);

    /**
     * Find recommendations by game, requesting player, and status.
     */
    List<PlayerRecommendation> findByGameAndRequestingPlayerAndStatus(
            Game game, User requestingPlayer, PlayerRecommendation.RecommendationStatus status);

    /**
     * Find recommendations by recommended player.
     */
    List<PlayerRecommendation> findByRecommendedPlayer(User recommendedPlayer);

    /**
     * Find active recommendations for a game.
     */
    @Query("SELECT pr FROM PlayerRecommendation pr WHERE pr.game = :game AND pr.status = 'PENDING'")
    List<PlayerRecommendation> findActiveRecommendationsForGame(@Param("game") Game game);

    /**
     * Count recommendations by status.
     */
    long countByStatus(PlayerRecommendation.RecommendationStatus status);

    /**
     * Find recommendations with high scores.
     */
    @Query("SELECT pr FROM PlayerRecommendation pr WHERE pr.recommendationScore >= :minScore ORDER BY pr.recommendationScore DESC")
    List<PlayerRecommendation> findHighScoreRecommendations(@Param("minScore") Double minScore);
}
