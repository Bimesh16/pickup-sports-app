package com.bmessi.pickupsportsapp.service.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * International payment service supporting multiple countries and payment gateways.
 * 
 * <p>This service provides unified payment processing across different countries
 * with region-specific payment methods and currency support.</p>
 * 
 * <p><strong>Supported Countries & Gateways:</strong></p>
 * <ul>
 *   <li><strong>United States:</strong> Stripe, PayPal, Apple Pay, Google Pay</li>
 *   <li><strong>Canada:</strong> Stripe, PayPal, Interac e-Transfer</li>
 *   <li><strong>Mexico:</strong> Stripe, PayPal, OXXO, SPEI</li>
 *   <li><strong>India:</strong> Razorpay, UPI, Paytm, PhonePe, GPay, Netbanking</li>
 *   <li><strong>Nepal:</strong> eSewa, Khalti, IME Pay, Mobile Banking</li>
 * </ul>
 * 
 * <p><strong>Features:</strong></p>
 * <ul>
 *   <li><strong>Multi-Currency:</strong> USD, CAD, MXN, INR, NPR</li>
 *   <li><strong>Regional Methods:</strong> Local payment preferences per country</li>
 *   <li><strong>Exchange Rates:</strong> Real-time currency conversion</li>
 *   <li><strong>Compliance:</strong> Local regulations and tax handling</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InternationalPaymentService {

    private final StripePaymentProvider stripeProvider;
    private final PayPalPaymentProvider paypalProvider;
    private final RazorpayPaymentProvider razorpayProvider;
    private final EsewaPaymentProvider esewaProvider;
    private final KhaltiPaymentProvider khaltiProvider;
    private final ExchangeRateService exchangeRateService;

    // Configuration properties
    @Value("${payments.default-currency:USD}")
    private String defaultCurrency;

    @Value("${payments.test-mode:true}")
    private boolean testMode;

    /**
     * Create payment intent with appropriate gateway based on country and user preferences.
     */
    public PaymentIntentResult createPaymentIntent(PaymentRequest request) {
        log.info("Creating payment intent for {} in country {}", request.amount(), request.country());

        // Validate request
        validatePaymentRequest(request);

        // Get country configuration
        CountryPaymentConfig config = getCountryConfig(request.country());

        // Convert currency if needed
        PaymentAmount convertedAmount = convertCurrency(request.amount(), request.currency(), config.getPrimaryCurrency());

        // Select optimal payment gateway
        PaymentGateway gateway = selectPaymentGateway(request, config);

        try {
            // Create payment intent with selected gateway
            PaymentIntentResult result = switch (gateway) {
                case STRIPE -> stripeProvider.createPaymentIntent(request, convertedAmount);
                case PAYPAL -> paypalProvider.createPaymentIntent(request, convertedAmount);
                case RAZORPAY -> razorpayProvider.createPaymentIntent(request, convertedAmount);
                case ESEWA -> esewaProvider.createPaymentIntent(request, convertedAmount);
                case KHALTI -> khaltiProvider.createPaymentIntent(request, convertedAmount);
                default -> throw new UnsupportedOperationException("Gateway not supported: " + gateway);
            };

            // Store payment intent details
            storePaymentIntent(result, request, gateway);

            log.info("Payment intent created: {} with gateway {}", result.getPaymentIntentId(), gateway);
            return result;

        } catch (Exception e) {
            log.error("Failed to create payment intent for country {}: {}", request.country(), e.getMessage());
            throw new PaymentException("Payment gateway error: " + e.getMessage(), e);
        }
    }

    /**
     * Process payment confirmation from webhook.
     */
    public PaymentConfirmationResult confirmPayment(PaymentWebhookData webhookData) {
        log.info("Processing payment confirmation: {}", webhookData.getPaymentIntentId());

        try {
            // Verify webhook authenticity
            verifyWebhookSignature(webhookData);

            // Update payment status
            PaymentRecord payment = paymentRepository.findByPaymentIntentId(webhookData.getPaymentIntentId())
                .orElseThrow(() -> new PaymentException("Payment not found: " + webhookData.getPaymentIntentId()));

            // Process based on gateway
            PaymentConfirmationResult result = switch (payment.getGateway()) {
                case STRIPE -> stripeProvider.confirmPayment(webhookData);
                case PAYPAL -> paypalProvider.confirmPayment(webhookData);
                case RAZORPAY -> razorpayProvider.confirmPayment(webhookData);
                case ESEWA -> esewaProvider.confirmPayment(webhookData);
                case KHALTI -> khaltiProvider.confirmPayment(webhookData);
                default -> throw new UnsupportedOperationException("Gateway not supported: " + payment.getGateway());
            };

            // Update local payment status
            updatePaymentStatus(payment, result);

            // Trigger game participant confirmation if successful
            if (result.isSuccessful()) {
                gameParticipationService.confirmPayment(payment.getGameId(), payment.getUserId());
            }

            return result;

        } catch (Exception e) {
            log.error("Error confirming payment {}: {}", webhookData.getPaymentIntentId(), e.getMessage());
            throw new PaymentException("Payment confirmation failed", e);
        }
    }

    /**
     * Get available payment methods for a country.
     */
    public List<PaymentMethodInfo> getAvailablePaymentMethods(String countryCode) {
        CountryPaymentConfig config = getCountryConfig(countryCode);
        return config.getAvailablePaymentMethods();
    }

    /**
     * Get real-time exchange rate for currency conversion.
     */
    public ExchangeRateInfo getExchangeRate(String fromCurrency, String toCurrency) {
        return exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
    }

    /**
     * Process refund with appropriate gateway.
     */
    public RefundResult processRefund(RefundRequest request) {
        log.info("Processing refund for payment: {}", request.getPaymentIntentId());

        PaymentRecord payment = paymentRepository.findByPaymentIntentId(request.getPaymentIntentId())
            .orElseThrow(() -> new PaymentException("Payment not found"));

        return switch (payment.getGateway()) {
            case STRIPE -> stripeProvider.processRefund(request);
            case PAYPAL -> paypalProvider.processRefund(request);
            case RAZORPAY -> razorpayProvider.processRefund(request);
            case ESEWA -> esewaProvider.processRefund(request);
            case KHALTI -> khaltiProvider.processRefund(request);
            default -> throw new UnsupportedOperationException("Refunds not supported for: " + payment.getGateway());
        };
    }

    // ===== PRIVATE HELPER METHODS =====

    private CountryPaymentConfig getCountryConfig(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> CountryPaymentConfig.builder()
                .countryCode("US")
                .primaryCurrency("USD")
                .supportedGateways(List.of(PaymentGateway.STRIPE, PaymentGateway.PAYPAL))
                .preferredGateway(PaymentGateway.STRIPE)
                .availablePaymentMethods(List.of(
                    new PaymentMethodInfo("card", "Credit/Debit Card", true),
                    new PaymentMethodInfo("apple_pay", "Apple Pay", true),
                    new PaymentMethodInfo("google_pay", "Google Pay", true),
                    new PaymentMethodInfo("ach", "Bank Transfer", false)
                ))
                .taxRate(BigDecimal.valueOf(0.0875)) // Average US sales tax
                .build();

            case "CA" -> CountryPaymentConfig.builder()
                .countryCode("CA")
                .primaryCurrency("CAD")
                .supportedGateways(List.of(PaymentGateway.STRIPE, PaymentGateway.PAYPAL))
                .preferredGateway(PaymentGateway.STRIPE)
                .availablePaymentMethods(List.of(
                    new PaymentMethodInfo("card", "Credit/Debit Card", true),
                    new PaymentMethodInfo("interac", "Interac e-Transfer", false),
                    new PaymentMethodInfo("apple_pay", "Apple Pay", true),
                    new PaymentMethodInfo("google_pay", "Google Pay", true)
                ))
                .taxRate(BigDecimal.valueOf(0.13)) // Average Canadian tax (HST/GST+PST)
                .build();

            case "MX" -> CountryPaymentConfig.builder()
                .countryCode("MX")
                .primaryCurrency("MXN")
                .supportedGateways(List.of(PaymentGateway.STRIPE, PaymentGateway.PAYPAL))
                .preferredGateway(PaymentGateway.STRIPE)
                .availablePaymentMethods(List.of(
                    new PaymentMethodInfo("card", "Tarjeta de Crédito/Débito", true),
                    new PaymentMethodInfo("oxxo", "OXXO", false),
                    new PaymentMethodInfo("spei", "SPEI", false),
                    new PaymentMethodInfo("bank_transfer", "Transferencia Bancaria", false)
                ))
                .taxRate(BigDecimal.valueOf(0.16)) // Mexico IVA
                .build();

            case "IN" -> CountryPaymentConfig.builder()
                .countryCode("IN")
                .primaryCurrency("INR")
                .supportedGateways(List.of(PaymentGateway.RAZORPAY, PaymentGateway.STRIPE))
                .preferredGateway(PaymentGateway.RAZORPAY)
                .availablePaymentMethods(List.of(
                    new PaymentMethodInfo("upi", "UPI", true),
                    new PaymentMethodInfo("card", "Credit/Debit Card", true),
                    new PaymentMethodInfo("netbanking", "Net Banking", false),
                    new PaymentMethodInfo("wallet", "Digital Wallet", true),
                    new PaymentMethodInfo("paytm", "Paytm", true),
                    new PaymentMethodInfo("phonepe", "PhonePe", true),
                    new PaymentMethodInfo("gpay", "Google Pay", true)
                ))
                .taxRate(BigDecimal.valueOf(0.18)) // India GST
                .build();

            case "NP" -> CountryPaymentConfig.builder()
                .countryCode("NP")
                .primaryCurrency("NPR")
                .supportedGateways(List.of(PaymentGateway.ESEWA, PaymentGateway.KHALTI))
                .preferredGateway(PaymentGateway.ESEWA)
                .availablePaymentMethods(List.of(
                    new PaymentMethodInfo("esewa", "eSewa", true),
                    new PaymentMethodInfo("khalti", "Khalti", true),
                    new PaymentMethodInfo("ime_pay", "IME Pay", true),
                    new PaymentMethodInfo("mobile_banking", "Mobile Banking", false),
                    new PaymentMethodInfo("bank_transfer", "Bank Transfer", false)
                ))
                .taxRate(BigDecimal.valueOf(0.13)) // Nepal VAT
                .build();

            default -> throw new UnsupportedOperationException("Country not supported: " + countryCode);
        };
    }

    private PaymentGateway selectPaymentGateway(PaymentRequest request, CountryPaymentConfig config) {
        // Use user's preferred gateway if available and supported
        if (request.preferredGateway() != null && config.getSupportedGateways().contains(request.preferredGateway())) {
            return request.preferredGateway();
        }

        // Use country's preferred gateway
        return config.getPreferredGateway();
    }

    private PaymentAmount convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return PaymentAmount.builder()
                .amount(amount)
                .currency(toCurrency)
                .originalAmount(amount)
                .originalCurrency(fromCurrency)
                .exchangeRate(BigDecimal.ONE)
                .build();
        }

        ExchangeRateInfo exchangeRate = exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
        BigDecimal convertedAmount = amount.multiply(exchangeRate.getRate());

        return PaymentAmount.builder()
            .amount(convertedAmount)
            .currency(toCurrency)
            .originalAmount(amount)
            .originalCurrency(fromCurrency)
            .exchangeRate(exchangeRate.getRate())
            .exchangeRateTimestamp(exchangeRate.getTimestamp())
            .build();
    }

    private void validatePaymentRequest(PaymentRequest request) {
        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        if (request.amount().compareTo(BigDecimal.valueOf(10000)) > 0) {
            throw new IllegalArgumentException("Payment amount exceeds maximum limit");
        }

        Set<String> supportedCountries = Set.of("US", "CA", "MX", "IN", "NP");
        if (!supportedCountries.contains(request.country().toUpperCase())) {
            throw new UnsupportedOperationException("Country not supported: " + request.country());
        }

        if (request.userId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (request.gameId() == null) {
            throw new IllegalArgumentException("Game ID is required");
        }
    }

    private void storePaymentIntent(PaymentIntentResult result, PaymentRequest request, PaymentGateway gateway) {
        PaymentRecord record = PaymentRecord.builder()
            .paymentIntentId(result.getPaymentIntentId())
            .gameId(request.gameId())
            .userId(request.userId())
            .amount(result.getAmount())
            .currency(result.getCurrency())
            .gateway(gateway)
            .country(request.country())
            .status(PaymentStatus.PENDING)
            .createdAt(OffsetDateTime.now())
            .build();

        paymentRepository.save(record);
    }

    private void verifyWebhookSignature(PaymentWebhookData webhookData) {
        // Implementation would verify webhook signatures based on gateway
        // Each payment provider has its own signature verification method
        switch (webhookData.getGateway()) {
            case STRIPE -> stripeProvider.verifyWebhookSignature(webhookData);
            case PAYPAL -> paypalProvider.verifyWebhookSignature(webhookData);
            case RAZORPAY -> razorpayProvider.verifyWebhookSignature(webhookData);
            case ESEWA -> esewaProvider.verifyWebhookSignature(webhookData);
            case KHALTI -> khaltiProvider.verifyWebhookSignature(webhookData);
            default -> log.warn("Webhook signature verification not implemented for: {}", webhookData.getGateway());
        }
    }

    private void updatePaymentStatus(PaymentRecord payment, PaymentConfirmationResult result) {
        payment.setStatus(result.isSuccessful() ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        payment.setCompletedAt(OffsetDateTime.now());
        payment.setGatewayTransactionId(result.getTransactionId());
        payment.setGatewayResponse(result.getGatewayResponse());
        paymentRepository.save(payment);
    }

    // ===== PAYMENT GATEWAYS ENUM =====

    public enum PaymentGateway {
        STRIPE("Stripe", "Global payment processing", Set.of("US", "CA", "MX")),
        PAYPAL("PayPal", "Global digital payments", Set.of("US", "CA", "MX")),
        RAZORPAY("Razorpay", "India's leading payment gateway", Set.of("IN")),
        ESEWA("eSewa", "Nepal's digital wallet", Set.of("NP")),
        KHALTI("Khalti", "Nepal digital payment", Set.of("NP"));

        private final String displayName;
        private final String description;
        private final Set<String> supportedCountries;

        PaymentGateway(String displayName, String description, Set<String> supportedCountries) {
            this.displayName = displayName;
            this.description = description;
            this.supportedCountries = supportedCountries;
        }

        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
        public Set<String> getSupportedCountries() { return supportedCountries; }

        public boolean supportsCountry(String countryCode) {
            return supportedCountries.contains(countryCode.toUpperCase());
        }
    }

    // ===== SUPPORTING CLASSES =====

    @Data
    @Builder
    public static class CountryPaymentConfig {
        private String countryCode;
        private String primaryCurrency;
        private List<PaymentGateway> supportedGateways;
        private PaymentGateway preferredGateway;
        private List<PaymentMethodInfo> availablePaymentMethods;
        private BigDecimal taxRate;
        private boolean requiresKyc;
        private BigDecimal maxTransactionAmount;
        private BigDecimal minTransactionAmount;
    }

    @Data
    @Builder
    public static class PaymentMethodInfo {
        private String methodId;
        private String displayName;
        private boolean isInstant;
        private BigDecimal processingFee;
        private String description;
        private String iconUrl;

        public PaymentMethodInfo(String methodId, String displayName, boolean isInstant) {
            this.methodId = methodId;
            this.displayName = displayName;
            this.isInstant = isInstant;
        }
    }

    @Data
    @Builder
    public static class PaymentAmount {
        private BigDecimal amount;
        private String currency;
        private BigDecimal originalAmount;
        private String originalCurrency;
        private BigDecimal exchangeRate;
        private OffsetDateTime exchangeRateTimestamp;
    }

    public record PaymentRequest(
        Long gameId,
        Long userId,
        BigDecimal amount,
        String currency,
        String country,
        String paymentMethodId,
        PaymentGateway preferredGateway,
        Map<String, String> metadata
    ) {}

    @Data
    @Builder
    public static class PaymentIntentResult {
        private String paymentIntentId;
        private BigDecimal amount;
        private String currency;
        private PaymentGateway gateway;
        private String clientSecret;
        private String paymentUrl;
        private Map<String, Object> gatewayData;
        private OffsetDateTime expiresAt;
    }

    @Data
    @Builder  
    public static class PaymentConfirmationResult {
        private boolean isSuccessful;
        private String transactionId;
        private BigDecimal amountReceived;
        private String currency;
        private OffsetDateTime completedAt;
        private String gatewayResponse;
        private Map<String, Object> metadata;
    }

    public static class PaymentException extends RuntimeException {
        public PaymentException(String message) {
            super(message);
        }

        public PaymentException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    // ===== CURRENCY CODES =====

    public enum SupportedCurrency {
        USD("US Dollar", "$", "United States"),
        CAD("Canadian Dollar", "C$", "Canada"),
        MXN("Mexican Peso", "$", "Mexico"),
        INR("Indian Rupee", "₹", "India"),
        NPR("Nepalese Rupee", "Rs", "Nepal");

        private final String displayName;
        private final String symbol;
        private final String country;

        SupportedCurrency(String displayName, String symbol, String country) {
            this.displayName = displayName;
            this.symbol = symbol;
            this.country = country;
        }

        public String getDisplayName() { return displayName; }
        public String getSymbol() { return symbol; }
        public String getCountry() { return country; }
    }
}