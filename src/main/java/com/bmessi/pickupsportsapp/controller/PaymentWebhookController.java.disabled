package com.bmessi.pickupsportsapp.controller;

import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bmessi.pickupsportsapp.service.payment.PaymentService;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handle(@RequestBody Map<String, Object> payload) {
        String type = (String) payload.get("type");
        String intentId = (String) payload.get("payment_intent_id");
        if (intentId == null) {
            return ResponseEntity.badRequest().build();
        }
        if ("payment_succeeded".equals(type)) {
            paymentService.confirmPayment(intentId);
        } else if ("payment_failed".equals(type) || "payment_refunded".equals(type)) {
            paymentService.refundPayment(intentId);
        }
        return ResponseEntity.ok().build();
    }
}
