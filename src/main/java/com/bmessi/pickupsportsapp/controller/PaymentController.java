package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.PaymentService;
import com.bmessi.pickupsportsapp.service.PaymentService.PaymentSummary;
import com.bmessi.pickupsportsapp.service.PaymentService.PaymentMethod;
import com.bmessi.pickupsportsapp.service.PaymentService.ExchangeRateSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentSummary> createPayment(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Long gameId = Long.valueOf(request.get("gameId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String currency = request.get("currency").toString();
            String paymentMethod = request.get("paymentMethod").toString();
            
            PaymentSummary payment = paymentService.createPayment(username, gameId, amount, currency, paymentMethod);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{paymentId}/process")
    public ResponseEntity<PaymentSummary> processPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> request) {
        try {
            String transactionId = request.get("transactionId");
            String gatewayResponse = request.get("gatewayResponse");
            
            PaymentSummary payment = paymentService.processPayment(paymentId, transactionId, gatewayResponse);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PaymentSummary>> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            List<PaymentSummary> payments = paymentService.getPaymentHistory(username, page, size);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethod>> getAvailablePaymentMethods(
            @RequestParam String country) {
        try {
            List<PaymentMethod> methods = paymentService.getAvailablePaymentMethods(country);
            return ResponseEntity.ok(methods);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/exchange-rates")
    public ResponseEntity<List<ExchangeRateSummary>> getExchangeRates(
            @RequestParam String baseCurrency) {
        try {
            List<ExchangeRateSummary> rates = paymentService.getExchangeRates(baseCurrency);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/exchange-rates/{fromCurrency}/{toCurrency}")
    public ResponseEntity<ExchangeRateSummary> getExchangeRate(
            @PathVariable String fromCurrency,
            @PathVariable String toCurrency) {
        try {
            ExchangeRateSummary rate = paymentService.getExchangeRate(fromCurrency, toCurrency);
            return ResponseEntity.ok(rate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
