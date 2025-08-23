package com.bmessi.pickupsportsapp.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

@Component("mail")
public class MailHealthIndicator implements HealthIndicator {

    private final JavaMailSender mailSender;

    public MailHealthIndicator(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public Health health() {
        try {
            if (mailSender instanceof JavaMailSenderImpl impl) {
                impl.testConnection(); // may throw on failure
            }
            return Health.up().build();
        } catch (Exception e) {
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }
}
