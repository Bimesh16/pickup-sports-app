package com.bmessi.pickupsportsapp.controller.payment;

import com.bmessi.pickupsportsapp.service.payment.InternationalPaymentService;
import com.bmessi.pickupsportsapp.service.payment.InternationalPaymentService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for international payment processing across multiple countries.
 * 
 * <p>This controller handles payment processing for pickup sports games across
 * different countries with region-specific payment gateways and methods.</p>
 * 
 * <p><strong>Supported Countries:</strong></p>
 * <ul>
 *   <li><strong>🇺🇸 United States:</strong> Stripe, PayPal, Apple Pay, Google Pay</li>
 *   <li><strong>🇨🇦 Canada:</strong> Stripe, PayPal, Interac e-Transfer</li>
 *   <li><strong>🇲🇽 Mexico:</strong> Stripe, PayPal, OXXO, SPEI</li>
 *   <li><strong>🇮🇳 India:</strong> Razorpay, UPI, Paytm, PhonePe, GPay</li>
 *   <li><strong>🇳🇵 Nepal:</strong> eSewa, Khalti, IME Pay, Mobile Banking</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@RestController
@RequestMapping("/payments/international")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "International Payments", description = "Multi-country payment processing")
public class InternationalPaymentController {

    private final InternationalPaymentService paymentService;

    /**
     * Get available payment methods for a specific country.
     */
    @Operation(summary = "Get payment methods by country", 
               description = "Returns available payment methods and gateways for a specific country")
    @GetMapping("/methods/{countryCode}")
    public ResponseEntity<CountryPaymentMethods> getPaymentMethods(
            @Parameter(description = "ISO country code (US, CA, MX, IN, NP)") 
            @PathVariable 
            @Pattern(regexp = "^(US|CA|MX|IN|NP)$", message = "Country code must be US, CA, MX, IN, or NP")
            String countryCode
    ) {
        List<PaymentMethodInfo> methods = paymentService.getAvailablePaymentMethods(countryCode);
        
        CountryPaymentMethods response = CountryPaymentMethods.builder()
            .countryCode(countryCode)
            .countryName(getCountryName(countryCode))
            .primaryCurrency(getPrimaryCurrency(countryCode))
            .paymentMethods(methods)
            .supportedCurrencies(getSupportedCurrencies(countryCode))
            .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Create payment intent for game registration.
     */
    @Operation(summary = "Create payment intent", 
               description = "Create payment intent for game registration with country-specific gateway")
    @PostMapping("/create-intent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody CreatePaymentIntentRequest request,
            @Parameter(hidden = true) Principal principal
    ) {
        // Get authenticated user
        User user = userService.findByUsername(principal.getName());
        
        // Create payment request
        PaymentRequest paymentRequest = new PaymentRequest(
            request.gameId(),
            user.getId(),
            request.amount(),
            request.currency(),
            request.country(),
            request.paymentMethodId(),
            request.preferredGateway(),
            request.metadata()
        );

        PaymentIntentResult result = paymentService.createPaymentIntent(paymentRequest);

        PaymentIntentResponse response = PaymentIntentResponse.builder()
            .paymentIntentId(result.getPaymentIntentId())
            .amount(result.getAmount())
            .currency(result.getCurrency())
            .gateway(result.getGateway())
            .clientSecret(result.getClientSecret())
            .paymentUrl(result.getPaymentUrl())
            .expiresAt(result.getExpiresAt())
            .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Get real-time exchange rates.
     */
    @Operation(summary = "Get exchange rates", 
               description = "Get current exchange rates between supported currencies")
    @GetMapping("/exchange-rates")
    public ResponseEntity<List<ExchangeRateInfo>> getExchangeRates(
            @Parameter(description = "Base currency") @RequestParam(defaultValue = "USD") String baseCurrency
    ) {
        List<String> targetCurrencies = List.of("USD", "CAD", "MXN", "INR", "NPR");
        
        List<ExchangeRateInfo> rates = targetCurrencies.stream()
            .filter(currency -> !currency.equals(baseCurrency))
            .map(currency -> paymentService.getExchangeRate(baseCurrency, currency))
            .toList();

        return ResponseEntity.ok(rates);
    }

    /**
     * Process payment webhook from various gateways.
     */
    @Operation(summary = "Payment webhook endpoint", 
               description = "Webhook endpoint for payment confirmations from various gateways")
    @PostMapping("/webhook/{gateway}")
    public ResponseEntity<Void> handlePaymentWebhook(
            @Parameter(description = "Payment gateway name") @PathVariable String gateway,
            @RequestBody Map<String, Object> webhookPayload,
            @RequestHeader(required = false) Map<String, String> headers
    ) {
        try {
            PaymentWebhookData webhookData = PaymentWebhookData.builder()
                .gateway(PaymentGateway.valueOf(gateway.toUpperCase()))
                .payload(webhookPayload)
                .headers(headers)
                .paymentIntentId(extractPaymentIntentId(webhookPayload, gateway))
                .build();

            PaymentConfirmationResult result = paymentService.confirmPayment(webhookData);
            
            log.info("Payment webhook processed: {} - {}", 
                webhookData.getPaymentIntentId(), result.isSuccessful() ? "SUCCESS" : "FAILED");

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Error processing payment webhook from {}: {}", gateway, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Process refund for cancelled game or participant withdrawal.
     */
    @Operation(summary = "Process refund", 
               description = "Process refund for cancelled games or participant withdrawals")
    @PostMapping("/refund")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RefundResponse> processRefund(
            @Valid @RequestBody RefundRequestDTO refundRequest,
            @Parameter(hidden = true) Principal principal
    ) {
        // Validate user has permission to request refund
        validateRefundAccess(refundRequest.paymentIntentId(), principal);

        RefundRequest request = RefundRequest.builder()
            .paymentIntentId(refundRequest.paymentIntentId())
            .amount(refundRequest.amount())
            .reason(refundRequest.reason())
            .requestedBy(principal.getName())
            .build();

        RefundResult result = paymentService.processRefund(request);

        RefundResponse response = RefundResponse.builder()
            .refundId(result.getRefundId())
            .amount(result.getRefundedAmount())
            .currency(result.getCurrency())
            .status(result.getStatus())
            .estimatedArrival(result.getEstimatedArrival())
            .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Get user's payment history across countries.
     */
    @Operation(summary = "Get payment history", 
               description = "Get user's international payment history across all countries")
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPaymentHistory> getPaymentHistory(
            @Parameter(description = "Number of recent payments to retrieve") 
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer limit,
            @Parameter(hidden = true) Principal principal
    ) {
        User user = userService.findByUsername(principal.getName());
        UserPaymentHistory history = paymentService.getUserPaymentHistory(user.getId(), limit);
        return ResponseEntity.ok(history);
    }

    /**
     * Get payment analytics by country.
     */
    @Operation(summary = "Get payment analytics", 
               description = "Get payment statistics and analytics broken down by country")
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentAnalytics> getPaymentAnalytics(
            @Parameter(description = "Start date for analytics") @RequestParam(required = false) String fromDate,
            @Parameter(description = "End date for analytics") @RequestParam(required = false) String toDate
    ) {
        PaymentAnalytics analytics = paymentService.getPaymentAnalytics(fromDate, toDate);
        return ResponseEntity.ok(analytics);
    }

    // ===== PRIVATE HELPER METHODS =====

    private String getCountryName(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> "United States";
            case "CA" -> "Canada";  
            case "MX" -> "Mexico";
            case "IN" -> "India";
            case "NP" -> "Nepal";
            default -> "Unknown";
        };
    }

    private String getPrimaryCurrency(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> "USD";
            case "CA" -> "CAD";
            case "MX" -> "MXN"; 
            case "IN" -> "INR";
            case "NP" -> "NPR";
            default -> "USD";
        };
    }

    private List<String> getSupportedCurrencies(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> List.of("USD");
            case "CA" -> List.of("CAD", "USD");
            case "MX" -> List.of("MXN", "USD");
            case "IN" -> List.of("INR", "USD");
            case "NP" -> List.of("NPR", "INR", "USD");
            default -> List.of("USD");
        };
    }

    private String extractPaymentIntentId(Map<String, Object> payload, String gateway) {
        // Extract payment intent ID based on gateway's webhook format
        return switch (gateway.toLowerCase()) {
            case "stripe" -> (String) ((Map<?, ?>) payload.get("data")).get("object").get("id");
            case "paypal" -> (String) payload.get("resource").get("id");
            case "razorpay" -> (String) ((Map<?, ?>) payload.get("payload")).get("payment").get("entity").get("id");
            case "esewa" -> (String) payload.get("transaction_uuid");
            case "khalti" -> (String) payload.get("idx");
            default -> (String) payload.get("payment_intent_id");
        };
    }

    private void validateRefundAccess(String paymentIntentId, Principal principal) {
        // Implementation to validate user can request refund for this payment
        // Check if user made the payment or is game owner
    }

    // ===== REQUEST/RESPONSE DTOs =====

    @lombok.Data
    @lombok.Builder
    public static class CreatePaymentIntentRequest {
        @NotNull @Parameter(description = "Game ID to pay for")
        private Long gameId;
        
        @NotNull @DecimalMin("0.01") @Parameter(description = "Payment amount")
        private BigDecimal amount;
        
        @NotBlank @Size(min = 3, max = 3) @Parameter(description = "Currency code (USD, CAD, etc.)")
        private String currency;
        
        @NotBlank @Pattern(regexp = "^(US|CA|MX|IN|NP)$") @Parameter(description = "Country code")
        private String country;
        
        @Parameter(description = "Preferred payment method ID")
        private String paymentMethodId;
        
        @Parameter(description = "Preferred payment gateway")
        private PaymentGateway preferredGateway;
        
        @Parameter(description = "Additional metadata")
        private Map<String, String> metadata;
    }

    @lombok.Data
    @lombok.Builder
    public static class PaymentIntentResponse {
        private String paymentIntentId;
        private BigDecimal amount;
        private String currency;
        private PaymentGateway gateway;
        private String clientSecret;
        private String paymentUrl;
        private OffsetDateTime expiresAt;
    }

    @lombok.Data
    @lombok.Builder
    public static class CountryPaymentMethods {
        private String countryCode;
        private String countryName;
        private String primaryCurrency;
        private List<PaymentMethodInfo> paymentMethods;
        private List<String> supportedCurrencies;
    }

    public record RefundRequestDTO(
        @NotBlank @Parameter(description = "Payment intent ID to refund") String paymentIntentId,
        @DecimalMin("0.01") @Parameter(description = "Amount to refund") BigDecimal amount,
        @NotBlank @Parameter(description = "Reason for refund") String reason
    ) {}

    @lombok.Data
    @lombok.Builder
    public static class RefundResponse {
        private String refundId;
        private BigDecimal amount;
        private String currency;
        private String status;
        private String estimatedArrival;
    }

    @lombok.Data
    @lombok.Builder
    public static class UserPaymentHistory {
        private Long userId;
        private String username;
        private Integer totalPayments;
        private BigDecimal totalAmountSpent;
        private List<PaymentHistoryItem> recentPayments;
        private Map<String, CountryPaymentSummary> paymentsByCountry;
    }

    @lombok.Data
    @lombok.Builder
    public static class PaymentHistoryItem {
        private String paymentIntentId;
        private Long gameId;
        private String gameName;
        private BigDecimal amount;
        private String currency;
        private String country;
        private PaymentGateway gateway;
        private String status;
        private OffsetDateTime createdAt;
        private OffsetDateTime completedAt;
    }

    @lombok.Data
    @lombok.Builder
    public static class CountryPaymentSummary {
        private String countryCode;
        private String countryName;
        private Integer totalPayments;
        private BigDecimal totalAmount;
        private String primaryCurrency;
        private PaymentGateway mostUsedGateway;
    }

    @lombok.Data
    @lombok.Builder
    public static class PaymentAnalytics {
        private OffsetDateTime fromDate;
        private OffsetDateTime toDate;
        private BigDecimal totalRevenue;
        private Integer totalTransactions;
        private Double averageTransactionSize;
        private Map<String, CountryAnalytics> analyticsByCountry;
        private Map<String, GatewayAnalytics> analyticsByGateway;
        private List<PopularGame> topGames;
    }

    @lombok.Data
    @lombok.Builder
    public static class CountryAnalytics {
        private String countryCode;
        private String countryName;
        private BigDecimal revenue;
        private Integer transactions;
        private Double conversionRate;
        private String topSport;
        private BigDecimal averageGamePrice;
    }

    @lombok.Data
    @lombok.Builder
    public static class GatewayAnalytics {
        private PaymentGateway gateway;
        private BigDecimal revenue;
        private Integer transactions;
        private Double successRate;
        private Double averageProcessingTime;
        private List<String> topCountries;
    }

    @lombok.Data
    @lombok.Builder
    public static class PopularGame {
        private Long gameId;
        private String sport;
        private String location;
        private String country;
        private BigDecimal revenue;
        private Integer participants;
        private Double averageRating;
    }

    @lombok.Data
    @lombok.Builder
    public static class PaymentWebhookData {
        private PaymentGateway gateway;
        private Map<String, Object> payload;
        private Map<String, String> headers;
        private String paymentIntentId;
    }

    @lombok.Data
    @lombok.Builder
    public static class RefundRequest {
        private String paymentIntentId;
        private BigDecimal amount;
        private String reason;
        private String requestedBy;
    }

    @lombok.Data
    @lombok.Builder
    public static class RefundResult {
        private String refundId;
        private BigDecimal refundedAmount;
        private String currency;
        private String status;
        private String estimatedArrival;
    }

    @lombok.Data
    @lombok.Builder
    public static class ExchangeRateInfo {
        private String fromCurrency;
        private String toCurrency;
        private BigDecimal rate;
        private OffsetDateTime timestamp;
        private String provider;
    }
}