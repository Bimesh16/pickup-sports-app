package com.bmessi.pickupsportsapp.security;

import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SecurityAuditService {

    private static final Logger log = LoggerFactory.getLogger(SecurityAuditService.class);
    private final MeterRegistry meterRegistry;

    public SecurityAuditService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void loginSuccess(String username, String ip) {
        log.info("LOGIN_SUCCESS user={} ip={}", username, ip);
        count("login_success");
    }

    public void loginFailure(String username, String ip) {
        log.info("LOGIN_FAILURE user={} ip={}", username, ip);
        count("login_failure");
    }

    public void loginLocked(String username, String ip) {
        log.info("LOGIN_LOCKED user={} ip={}", username, ip);
        count("login_locked");
    }

    public void passwordChanged(String username) {
        log.info("PASSWORD_CHANGED user={}", username);
        count("password_changed");
    }

    public void refreshIssued(String username) {
        log.info("REFRESH_ISSUED user={}", username);
        count("refresh_issued");
    }

    public void logout(String usernameOrIp) {
        log.info("LOGOUT user/ip={}", usernameOrIp);
        count("logout");
    }

    public void passwordReset(String username) {
        log.info("PASSWORD_RESET user={}", username);
        count("password_reset");
    }

    public void verificationSucceeded(String username) {
        log.info("VERIFICATION_SUCCEEDED user={}", username);
        count("verification_succeeded");
    }

    public void emailChangeRequested(String username, String newEmail) {
        log.info("EMAIL_CHANGE_REQUESTED user={} newEmail={}", username, newEmail);
        count("email_change_requested");
    }

    public void emailChangeConfirmed(String oldEmail, String newEmail) {
        log.info("EMAIL_CHANGE_CONFIRMED oldEmail={} newEmail={}", oldEmail, newEmail);
        count("email_change_confirmed");
    }

    private void count(String type) {
        try {
            meterRegistry.counter("security.events", "type", type).increment();
        } catch (Exception ignore) {}
    }
}
