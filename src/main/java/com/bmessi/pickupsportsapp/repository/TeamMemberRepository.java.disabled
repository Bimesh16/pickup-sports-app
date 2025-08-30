package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.game.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for TeamMember entity.
 * 
 * <p>Provides data access methods for team member management including:</p>
 * <ul>
 *   <li>Player-team associations and role management</li>
 *   <li>Payment tracking and status queries</li>
 *   <li>Game day check-in and attendance tracking</li>
 *   <li>Performance and feedback management</li>
 * </ul>
 */
@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    /**
     * Find all members of a specific team.
     */
    List<TeamMember> findByTeamIdOrderByMemberTypeDescJerseyNumber(Long teamId);

    /**
     * Find team member by team and user.
     */
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    /**
     * Find all team members for a game.
     */
    List<TeamMember> findByTeam_GameId(Long gameId);

    /**
     * Find team members by payment status.
     */
    List<TeamMember> findByPaymentStatus(TeamMember.PaymentStatus paymentStatus);

    /**
     * Find unpaid members for a game.
     */
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.game.id = :gameId " +
           "AND tm.paymentStatus IN ('PENDING', 'FAILED', 'PARTIAL')")
    List<TeamMember> findUnpaidMembersForGame(@Param("gameId") Long gameId);

    /**
     * Find team members by user ID (player's game history).
     */
    List<TeamMember> findByUserIdOrderByJoinedAtDesc(Long userId);

    /**
     * Find captains for a specific game.
     */
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.game.id = :gameId " +
           "AND tm.memberType IN ('CAPTAIN', 'CO_CAPTAIN')")
    List<TeamMember> findCaptainsForGame(@Param("gameId") Long gameId);

    /**
     * Find substitute players for a team.
     */
    List<TeamMember> findByTeamIdAndIsSubstituteTrue(Long teamId);

    /**
     * Find active (non-substitute) players for a team.
     */
    List<TeamMember> findByTeamIdAndIsSubstituteFalse(Long teamId);

    /**
     * Count players by team.
     */
    long countByTeamId(Long teamId);

    /**
     * Count active players by team.
     */
    long countByTeamIdAndIsSubstituteFalse(Long teamId);

    /**
     * Find members with specific jersey number conflicts.
     */
    Optional<TeamMember> findByTeamIdAndJerseyNumber(Long teamId, Integer jerseyNumber);

    /**
     * Find checked-in players for a team.
     */
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.checkedInAt IS NOT NULL")
    List<TeamMember> findCheckedInMembers(@Param("teamId") Long teamId);

    /**
     * Calculate total amount owed for a game.
     */
    @Query("SELECT COALESCE(SUM(tm.amountOwed), 0) FROM TeamMember tm WHERE tm.team.game.id = :gameId")
    BigDecimal getTotalAmountOwedForGame(@Param("gameId") Long gameId);

    /**
     * Calculate total amount paid for a game.
     */
    @Query("SELECT COALESCE(SUM(tm.amountPaid), 0) FROM TeamMember tm WHERE tm.team.game.id = :gameId")
    BigDecimal getTotalAmountPaidForGame(@Param("gameId") Long gameId);

    /**
     * Get payment completion percentage for a game.
     */
    @Query("SELECT CASE WHEN SUM(tm.amountOwed) > 0 " +
           "THEN (SUM(tm.amountPaid) / SUM(tm.amountOwed)) * 100 " +
           "ELSE 100 END " +
           "FROM TeamMember tm WHERE tm.team.game.id = :gameId")
    Double getPaymentCompletionPercentageForGame(@Param("gameId") Long gameId);

    /**
     * Find team members with outstanding payments.
     */
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.game.id = :gameId " +
           "AND tm.amountOwed > tm.amountPaid")
    List<TeamMember> findMembersWithOutstandingPayments(@Param("gameId") Long gameId);

    /**
     * Find team member by payment intent ID.
     */
    Optional<TeamMember> findByPaymentIntentId(String paymentIntentId);

    /**
     * Get attendance rate for a user.
     */
    @Query("SELECT CASE WHEN COUNT(tm) > 0 " +
           "THEN (COUNT(CASE WHEN tm.attended = true THEN 1 END) * 100.0 / COUNT(tm)) " +
           "ELSE 0 END " +
           "FROM TeamMember tm WHERE tm.user.id = :userId " +
           "AND tm.team.status = 'COMPLETED'")
    Double getUserAttendanceRate(@Param("userId") Long userId);

    /**
     * Get average performance rating for a user.
     */
    @Query("SELECT AVG(tm.performanceRating) FROM TeamMember tm " +
           "WHERE tm.user.id = :userId AND tm.performanceRating IS NOT NULL")
    Double getUserAveragePerformance(@Param("userId") Long userId);

    /**
     * Find team members by preferred position.
     */
    List<TeamMember> findByPreferredPositionIgnoreCase(String position);

    /**
     * Get position distribution for a game.
     */
    @Query("SELECT tm.preferredPosition, COUNT(tm) FROM TeamMember tm " +
           "WHERE tm.team.game.id = :gameId AND tm.preferredPosition IS NOT NULL " +
           "GROUP BY tm.preferredPosition")
    List<Object[]> getPositionDistributionForGame(@Param("gameId") Long gameId);
}