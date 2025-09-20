package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;

public class SecuritySettingsDTO {
    private boolean mfaEnabled;
    private boolean loginNotifications;
    private boolean suspiciousActivityAlerts;
    private OffsetDateTime lastPasswordChange;

    public SecuritySettingsDTO() {}

    public SecuritySettingsDTO(boolean mfaEnabled, boolean loginNotifications, boolean suspiciousActivityAlerts, OffsetDateTime lastPasswordChange) {
        this.mfaEnabled = mfaEnabled;
        this.loginNotifications = loginNotifications;
        this.suspiciousActivityAlerts = suspiciousActivityAlerts;
        this.lastPasswordChange = lastPasswordChange;
    }

    // Getters and setters
    public boolean isMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }

    public boolean isLoginNotifications() { return loginNotifications; }
    public void setLoginNotifications(boolean loginNotifications) { this.loginNotifications = loginNotifications; }

    public boolean isSuspiciousActivityAlerts() { return suspiciousActivityAlerts; }
    public void setSuspiciousActivityAlerts(boolean suspiciousActivityAlerts) { this.suspiciousActivityAlerts = suspiciousActivityAlerts; }

    public OffsetDateTime getLastPasswordChange() { return lastPasswordChange; }
    public void setLastPasswordChange(OffsetDateTime lastPasswordChange) { this.lastPasswordChange = lastPasswordChange; }
}
