package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepository extends JpaRepository<Sport, Long> {

    /**
     * Find all active sports
     */
    List<Sport> findByIsActiveTrue();

    /**
     * Find sport by name (case insensitive)
     */
    Sport findByNameIgnoreCase(String name);

    /**
     * Find sports by category and active status
     */
    List<Sport> findByCategoryAndIsActiveTrue(Sport.SportCategory category);

    /**
     * Find sports by difficulty level and active status
     */
    List<Sport> findByDifficultyLevelAndIsActiveTrue(Sport.DifficultyLevel difficulty);

    /**
     * Find team sports that are active
     */
    List<Sport> findByIsTeamSportTrueAndIsActiveTrue();

    /**
     * Find individual sports that are active
     */
    List<Sport> findByIsTeamSportFalseAndIsActiveTrue();

    /**
     * Find indoor sports that are active
     */
    List<Sport> findByIsIndoorTrueAndIsActiveTrue();

    /**
     * Find outdoor sports that are active
     */
    List<Sport> findByIsOutdoorTrueAndIsActiveTrue();

    /**
     * Find weather-dependent sports that are active
     */
    List<Sport> findByIsWeatherDependentTrueAndIsActiveTrue();

    /**
     * Find sports with popularity score greater than or equal to threshold
     */
    List<Sport> findByPopularityScoreGreaterThanEqualAndIsActiveTrue(Double minScore);

    /**
     * Find sports suitable for specific player count
     */
    @Query("SELECT s FROM Sport s WHERE s.isActive = true AND s.totalPlayersMin <= :playerCount AND s.totalPlayersMax >= :playerCount")
    List<Sport> findByTotalPlayersMinLessThanEqualAndTotalPlayersMaxGreaterThanEqualAndIsActiveTrue(@Param("playerCount") Integer playerCount);

    /**
     * Find sports by duration range
     */
    @Query("SELECT s FROM Sport s WHERE s.isActive = true AND s.durationMinutesMin <= :maxMinutes AND s.durationMinutesMax >= :minMinutes")
    List<Sport> findByDurationMinutesMinLessThanEqualAndDurationMinutesMaxGreaterThanEqualAndIsActiveTrue(@Param("maxMinutes") Integer maxMinutes, @Param("minMinutes") Integer minMinutes);

    /**
     * Search sports by name or description containing query
     */
    @Query("SELECT s FROM Sport s WHERE s.isActive = true AND (LOWER(s.name) LIKE LOWER(:query) OR LOWER(s.description) LIKE LOWER(:query))")
    List<Sport> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsActiveTrue(@Param("query") String query);

    /**
     * Find sports by popularity range
     */
    List<Sport> findByPopularityScoreBetweenAndIsActiveTrue(Double minScore, Double maxScore);

    /**
     * Find sports by multiple categories
     */
    List<Sport> findByCategoryInAndIsActiveTrue(List<Sport.SportCategory> categories);

    /**
     * Find sports by multiple difficulty levels
     */
    List<Sport> findByDifficultyLevelInAndIsActiveTrue(List<Sport.DifficultyLevel> difficulties);

    /**
     * Find sports that can be played both indoors and outdoors
     */
    List<Sport> findByIsIndoorTrueAndIsOutdoorTrueAndIsActiveTrue();

    /**
     * Find sports by minimum team size
     */
    List<Sport> findByTeamSizeMinGreaterThanEqualAndIsActiveTrue(Integer minTeamSize);

    /**
     * Find sports by maximum team size
     */
    List<Sport> findByTeamSizeMaxLessThanEqualAndIsActiveTrue(Integer maxTeamSize);

    /**
     * Find sports by minimum duration
     */
    List<Sport> findByDurationMinutesMinGreaterThanEqualAndIsActiveTrue(Integer minDuration);

    /**
     * Find sports by maximum duration
     */
    List<Sport> findByDurationMinutesMaxLessThanEqualAndIsActiveTrue(Integer maxDuration);

    /**
     * Find sports created after a specific date
     */
    List<Sport> findByCreatedAtAfterAndIsActiveTrue(java.time.OffsetDateTime date);

    /**
     * Find sports updated after a specific date
     */
    List<Sport> findByUpdatedAtAfterAndIsActiveTrue(java.time.OffsetDateTime date);

    /**
     * Count sports by category
     */
    long countByCategoryAndIsActiveTrue(Sport.SportCategory category);

    /**
     * Count sports by difficulty level
     */
    long countByDifficultyLevelAndIsActiveTrue(Sport.DifficultyLevel difficulty);

    /**
     * Count team sports
     */
    long countByIsTeamSportTrueAndIsActiveTrue();

    /**
     * Count individual sports
     */
    long countByIsTeamSportFalseAndIsActiveTrue();

    /**
     * Count indoor sports
     */
    long countByIsIndoorTrueAndIsActiveTrue();

    /**
     * Count outdoor sports
     */
    long countByIsOutdoorTrueAndIsActiveTrue();

    /**
     * Count weather-dependent sports
     */
    long countByIsWeatherDependentTrueAndIsActiveTrue();
}
