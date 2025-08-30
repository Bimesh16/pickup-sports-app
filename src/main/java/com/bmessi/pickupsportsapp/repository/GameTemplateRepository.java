package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.game.GameTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for GameTemplate entity.
 * 
 * <p>Provides data access methods for game templates including:</p>
 * <ul>
 *   <li>Template lookup by sport and format</li>
 *   <li>Popular template ranking by usage</li>
 *   <li>Active template filtering</li>
 *   <li>Template search and discovery</li>
 * </ul>
 */
@Repository
public interface GameTemplateRepository extends JpaRepository<GameTemplate, Long> {

    /**
     * Find all active templates for a specific sport.
     */
    List<GameTemplate> findBySportIgnoreCaseAndIsActiveTrue(String sport);

    /**
     * Find template by ID if active.
     */
    Optional<GameTemplate> findByIdAndIsActiveTrue(Long id);

    /**
     * Find templates by sport and format.
     */
    List<GameTemplate> findBySportIgnoreCaseAndFormatIgnoreCaseAndIsActiveTrue(String sport, String format);

    /**
     * Find most popular active templates.
     */
    @Query("SELECT gt FROM GameTemplate gt WHERE gt.isActive = true ORDER BY gt.popularity DESC")
    List<GameTemplate> findTopByIsActiveTrueOrderByPopularityDesc(@Param("limit") int limit);

    /**
     * Find active templates ordered by popularity and name.
     */
    List<GameTemplate> findByIsActiveTrueOrderByPopularityDescNameAsc();

    /**
     * Find templates suitable for a given player count.
     */
    List<GameTemplate> findBySportIgnoreCaseAndIsActiveTrueAndMinPlayersLessThanEqualAndMaxPlayersGreaterThanEqual(
            String sport, int minPlayers, int maxPlayers);

    /**
     * Find templates by format (5v5, 7v7, etc.).
     */
    List<GameTemplate> findByFormatIgnoreCaseAndIsActiveTrue(String format);

    /**
     * Search templates by name or description.
     */
    @Query("SELECT gt FROM GameTemplate gt WHERE gt.isActive = true AND " +
           "(LOWER(gt.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(gt.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<GameTemplate> searchTemplates(@Param("searchTerm") String searchTerm);

    /**
     * Get template usage statistics.
     */
    @Query("SELECT gt.sport, COUNT(g) as usageCount FROM GameTemplate gt " +
           "LEFT JOIN Game g ON g.gameTemplate = gt " +
           "WHERE gt.isActive = true GROUP BY gt.sport ORDER BY usageCount DESC")
    List<Object[]> getTemplateUsageStatistics();

    /**
     * Find templates created by specific user.
     */
    List<GameTemplate> findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(String createdBy);

    /**
     * Count active templates by sport.
     */
    @Query("SELECT COUNT(gt) FROM GameTemplate gt WHERE gt.sport = :sport AND gt.isActive = true")
    long countActiveBySport(@Param("sport") String sport);
}