package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@localhost}")
    private String from;

    @Value("${app.mail.from-name:Pickup Sports}")
    private String fromName;

    /**
     * Sends a welcome email to the given user.  Runs asynchronously
     * so it doesn't block the request thread.
     */
    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackWelcomeEmail")
    public void sendWelcomeEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(String.format("%s <%s>", fromName, from));
        message.setTo(user.getUsername()); // assuming username == email
        message.setSubject("Welcome to Pickup Sports!");
        message.setText(String.format(
                "Hi %s,\n\n"
                        + "Thanks for registering on Pickup Sports. "
                        + "We’re excited to have you on board.\n\n"
                        + "Happy playing!\n\n"
                        + "The Pickup Sports Team",
                user.getUsername()
        ));
        mailSender.send(message);
        log.info("Sent welcome email to {}", user.getUsername());
    }

    // Fallback invoked after retry attempts are exhausted
    @SuppressWarnings("unused")
    private void fallbackWelcomeEmail(User user, Throwable ex) {
        log.error("Failed to send welcome email to {} after retries: {}", user.getUsername(), ex.getMessage(), ex);
        // Optionally push to a dead-letter log/store for later reprocessing
    }
}
