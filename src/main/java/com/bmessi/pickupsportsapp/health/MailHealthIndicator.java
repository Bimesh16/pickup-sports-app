package com.bmessi.pickupsportsapp.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("mail")
public class MailHealthIndicator implements HealthIndicator {

    private final Optional<JavaMailSender> mail;

    public MailHealthIndicator(Optional<JavaMailSender> mail) {
        this.mail = mail;
    }

    @Override
    public Health health() {
        if (mail.isEmpty()) {
            return Health.unknown()
                    .withDetail("available", false)
                    .withDetail("reason", "mail-sender-missing")
                    .build();
        }
        try {
            JavaMailSender sender = mail.get();
            if (sender instanceof JavaMailSenderImpl impl) {
                // Attempt an actual connection if configuration is present
                impl.testConnection(); // may throw on failure
                return Health.up()
                        .withDetail("host", impl.getHost())
                        .withDetail("port", impl.getPort())
                        .build();
            } else {
                // Lightweight check: able to create a message object
                sender.createMimeMessage();
                return Health.up().build();
            }
        } catch (Exception e) {
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }
}
