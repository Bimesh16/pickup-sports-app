package com.bmessi.pickupsportsapp.repository.ai;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.ai.VenueRecommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for venue recommendation entities.
 */
@Repository
public interface VenueRecommendationRepository extends JpaRepository<VenueRecommendation, Long> {

    /**
     * Find recommendations by user and status, ordered by score.
     * Use Pageable to limit results.
     */
    List<VenueRecommendation> findByUserAndStatusOrderByRecommendationScoreDesc(
            User user, VenueRecommendation.RecommendationStatus status, Pageable pageable);

    /**
     * Find recommendations by user.
     */
    List<VenueRecommendation> findByUser(User user);

    /**
     * Find recommendations by status.
     */
    List<VenueRecommendation> findByStatus(VenueRecommendation.RecommendationStatus status);

    /**
     * Count recommendations by status.
     */
    long countByStatus(VenueRecommendation.RecommendationStatus status);

    /**
     * Find high-score recommendations.
     */
    @Query("SELECT vr FROM VenueRecommendation vr WHERE vr.recommendationScore >= :minScore ORDER BY vr.recommendationScore DESC")
    List<VenueRecommendation> findHighScoreRecommendations(@Param("minScore") Double minScore);

    /**
     * Find recommendations by user with pagination.
     */
    @Query("SELECT vr FROM VenueRecommendation vr WHERE vr.user = :user ORDER BY vr.recommendationScore DESC")
    List<VenueRecommendation> findByUserWithPagination(@Param("user") User user, Pageable pageable);

    /**
     * Find active recommendations for a specific venue.
     */
    @Query("SELECT vr FROM VenueRecommendation vr WHERE vr.recommendedVenue.id = :venueId AND vr.status = com.bmessi.pickupsportsapp.entity.ai.VenueRecommendation$RecommendationStatus.ACTIVE")
    List<VenueRecommendation> findActiveRecommendationsForVenue(@Param("venueId") Long venueId);
}
