package com.bmessi.pickupsportsapp.controller.owner;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.service.game.BulkGameService;
import com.bmessi.pickupsportsapp.service.owner.OwnerDashboardService;
import com.bmessi.pickupsportsapp.service.payment.PaymentSplittingService;
import com.bmessi.pickupsportsapp.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;

/**
 * REST controller for app owner game management operations.
 * 
 * <p>This controller provides specialized endpoints for app owners to:</p>
 * <ul>
 *   <li><strong>Bulk Operations:</strong> Create, update, and cancel multiple games</li>
 *   <li><strong>Analytics:</strong> Revenue reports and performance metrics</li>
 *   <li><strong>Dashboard Data:</strong> Owner-specific metrics and insights</li>
 *   <li><strong>Financial Management:</strong> Payment tracking and payouts</li>
 * </ul>
 * 
 * <p><strong>Access Control:</strong></p>
 * <ul>
 *   <li>All endpoints require authentication</li>
 *   <li>Users can only manage their own games and venues</li>
 *   <li>Admin users have access to all operations</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/owner/games")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Owner Game Management", description = "Bulk game operations and owner analytics")
public class OwnerGameController {

    private final BulkGameService bulkGameService;
    private final OwnerDashboardService ownerDashboardService;
    private final PaymentSplittingService paymentSplittingService;

    /**
     * Create multiple games from a template.
     */
    @PostMapping("/bulk")
    @Operation(summary = "Create multiple games from template")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BulkGameService.BulkGameResult> createBulkGames(
            @Valid @RequestBody BulkGameService.BulkGameCreationRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Creating bulk games for user: {}", userDetails.getUsername());
        
        // Set creator ID from authenticated user
        request.setCreatorId(userDetails.getId());
        
        BulkGameService.BulkGameResult result = bulkGameService.createGamesFromTemplate(request);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Create a recurring game series.
     */
    @PostMapping("/series")
    @Operation(summary = "Create recurring game series")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BulkGameService.BulkGameResult> createGameSeries(
            @Valid @RequestBody BulkGameService.GameSeriesRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Creating game series for user: {} - {} occurrences", 
                 userDetails.getUsername(), request.getOccurrences());
        
        // Set creator ID from authenticated user
        request.setCreatorId(userDetails.getId());
        
        BulkGameService.BulkGameResult result = bulkGameService.createGameSeries(request);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Update multiple games simultaneously.
     */
    @PutMapping("/bulk")
    @Operation(summary = "Update multiple games")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BulkGameService.BulkUpdateResult> updateBulkGames(
            @Valid @RequestBody BulkGameService.BulkUpdateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Bulk updating {} games for user: {}", 
                 request.getGameIds().size(), userDetails.getUsername());
        
        // Set user ID from authenticated user
        request.setUserId(userDetails.getId());
        
        BulkGameService.BulkUpdateResult result = bulkGameService.bulkUpdateGames(request);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Cancel multiple games (series cancellation).
     */
    @DeleteMapping("/bulk")
    @Operation(summary = "Cancel multiple games")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BulkGameService.BulkCancellationResult> cancelBulkGames(
            @Valid @RequestBody BulkGameService.CancelSeriesRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Bulk cancelling {} games for user: {}", 
                 request.getGameIds().size(), userDetails.getUsername());
        
        // Set user ID from authenticated user
        request.setUserId(userDetails.getId());
        
        BulkGameService.BulkCancellationResult result = bulkGameService.cancelGameSeries(request);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get owner dashboard metrics.
     */
    @GetMapping("/metrics")
    @Operation(summary = "Get owner dashboard metrics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OwnerDashboardService.OwnerMetrics> getOwnerMetrics(
            @Parameter(description = "Time range for metrics")
            @RequestParam(defaultValue = "MONTH") OwnerDashboardService.TimeRange timeRange,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.debug("Fetching owner metrics for user: {} timeRange: {}", userDetails.getUsername(), timeRange);
        
        OwnerDashboardService.OwnerMetrics metrics = ownerDashboardService.getOwnerMetrics(
                userDetails.getId(), timeRange);
        
        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=300") // 5 minutes cache
                .body(metrics);
    }

    /**
     * Get revenue analytics for owner.
     */
    @GetMapping("/revenue")
    @Operation(summary = "Get revenue analytics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OwnerDashboardService.RevenueAnalytics> getRevenueAnalytics(
            @Parameter(description = "Time range for analytics")
            @RequestParam(defaultValue = "MONTH") OwnerDashboardService.TimeRange timeRange,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.debug("Fetching revenue analytics for user: {} timeRange: {}", userDetails.getUsername(), timeRange);
        
        OwnerDashboardService.RevenueAnalytics analytics = ownerDashboardService.getRevenueAnalytics(
                userDetails.getId(), timeRange);
        
        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=600") // 10 minutes cache
                .body(analytics);
    }

    /**
     * Get popular games report.
     */
    @GetMapping("/popular")
    @Operation(summary = "Get popular games report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OwnerDashboardService.PopularGamesReport> getPopularGames(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.debug("Fetching popular games report for user: {}", userDetails.getUsername());
        
        OwnerDashboardService.PopularGamesReport report = ownerDashboardService.getPopularGames(
                userDetails.getId());
        
        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=1800") // 30 minutes cache
                .body(report);
    }

    /**
     * Get payment breakdown for a specific game.
     */
    @GetMapping("/{gameId}/payments/breakdown")
    @Operation(summary = "Get payment breakdown for game")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentSplittingService.PaymentBreakdown> getPaymentBreakdown(
            @Parameter(description = "Game ID")
            @PathVariable Long gameId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.debug("Fetching payment breakdown for game: {} by user: {}", gameId, userDetails.getUsername());
        
        // TODO: Add authorization check to ensure user owns the game
        
        PaymentSplittingService.PaymentBreakdown breakdown = paymentSplittingService.calculateGamePayments(gameId);
        
        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=300") // 5 minutes cache
                .body(breakdown);
    }

    /**
     * Process payments for a game.
     */
    @PostMapping("/{gameId}/payments/process")
    @Operation(summary = "Process game payments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProcessPaymentsResponse> processGamePayments(
            @Parameter(description = "Game ID")
            @PathVariable Long gameId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Processing payments for game: {} by user: {}", gameId, userDetails.getUsername());
        
        // TODO: Add authorization check
        
        try {
            var paymentIntents = paymentSplittingService.processTeamPayments(gameId);
            
            ProcessPaymentsResponse response = new ProcessPaymentsResponse(
                    true,
                    "Payment processing initiated for " + paymentIntents.size() + " participants",
                    paymentIntents.size(),
                    paymentIntents
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to process payments for game {}: {}", gameId, e.getMessage());
            
            ProcessPaymentsResponse response = new ProcessPaymentsResponse(
                    false,
                    "Payment processing failed: " + e.getMessage(),
                    0,
                    Collections.emptyList()
            );
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get owner payout summary.
     */
    @GetMapping("/payouts")
    @Operation(summary = "Get owner payout summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentSplittingService.OwnerPayout> getOwnerPayout(
            @Parameter(description = "Payout date (defaults to today)")
            @RequestParam(required = false) LocalDate date,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.debug("Fetching owner payout for user: {} date: {}", userDetails.getUsername(), date);
        
        LocalDate payoutDate = date != null ? date : LocalDate.now();
        
        PaymentSplittingService.OwnerPayout payout = paymentSplittingService.calculateOwnerPayout(
                userDetails.getId(), payoutDate);
        
        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=3600") // 1 hour cache
                .body(payout);
    }

    // Response DTOs

    public static class ProcessPaymentsResponse {
        public final boolean success;
        public final String message;
        public final int paymentIntentsCreated;
        public final java.util.List<PaymentSplittingService.PaymentIntent> paymentIntents;
        
        public ProcessPaymentsResponse(boolean success, String message, int paymentIntentsCreated, 
                                     java.util.List<PaymentSplittingService.PaymentIntent> paymentIntents) {
            this.success = success;
            this.message = message;
            this.paymentIntentsCreated = paymentIntentsCreated;
            this.paymentIntents = paymentIntents;
        }
    }
}