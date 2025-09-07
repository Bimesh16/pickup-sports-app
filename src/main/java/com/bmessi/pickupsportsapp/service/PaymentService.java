package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Payment;
import com.bmessi.pickupsportsapp.entity.ExchangeRate;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.PaymentRepository;
import com.bmessi.pickupsportsapp.repository.ExchangeRateRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ExchangeRateRepository exchangeRateRepository;

    @Autowired
    private UserRepository userRepository;

    public PaymentSummary createPayment(String username, Long gameId, BigDecimal amount, String currency, String paymentMethod) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Payment payment = Payment.builder()
            .user(user)
            .amount(amount)
            .currency(currency)
            .paymentMethod(paymentMethod)
            .status(Payment.PaymentStatus.PENDING)
            .description("Payment for game participation")
            .build();

        Payment savedPayment = paymentRepository.save(payment);
        return convertToPaymentSummary(savedPayment);
    }

    public PaymentSummary processPayment(Long paymentId, String transactionId, String gatewayResponse) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId(transactionId);
        payment.setGatewayResponse(gatewayResponse);

        Payment savedPayment = paymentRepository.save(payment);
        return convertToPaymentSummary(savedPayment);
    }

    public List<PaymentSummary> getPaymentHistory(String username, int page, int size) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        List<Payment> payments = paymentRepository.findByUserOrderByCreatedAtDesc(user);
        return payments.stream()
            .map(this::convertToPaymentSummary)
            .collect(Collectors.toList());
    }

    public List<PaymentMethod> getAvailablePaymentMethods(String country) {
        // Mock payment methods based on country
        return List.of(
            PaymentMethod.builder()
                .id("esewa")
                .name("eSewa")
                .description("Pay with eSewa wallet")
                .isAvailable(true)
                .build(),
            PaymentMethod.builder()
                .id("khalti")
                .name("Khalti")
                .description("Pay with Khalti wallet")
                .isAvailable(true)
                .build(),
            PaymentMethod.builder()
                .id("connect_ips")
                .name("Connect IPS")
                .description("Pay with Connect IPS")
                .isAvailable(true)
                .build(),
            PaymentMethod.builder()
                .id("cash")
                .name("Cash")
                .description("Pay at venue")
                .isAvailable(true)
                .build()
        );
    }

    public List<ExchangeRateSummary> getExchangeRates(String baseCurrency) {
        List<ExchangeRate> rates = exchangeRateRepository.findByFromCurrencyAndIsActive(baseCurrency, true);
        return rates.stream()
            .map(this::convertToExchangeRateSummary)
            .collect(Collectors.toList());
    }

    public ExchangeRateSummary getExchangeRate(String fromCurrency, String toCurrency) {
        ExchangeRate rate = exchangeRateRepository.findByFromCurrencyAndToCurrencyAndIsActive(fromCurrency, toCurrency, true)
            .orElseThrow(() -> new RuntimeException("Exchange rate not found"));
        return convertToExchangeRateSummary(rate);
    }

    private PaymentSummary convertToPaymentSummary(Payment payment) {
        return PaymentSummary.builder()
            .id(payment.getId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getStatus().toString())
            .transactionId(payment.getTransactionId())
            .description(payment.getDescription())
            .createdAt(payment.getCreatedAt().toString())
            .build();
    }

    private ExchangeRateSummary convertToExchangeRateSummary(ExchangeRate rate) {
        return ExchangeRateSummary.builder()
            .fromCurrency(rate.getFromCurrency())
            .toCurrency(rate.getToCurrency())
            .rate(rate.getRate())
            .lastUpdated(rate.getLastUpdated().toString())
            .build();
    }

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class PaymentSummary {
        private Long id;
        private BigDecimal amount;
        private String currency;
        private String paymentMethod;
        private String status;
        private String transactionId;
        private String description;
        private String createdAt;
    }

    @lombok.Data
    @lombok.Builder
    public static class PaymentMethod {
        private String id;
        private String name;
        private String description;
        private boolean isAvailable;
    }

    @lombok.Data
    @lombok.Builder
    public static class ExchangeRateSummary {
        private String fromCurrency;
        private String toCurrency;
        private BigDecimal rate;
        private String lastUpdated;
    }
}
