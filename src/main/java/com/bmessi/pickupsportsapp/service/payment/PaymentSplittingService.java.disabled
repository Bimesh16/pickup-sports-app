package com.bmessi.pickupsportsapp.service.payment;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.game.TeamMember;
import com.bmessi.pickupsportsapp.entity.VenueBooking;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.TeamMemberRepository;
import com.bmessi.pickupsportsapp.repository.VenueBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for automated payment splitting and financial management.
 * 
 * <p>This service handles the complex logic of distributing costs among participants:</p>
 * <ul>
 *   <li><strong>Cost Calculation:</strong> Venue costs, app commission, and player shares</li>
 *   <li><strong>Payment Processing:</strong> Individual payment intent creation</li>
 *   <li><strong>Revenue Distribution:</strong> Owner payouts and platform fees</li>
 *   <li><strong>Refund Handling:</strong> Cancellation and no-show refund processing</li>
 * </ul>
 * 
 * <p><strong>Payment Model:</strong></p>
 * <ul>
 *   <li>Venue owners set hourly rates for field booking</li>
 *   <li>App takes 10% commission on total venue cost</li>
 *   <li>Remaining costs split equally among all participants</li>
 *   <li>Late cancellations may incur penalty fees</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentSplittingService {

    private final GameRepository gameRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final VenueBookingRepository venueBookingRepository;
    private final PaymentService paymentService; // Existing payment service
    
    // Configuration constants
    private static final BigDecimal APP_COMMISSION_RATE = BigDecimal.valueOf(0.10); // 10%
    private static final BigDecimal CANCELLATION_FEE_RATE = BigDecimal.valueOf(0.25); // 25% for late cancellation
    private static final int HOURS_FOR_FULL_REFUND = 24; // 24 hours before game for full refund

    /**
     * Calculate payment breakdown for a game.
     */
    @Transactional(readOnly = true)
    public PaymentBreakdown calculateGamePayments(Long gameId) {
        log.debug("Calculating payment breakdown for game: {}", gameId);
        
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        
        // Get venue booking cost
        BigDecimal venueCost = getVenueCost(game);
        
        // Calculate app commission
        BigDecimal appCommission = venueCost.multiply(APP_COMMISSION_RATE);
        
        // Total cost including commission
        BigDecimal totalCost = venueCost.add(appCommission);
        
        // Get participant count
        List<TeamMember> participants = teamMemberRepository.findByTeam_GameId(gameId);
        int participantCount = participants.size();
        
        // Calculate cost per player
        BigDecimal costPerPlayer = participantCount > 0 ? 
                totalCost.divide(BigDecimal.valueOf(participantCount), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        
        // Owner payout (venue cost minus any platform processing fees)
        BigDecimal ownerPayout = venueCost.multiply(BigDecimal.valueOf(0.95)); // 5% processing fee
        
        return PaymentBreakdown.builder()
                .gameId(gameId)
                .venueCost(venueCost)
                .appCommission(appCommission)
                .processingFee(venueCost.multiply(BigDecimal.valueOf(0.05)))
                .totalCost(totalCost)
                .costPerPlayer(costPerPlayer)
                .participantCount(participantCount)
                .ownerPayout(ownerPayout)
                .calculatedAt(OffsetDateTime.now())
                .build();
    }

    /**
     * Calculate individual player's share for a game.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculatePlayerShare(Long gameId, Long userId) {
        log.debug("Calculating player share for game: {} and user: {}", gameId, userId);
        
        PaymentBreakdown breakdown = calculateGamePayments(gameId);
        
        // Check if user is actually participating
        Optional<TeamMember> member = teamMemberRepository.findByTeam_GameId(gameId).stream()
                .filter(tm -> tm.getUser().getId().equals(userId))
                .findFirst();
        
        if (member.isEmpty()) {
            throw new IllegalArgumentException("User is not participating in this game");
        }
        
        // Standard share for all players (could be enhanced for different pricing models)
        return breakdown.getCostPerPlayer();
    }

    /**
     * Process payments for all team members in a game.
     */
    @Transactional
    public List<PaymentIntent> processTeamPayments(Long gameId) {
        log.info("Processing team payments for game: {}", gameId);
        
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        
        PaymentBreakdown breakdown = calculateGamePayments(gameId);
        List<TeamMember> members = teamMemberRepository.findByTeam_GameId(gameId);
        List<PaymentIntent> paymentIntents = new ArrayList<>();
        
        for (TeamMember member : members) {
            if (member.getPaymentStatus() == TeamMember.PaymentStatus.PENDING ||
                member.getPaymentStatus() == TeamMember.PaymentStatus.FAILED) {
                
                try {
                    // Set amount owed
                    member.setAmountOwed(breakdown.getCostPerPlayer());
                    
                    // Create payment intent using existing payment service
                    String paymentIntentId = createPaymentIntentForMember(member, breakdown.getCostPerPlayer());
                    member.setPaymentIntentId(paymentIntentId);
                    
                    teamMemberRepository.save(member);
                    
                    PaymentIntent intent = new PaymentIntent(
                            paymentIntentId,
                            member.getUser().getId(),
                            member.getUser().getUsername(),
                            breakdown.getCostPerPlayer(),
                            "PENDING"
                    );
                    paymentIntents.add(intent);
                    
                    log.debug("Created payment intent {} for user {} amount {}", 
                             paymentIntentId, member.getUser().getUsername(), breakdown.getCostPerPlayer());
                    
                } catch (Exception e) {
                    log.error("Failed to create payment intent for user {}: {}", 
                             member.getUser().getUsername(), e.getMessage());
                }
            }
        }
        
        log.info("Created {} payment intents for game {}", paymentIntents.size(), gameId);
        return paymentIntents;
    }

    /**
     * Handle individual player payment.
     */
    @Transactional
    public void handlePlayerPayment(Long teamMemberId, String paymentIntentId) {
        log.info("Processing payment for team member: {} with intent: {}", teamMemberId, paymentIntentId);
        
        TeamMember member = teamMemberRepository.findById(teamMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + teamMemberId));
        
        // Update payment status
        member.setAmountPaid(member.getAmountOwed());
        member.setPaymentStatus(TeamMember.PaymentStatus.PAID);
        member.setPaidAt(OffsetDateTime.now());
        member.setPaymentIntentId(paymentIntentId);
        
        teamMemberRepository.save(member);
        
        log.info("Payment completed for team member: {}", teamMemberId);
    }

    /**
     * Process refunds for a game (cancellation or other reasons).
     */
    @Transactional
    public RefundSummary processRefunds(Long gameId, RefundReason reason) {
        log.info("Processing refunds for game: {} due to: {}", gameId, reason);
        
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        
        List<TeamMember> paidMembers = teamMemberRepository.findByTeam_GameId(gameId).stream()
                .filter(m -> m.getPaymentStatus() == TeamMember.PaymentStatus.PAID)
                .collect(Collectors.toList());
        
        BigDecimal totalRefunded = BigDecimal.ZERO;
        int successfulRefunds = 0;
        List<String> failedRefunds = new ArrayList<>();
        
        for (TeamMember member : paidMembers) {
            try {
                BigDecimal refundAmount = calculateRefundAmount(member, game, reason);
                
                if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                    // Process refund through payment service
                    processRefundForMember(member, refundAmount);
                    
                    // Update member record
                    member.setPaymentStatus(TeamMember.PaymentStatus.REFUNDED);
                    member.setAmountPaid(member.getAmountPaid().subtract(refundAmount));
                    teamMemberRepository.save(member);
                    
                    totalRefunded = totalRefunded.add(refundAmount);
                    successfulRefunds++;
                    
                    log.debug("Refunded {} to user {}", refundAmount, member.getUser().getUsername());
                }
                
            } catch (Exception e) {
                log.error("Failed to refund user {}: {}", member.getUser().getUsername(), e.getMessage());
                failedRefunds.add(member.getUser().getUsername());
            }
        }
        
        return RefundSummary.builder()
                .gameId(gameId)
                .reason(reason)
                .totalRefunded(totalRefunded)
                .successfulRefunds(successfulRefunds)
                .failedRefunds(failedRefunds)
                .processedAt(OffsetDateTime.now())
                .build();
    }

    /**
     * Calculate owner payout for a specific date.
     */
    @Transactional(readOnly = true)
    public OwnerPayout calculateOwnerPayout(Long ownerId, LocalDate date) {
        log.debug("Calculating owner payout for owner: {} on date: {}", ownerId, date);
        
        OffsetDateTime startOfDay = date.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        
        // Get all completed games for the owner on this date
        List<Game> completedGames = gameRepository.findByUserIdAndStatusAndTimeBetween(
                ownerId, Game.GameStatus.COMPLETED, startOfDay, endOfDay);
        
        BigDecimal totalVenueRevenue = BigDecimal.ZERO;
        BigDecimal totalCommissionPaid = BigDecimal.ZERO;
        BigDecimal totalProcessingFees = BigDecimal.ZERO;
        int gamesCount = 0;
        
        for (Game game : completedGames) {
            PaymentBreakdown breakdown = calculateGamePayments(game.getId());
            
            // Only include games where all payments are completed
            boolean allPaid = teamMemberRepository.findByTeam_GameId(game.getId()).stream()
                    .allMatch(m -> m.getPaymentStatus() == TeamMember.PaymentStatus.PAID ||
                                 m.getPaymentStatus() == TeamMember.PaymentStatus.WAIVED);
            
            if (allPaid) {
                totalVenueRevenue = totalVenueRevenue.add(breakdown.getVenueCost());
                totalCommissionPaid = totalCommissionPaid.add(breakdown.getAppCommission());
                totalProcessingFees = totalProcessingFees.add(breakdown.getProcessingFee());
                gamesCount++;
            }
        }
        
        BigDecimal netPayout = totalVenueRevenue.subtract(totalProcessingFees);
        
        return OwnerPayout.builder()
                .ownerId(ownerId)
                .payoutDate(date)
                .gamesCount(gamesCount)
                .totalVenueRevenue(totalVenueRevenue)
                .appCommissionDeducted(totalCommissionPaid)
                .processingFeesDeducted(totalProcessingFees)
                .netPayout(netPayout)
                .calculatedAt(OffsetDateTime.now())
                .build();
    }

    /**
     * Get payment summary for a game.
     */
    @Transactional(readOnly = true)
    public PaymentSummary getGamePaymentSummary(Long gameId) {
        log.debug("Generating payment summary for game: {}", gameId);
        
        PaymentBreakdown breakdown = calculateGamePayments(gameId);
        List<TeamMember> members = teamMemberRepository.findByTeam_GameId(gameId);
        
        long paidCount = members.stream()
                .filter(m -> m.getPaymentStatus() == TeamMember.PaymentStatus.PAID)
                .count();
        
        long pendingCount = members.stream()
                .filter(m -> m.getPaymentStatus() == TeamMember.PaymentStatus.PENDING ||
                           m.getPaymentStatus() == TeamMember.PaymentStatus.FAILED)
                .count();
        
        BigDecimal totalCollected = teamMemberRepository.getTotalAmountPaidForGame(gameId);
        BigDecimal totalOutstanding = breakdown.getTotalCost().subtract(totalCollected);
        
        double completionPercentage = breakdown.getTotalCost().compareTo(BigDecimal.ZERO) > 0 ?
                totalCollected.divide(breakdown.getTotalCost(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue() : 100.0;
        
        return PaymentSummary.builder()
                .gameId(gameId)
                .totalParticipants(members.size())
                .paidParticipants((int) paidCount)
                .pendingParticipants((int) pendingCount)
                .totalAmountDue(breakdown.getTotalCost())
                .totalAmountCollected(totalCollected)
                .totalAmountOutstanding(totalOutstanding)
                .completionPercentage(completionPercentage)
                .breakdown(breakdown)
                .build();
    }

    /**
     * Get payment history for a specific player.
     */
    @Transactional(readOnly = true)
    public List<PlayerTransaction> getPlayerPaymentHistory(Long userId, int limit) {
        log.debug("Fetching payment history for user: {} limit: {}", userId, limit);
        
        List<TeamMember> memberHistory = teamMemberRepository.findByUserIdOrderByJoinedAtDesc(userId);
        
        return memberHistory.stream()
                .limit(limit)
                .map(member -> PlayerTransaction.builder()
                        .transactionId(member.getId())
                        .gameId(member.getTeam().getGame().getId())
                        .gameDescription(String.format("%s at %s", 
                                member.getTeam().getGame().getSport(),
                                member.getTeam().getGame().getLocation()))
                        .amount(member.getAmountPaid())
                        .paymentStatus(member.getPaymentStatus().name())
                        .transactionDate(member.getPaidAt())
                        .paymentIntentId(member.getPaymentIntentId())
                        .build())
                .collect(Collectors.toList());
    }

    // Private helper methods

    private BigDecimal getVenueCost(Game game) {
        if (game.getTotalCost() != null && game.getTotalCost().compareTo(BigDecimal.ZERO) > 0) {
            return game.getTotalCost();
        }
        
        // Try to get from venue booking
        if (game.getVenue() != null) {
            Optional<VenueBooking> booking = venueBookingRepository.findByGameId(game.getId());
            if (booking.isPresent()) {
                return booking.get().getTotalCost();
            }
            
            // Fall back to venue hourly rate * duration
            BigDecimal hourlyRate = game.getVenue().getBasePricePerHour();
            if (hourlyRate != null && game.getDurationMinutes() != null) {
                BigDecimal hours = BigDecimal.valueOf(game.getDurationMinutes()).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
                return hourlyRate.multiply(hours);
            }
        }
        
        // Default fallback
        return BigDecimal.valueOf(100.00); // $100 default
    }

    private String createPaymentIntentForMember(TeamMember member, BigDecimal amount) {
        // This would integrate with your existing PaymentService
        // For now, generate a mock payment intent ID
        return "pi_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }

    private BigDecimal calculateRefundAmount(TeamMember member, Game game, RefundReason reason) {
        BigDecimal paidAmount = member.getAmountPaid();
        
        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        
        return switch (reason) {
            case GAME_CANCELLED -> paidAmount; // Full refund for cancellation
            case PLAYER_CANCELLATION -> calculatePlayerCancellationRefund(member, game);
            case WEATHER_CANCELLATION -> paidAmount; // Full refund for weather
            case VENUE_UNAVAILABLE -> paidAmount; // Full refund for venue issues
            case NO_SHOW -> BigDecimal.ZERO; // No refund for no-shows
            case ADMIN_DECISION -> paidAmount; // Full refund for admin decisions
        };
    }

    private BigDecimal calculatePlayerCancellationRefund(TeamMember member, Game game) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime gameTime = game.getTime();
        
        long hoursUntilGame = java.time.Duration.between(now, gameTime).toHours();
        
        if (hoursUntilGame >= HOURS_FOR_FULL_REFUND) {
            return member.getAmountPaid(); // Full refund
        } else if (hoursUntilGame >= 6) {
            // 75% refund for 6-24 hours notice
            return member.getAmountPaid().multiply(BigDecimal.valueOf(0.75));
        } else if (hoursUntilGame >= 2) {
            // 50% refund for 2-6 hours notice
            return member.getAmountPaid().multiply(BigDecimal.valueOf(0.50));
        } else {
            // 25% refund for less than 2 hours notice
            return member.getAmountPaid().multiply(BigDecimal.valueOf(0.25));
        }
    }

    private void processRefundForMember(TeamMember member, BigDecimal refundAmount) {
        // This would integrate with your payment processor to issue actual refund
        log.info("Processing refund of {} for team member {}", refundAmount, member.getId());
        
        // TODO: Integrate with Stripe/PayPal/etc for actual refund processing
        // paymentService.refundPayment(member.getPaymentIntentId(), refundAmount);
    }

    // Data classes for payment operations

    public enum RefundReason {
        GAME_CANCELLED("Game was cancelled by organizer"),
        PLAYER_CANCELLATION("Player cancelled their registration"),
        WEATHER_CANCELLATION("Game cancelled due to weather"),
        VENUE_UNAVAILABLE("Venue became unavailable"),
        NO_SHOW("Player did not show up"),
        ADMIN_DECISION("Administrative decision");

        private final String description;

        RefundReason(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    @lombok.Builder
    @lombok.Data
    public static class PaymentBreakdown {
        private Long gameId;
        private BigDecimal venueCost;
        private BigDecimal appCommission;
        private BigDecimal processingFee;
        private BigDecimal totalCost;
        private BigDecimal costPerPlayer;
        private Integer participantCount;
        private BigDecimal ownerPayout;
        private OffsetDateTime calculatedAt;
    }

    @lombok.Builder
    @lombok.Data
    public static class PaymentSummary {
        private Long gameId;
        private Integer totalParticipants;
        private Integer paidParticipants;
        private Integer pendingParticipants;
        private BigDecimal totalAmountDue;
        private BigDecimal totalAmountCollected;
        private BigDecimal totalAmountOutstanding;
        private Double completionPercentage;
        private PaymentBreakdown breakdown;
    }

    @lombok.Builder
    @lombok.Data
    public static class OwnerPayout {
        private Long ownerId;
        private LocalDate payoutDate;
        private Integer gamesCount;
        private BigDecimal totalVenueRevenue;
        private BigDecimal appCommissionDeducted;
        private BigDecimal processingFeesDeducted;
        private BigDecimal netPayout;
        private OffsetDateTime calculatedAt;
    }

    @lombok.Builder
    @lombok.Data
    public static class RefundSummary {
        private Long gameId;
        private RefundReason reason;
        private BigDecimal totalRefunded;
        private Integer successfulRefunds;
        private List<String> failedRefunds;
        private OffsetDateTime processedAt;
    }

    @lombok.Builder
    @lombok.Data
    public static class PlayerTransaction {
        private Long transactionId;
        private Long gameId;
        private String gameDescription;
        private BigDecimal amount;
        private String paymentStatus;
        private OffsetDateTime transactionDate;
        private String paymentIntentId;
    }

    public static class PaymentIntent {
        public final String intentId;
        public final Long userId;
        public final String username;
        public final BigDecimal amount;
        public final String status;
        
        public PaymentIntent(String intentId, Long userId, String username, BigDecimal amount, String status) {
            this.intentId = intentId;
            this.userId = userId;
            this.username = username;
            this.amount = amount;
            this.status = status;
        }
    }
}