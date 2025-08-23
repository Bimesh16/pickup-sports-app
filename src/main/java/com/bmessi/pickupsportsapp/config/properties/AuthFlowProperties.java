package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth")
public class AuthFlowProperties {

    /**
     * If true, unverified users cannot log in until they verify their email.
     */
    private boolean verificationRequired = false;

    /**
     * Verification token time-to-live (hours).
     */
    private int verificationTtlHours = 24;

    /**
     * Password reset token time-to-live (hours).
     */
    private int resetTtlHours = 2;

    /**
     * Base application URL used to construct verification/reset links, e.g. https://app.example.com
     */
    private String appUrl = "http://localhost:8080";

    // Password policy
    private int passwordMinLength = 8;
    private boolean requireLetter = true;
    private boolean requireDigit = true;
    private java.util.List<String> passwordBlacklist = java.util.List.of(
            "password","12345678","qwerty","11111111","letmein","welcome","admin","iloveyou","abc123","passw0rd"
    );

    // Rate limits for reset requests
    private int resetMaxPerUserPerMinute = 3;
    private int resetMaxPerIpPerMinute = 10;

    public boolean isVerificationRequired() {
        return verificationRequired;
    }

    public void setVerificationRequired(boolean verificationRequired) {
        this.verificationRequired = verificationRequired;
    }

    public int getVerificationTtlHours() {
        return verificationTtlHours;
    }

    public void setVerificationTtlHours(int verificationTtlHours) {
        this.verificationTtlHours = verificationTtlHours;
    }

    public int getResetTtlHours() {
        return resetTtlHours;
    }

    public void setResetTtlHours(int resetTtlHours) {
        this.resetTtlHours = resetTtlHours;
    }

    public String getAppUrl() {
        return appUrl;
    }

    public void setAppUrl(String appUrl) {
        this.appUrl = appUrl;
    }

    // Change-email policy
    private boolean changeEmailInvalidateSessions = true;

    public boolean isChangeEmailInvalidateSessions() {
        return changeEmailInvalidateSessions;
    }

    public void setChangeEmailInvalidateSessions(boolean changeEmailInvalidateSessions) {
        this.changeEmailInvalidateSessions = changeEmailInvalidateSessions;
    }

    public int getPasswordMinLength() {
        return passwordMinLength;
    }

    public void setPasswordMinLength(int passwordMinLength) {
        this.passwordMinLength = passwordMinLength;
    }

    public boolean isRequireLetter() {
        return requireLetter;
    }

    public void setRequireLetter(boolean requireLetter) {
        this.requireLetter = requireLetter;
    }

    public boolean isRequireDigit() {
        return requireDigit;
    }

    public void setRequireDigit(boolean requireDigit) {
        this.requireDigit = requireDigit;
    }

    public int getResetMaxPerUserPerMinute() {
        return resetMaxPerUserPerMinute;
    }

    public void setResetMaxPerUserPerMinute(int resetMaxPerUserPerMinute) {
        this.resetMaxPerUserPerMinute = resetMaxPerUserPerMinute;
    }

    public int getResetMaxPerIpPerMinute() {
        return resetMaxPerIpPerMinute;
    }

    public void setResetMaxPerIpPerMinute(int resetMaxPerIpPerMinute) {
        this.resetMaxPerIpPerMinute = resetMaxPerIpPerMinute;
    }

    public java.util.List<String> getPasswordBlacklist() {
        return passwordBlacklist;
    }

    public void setPasswordBlacklist(java.util.List<String> passwordBlacklist) {
        this.passwordBlacklist = passwordBlacklist;
    }
}
