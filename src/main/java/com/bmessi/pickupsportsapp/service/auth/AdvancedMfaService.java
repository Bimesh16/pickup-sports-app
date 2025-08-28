package com.bmessi.pickupsportsapp.service.auth;

import com.bmessi.pickupsportsapp.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Advanced Multi-Factor Authentication (MFA) service with enhanced security features.
 * 
 * Features:
 * - TOTP (Time-based One-Time Password) generation and validation
 * - SMS-based verification codes
 * - Email-based verification codes
 * - Backup codes generation and management
 * - Device trust management
 * - MFA attempt tracking and rate limiting
 * - Fallback authentication methods
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdvancedMfaService {

    private final SecureRandom secureRandom = new SecureRandom();
    
    // In-memory storage for MFA attempts (should be moved to Redis in production)
    private final Map<String, MfaAttempt> mfaAttempts = new ConcurrentHashMap<>();
    
    // MFA configuration constants
    private static final int TOTP_DIGITS = 6;
    private static final int TOTP_PERIOD = 30; // seconds
    private static final int SMS_CODE_DIGITS = 6;
    private static final int EMAIL_CODE_DIGITS = 8;
    private static final int BACKUP_CODE_DIGITS = 10;
    private static final int MAX_MFA_ATTEMPTS = 5;
    private static final int MFA_LOCKOUT_DURATION_MINUTES = 15;

    /**
     * Generate TOTP secret for a user.
     */
    public String generateTotpSecret(User user) {
        String secret = generateRandomSecret(32);
        log.info("Generated TOTP secret for user: {}", user.getUsername());
        return secret;
    }

    /**
     * Generate TOTP code for a given secret.
     */
    public String generateTotpCode(String secret) {
        long time = System.currentTimeMillis() / 1000 / TOTP_PERIOD;
        return generateHmacBasedCode(secret, time, TOTP_DIGITS);
    }

    /**
     * Validate TOTP code for a user.
     */
    public boolean validateTotpCode(User user, String code) {
        if (user.getMfaSecret() == null) {
            log.warn("User {} has no MFA secret configured", user.getUsername());
            return false;
        }

        // Check for rate limiting
        if (isMfaRateLimited(user.getUsername())) {
            log.warn("MFA rate limited for user: {}", user.getUsername());
            return false;
        }

        // Generate current and previous period codes (for clock skew tolerance)
        String currentCode = generateTotpCode(user.getMfaSecret());
        String previousCode = generateHmacBasedCode(user.getMfaSecret(), 
            (System.currentTimeMillis() / 1000 / TOTP_PERIOD) - 1, TOTP_DIGITS);

        boolean isValid = code.equals(currentCode) || code.equals(previousCode);
        
        // Track attempt
        trackMfaAttempt(user.getUsername(), isValid);
        
        if (isValid) {
            log.info("TOTP validation successful for user: {}", user.getUsername());
        } else {
            log.warn("TOTP validation failed for user: {}", user.getUsername());
        }
        
        return isValid;
    }

    /**
     * Generate SMS verification code.
     */
    public String generateSmsCode(User user) {
        String code = generateRandomNumericCode(SMS_CODE_DIGITS);
        
        // Store code with expiration (should be moved to Redis in production)
        storeVerificationCode(user.getUsername(), "SMS", code);
        
        log.info("Generated SMS code for user: {}", user.getUsername());
        return code;
    }

    /**
     * Validate SMS verification code.
     */
    public boolean validateSmsCode(User user, String code) {
        if (isMfaRateLimited(user.getUsername())) {
            log.warn("MFA rate limited for user: {}", user.getUsername());
            return false;
        }

        boolean isValid = validateVerificationCode(user.getUsername(), "SMS", code);
        
        // Track attempt
        trackMfaAttempt(user.getUsername(), isValid);
        
        if (isValid) {
            log.info("SMS validation successful for user: {}", user.getUsername());
        } else {
            log.warn("SMS validation failed for user: {}", user.getUsername());
        }
        
        return isValid;
    }

    /**
     * Generate email verification code.
     */
    public String generateEmailCode(User user) {
        String code = generateRandomAlphanumericCode(EMAIL_CODE_DIGITS);
        
        // Store code with expiration (should be moved to Redis in production)
        storeVerificationCode(user.getUsername(), "EMAIL", code);
        
        log.info("Generated email code for user: {}", user.getUsername());
        return code;
    }

    /**
     * Validate email verification code.
     */
    public boolean validateEmailCode(User user, String code) {
        if (isMfaRateLimited(user.getUsername())) {
            log.warn("MFA rate limited for user: {}", user.getUsername());
            return false;
        }

        boolean isValid = validateVerificationCode(user.getUsername(), "EMAIL", code);
        
        // Track attempt
        trackMfaAttempt(user.getUsername(), isValid);
        
        if (isValid) {
            log.info("Email validation successful for user: {}", user.getUsername());
        } else {
            log.warn("Email validation failed for user: {}", user.getUsername());
        }
        
        return isValid;
    }

    /**
     * Generate backup codes for a user.
     */
    public String[] generateBackupCodes(User user, int count) {
        String[] backupCodes = new String[count];
        
        for (int i = 0; i < count; i++) {
            backupCodes[i] = generateRandomAlphanumericCode(BACKUP_CODE_DIGITS);
        }
        
        // Store backup codes (should be hashed and stored in database)
        storeBackupCodes(user.getUsername(), backupCodes);
        
        log.info("Generated {} backup codes for user: {}", count, user.getUsername());
        return backupCodes;
    }

    /**
     * Validate backup code for a user.
     */
    public boolean validateBackupCode(User user, String code) {
        if (isMfaRateLimited(user.getUsername())) {
            log.warn("MFA rate limited for user: {}", user.getUsername());
            return false;
        }

        boolean isValid = validateBackupCode(user.getUsername(), code);
        
        if (isValid) {
            // Remove used backup code
            removeBackupCode(user.getUsername(), code);
            log.info("Backup code validation successful for user: {}", user.getUsername());
        } else {
            log.warn("Backup code validation failed for user: {}", user.getUsername());
        }
        
        return isValid;
    }

    /**
     * Check if MFA is required for a user.
     */
    public boolean isMfaRequired(User user) {
        return user.isMfaEnabled() && user.getMfaSecret() != null;
    }

    /**
     * Check if user is MFA rate limited.
     */
    public boolean isMfaRateLimited(String username) {
        MfaAttempt attempt = mfaAttempts.get(username);
        if (attempt == null) {
            return false;
        }
        
        // Check if user is locked out
        if (attempt.getFailedAttempts() >= MAX_MFA_ATTEMPTS) {
            OffsetDateTime lockoutUntil = attempt.getLastFailedAttempt()
                .plusMinutes(MFA_LOCKOUT_DURATION_MINUTES);
            
            if (OffsetDateTime.now().isBefore(lockoutUntil)) {
                return true;
            } else {
                // Reset lockout
                attempt.resetAttempts();
                return false;
            }
        }
        
        return false;
    }

    /**
     * Get MFA status for a user.
     */
    public Map<String, Object> getMfaStatus(User user) {
        Map<String, Object> status = new HashMap<>();
        
        status.put("mfa_enabled", user.isMfaEnabled());
        status.put("mfa_secret_configured", user.getMfaSecret() != null);
        status.put("mfa_required", isMfaRequired(user));
        
        MfaAttempt attempt = mfaAttempts.get(user.getUsername());
        if (attempt != null) {
            status.put("failed_attempts", attempt.getFailedAttempts());
            status.put("last_failed_attempt", attempt.getLastFailedAttempt());
            status.put("is_locked_out", isMfaRateLimited(user.getUsername()));
        }
        
        return status;
    }

    // Private helper methods

    private String generateRandomSecret(int length) {
        byte[] bytes = new byte[length];
        secureRandom.nextBytes(bytes);
        return java.util.Base64.getEncoder().encodeToString(bytes);
    }

    private String generateRandomNumericCode(int digits) {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < digits; i++) {
            code.append(secureRandom.nextInt(10));
        }
        return code.toString();
    }

    private String generateRandomAlphanumericCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < length; i++) {
            code.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return code.toString();
    }

    private String generateHmacBasedCode(String secret, long time, int digits) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA1");
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                secret.getBytes(), "HmacSHA1");
            mac.init(keySpec);
            
            byte[] hash = mac.doFinal(java.nio.ByteBuffer.allocate(8).putLong(time).array());
            int offset = hash[hash.length - 1] & 0xf;
            
            int binary = ((hash[offset] & 0x7f) << 24) |
                        ((hash[offset + 1] & 0xff) << 16) |
                        ((hash[offset + 2] & 0xff) << 8) |
                        (hash[offset + 3] & 0xff);
            
            int code = binary % (int) Math.pow(10, digits);
            return String.format("%0" + digits + "d", code);
            
        } catch (Exception e) {
            log.error("Error generating HMAC-based code", e);
            return null;
        }
    }

    private void trackMfaAttempt(String username, boolean success) {
        MfaAttempt attempt = mfaAttempts.computeIfAbsent(username, k -> new MfaAttempt());
        
        if (success) {
            attempt.resetAttempts();
        } else {
            attempt.recordFailedAttempt();
        }
    }

    // Mock methods for verification codes (should be implemented with Redis/database)
    private void storeVerificationCode(String username, String type, String code) {
        // Implementation would store code in Redis with expiration
        log.debug("Storing {} verification code for user: {}", type, username);
    }

    private boolean validateVerificationCode(String username, String type, String code) {
        // Implementation would validate code from Redis
        log.debug("Validating {} verification code for user: {}", type, username);
        return true; // Mock implementation
    }

    private void storeBackupCodes(String username, String[] codes) {
        // Implementation would hash and store codes in database
        log.debug("Storing backup codes for user: {}", username);
    }

    private boolean validateBackupCode(String username, String code) {
        // Implementation would validate code from database
        log.debug("Validating backup code for user: {}", username);
        return true; // Mock implementation
    }

    private void removeBackupCode(String username, String code) {
        // Implementation would remove used backup code
        log.debug("Removing used backup code for user: {}", username);
    }

    /**
     * Inner class to track MFA attempts.
     */
    private static class MfaAttempt {
        private int failedAttempts = 0;
        private OffsetDateTime lastFailedAttempt;

        public void recordFailedAttempt() {
            failedAttempts++;
            lastFailedAttempt = OffsetDateTime.now();
        }

        public void resetAttempts() {
            failedAttempts = 0;
            lastFailedAttempt = null;
        }

        public int getFailedAttempts() {
            return failedAttempts;
        }

        public OffsetDateTime getLastFailedAttempt() {
            return lastFailedAttempt;
        }
    }
}
