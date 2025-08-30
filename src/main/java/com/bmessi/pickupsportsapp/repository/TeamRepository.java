package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.game.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Team entity.
 * 
 * <p>Provides data access methods for team management including:</p>
 * <ul>
 *   <li>Team lookup by game and team number</li>
 *   <li>Team statistics and balance queries</li>
 *   <li>Captain and player management queries</li>
 * </ul>
 */
@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    /**
     * Find all teams for a specific game, ordered by team number.
     */
    List<Team> findByGameIdOrderByTeamNumber(Long gameId);

    /**
     * Find a specific team by game and team number.
     */
    Optional<Team> findByGameIdAndTeamNumber(Long gameId, Integer teamNumber);

    /**
     * Find teams by status.
     */
    List<Team> findByStatus(Team.TeamStatus status);

    /**
     * Find teams by game ID and status.
     */
    List<Team> findByGameIdAndStatus(Long gameId, Team.TeamStatus status);

    /**
     * Find teams where a user is the captain.
     */
    List<Team> findByCaptainId(Long captainId);

    /**
     * Count teams for a specific game.
     */
    long countByGameId(Long gameId);

    /**
     * Find teams by formation strategy.
     */
    List<Team> findByFormationStrategy(Team.FormationStrategy strategy);

    /**
     * Get team statistics for a game.
     */
    @Query("SELECT t.id, t.teamName, t.activePlayersCount, t.averageSkillLevel, " +
           "COALESCE(c.username, 'No Captain') as captainName, " +
           "CASE WHEN t.activePlayersCount >= :minPlayers THEN true ELSE false END as isReady " +
           "FROM Team t LEFT JOIN t.captain c WHERE t.game.id = :gameId ORDER BY t.teamNumber")
    List<Object[]> getTeamStatsForGame(@Param("gameId") Long gameId, @Param("minPlayers") int minPlayers);

    /**
     * Find teams that need more players.
     */
    @Query("SELECT t FROM Team t WHERE t.game.id = :gameId AND t.activePlayersCount < :targetPlayers")
    List<Team> findTeamsNeedingPlayers(@Param("gameId") Long gameId, @Param("targetPlayers") int targetPlayers);

    /**
     * Find ready teams for a game.
     */
    @Query("SELECT t FROM Team t WHERE t.game.id = :gameId AND t.status = 'READY'")
    List<Team> findReadyTeamsForGame(@Param("gameId") Long gameId);

    /**
     * Check if all teams for a game are balanced.
     */
    @Query("SELECT CASE WHEN MAX(t.activePlayersCount) - MIN(t.activePlayersCount) <= 1 " +
           "AND MAX(COALESCE(t.averageSkillLevel, 2.0)) - MIN(COALESCE(t.averageSkillLevel, 2.0)) <= 0.5 " +
           "THEN true ELSE false END " +
           "FROM Team t WHERE t.game.id = :gameId")
    boolean areTeamsBalancedForGame(@Param("gameId") Long gameId);

    /**
     * Get team balance statistics.
     */
    @Query("SELECT MAX(t.activePlayersCount) - MIN(t.activePlayersCount) as playerVariance, " +
           "MAX(COALESCE(t.averageSkillLevel, 2.0)) - MIN(COALESCE(t.averageSkillLevel, 2.0)) as skillVariance " +
           "FROM Team t WHERE t.game.id = :gameId")
    Object[] getTeamBalanceStats(@Param("gameId") Long gameId);

    /**
     * Delete all teams for a game (for team reformation).
     */
    void deleteByGameId(Long gameId);
}