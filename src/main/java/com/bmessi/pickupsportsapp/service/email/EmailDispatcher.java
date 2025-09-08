package com.bmessi.pickupsportsapp.service.email;

import com.bmessi.pickupsportsapp.dto.EmailJob;
import com.bmessi.pickupsportsapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Locale;

/**
 * Consumes email jobs from the queue and dispatches them via the EmailService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailDispatcher {

    private final Optional<EmailService> emailService;

    @RabbitListener(queues = "${emails.queue:emails.queue}")
    public void dispatch(EmailJob job) {
        try {
            emailService.ifPresent(es -> {
                try {
                    Locale locale = job.locale() == null ? Locale.getDefault() : job.locale();
                    switch (job.type()) {
                        case "WELCOME" -> es.sendWelcomeEmailNow(job.to());
                        case "VERIFY" -> es.sendVerificationEmailNow(job.to(), job.link(), locale);
                        case "RESET" -> es.sendPasswordResetEmailNow(job.to(), job.link(), locale);
                        default -> log.warn("Unknown email job type {}", job.type());
                    }
                } catch (Exception e) {
                    log.error("Failed to process email job", e);
                }
            });
        } catch (Exception e) {
            log.error("Email job processing failed (no EmailService available)", e);
        }
    }
}
