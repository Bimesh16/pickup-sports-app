package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Unified login policy and rate limit configuration.
 * Prefix: auth.login
 */
@Component
@ConfigurationProperties(prefix = "auth.login")
public class LoginPolicyProperties {

    // Admin MFA policy
    private boolean requireMfaForAdmin = true;
    private int adminMfaAlertWindowMinutes = 60;

    // Rate limiting / lockout (optional)
    private int maxFailuresPerUser = 5;
    private int maxFailuresPerIp = 30;
    private int lockoutMinutes = 15;
    private int ipWindowMinutes = 10;
    private int requestsPerIpPerMinute = 60;
    private boolean distributedEnabled = false;

    // Getters/setters

    public boolean isRequireMfaForAdmin() {
        return requireMfaForAdmin;
    }

    public void setRequireMfaForAdmin(boolean requireMfaForAdmin) {
        this.requireMfaForAdmin = requireMfaForAdmin;
    }

    public int getAdminMfaAlertWindowMinutes() {
        return adminMfaAlertWindowMinutes;
    }

    public void setAdminMfaAlertWindowMinutes(int adminMfaAlertWindowMinutes) {
        this.adminMfaAlertWindowMinutes = adminMfaAlertWindowMinutes;
    }

    public int getMaxFailuresPerUser() {
        return maxFailuresPerUser;
    }

    public void setMaxFailuresPerUser(int maxFailuresPerUser) {
        this.maxFailuresPerUser = maxFailuresPerUser;
    }

    public int getMaxFailuresPerIp() {
        return maxFailuresPerIp;
    }

    public void setMaxFailuresPerIp(int maxFailuresPerIp) {
        this.maxFailuresPerIp = maxFailuresPerIp;
    }

    public int getLockoutMinutes() {
        return lockoutMinutes;
    }

    public void setLockoutMinutes(int lockoutMinutes) {
        this.lockoutMinutes = lockoutMinutes;
    }

    public int getIpWindowMinutes() {
        return ipWindowMinutes;
    }

    public void setIpWindowMinutes(int ipWindowMinutes) {
        this.ipWindowMinutes = ipWindowMinutes;
    }

    public int getRequestsPerIpPerMinute() {
        return requestsPerIpPerMinute;
    }

    public void setRequestsPerIpPerMinute(int requestsPerIpPerMinute) {
        this.requestsPerIpPerMinute = requestsPerIpPerMinute;
    }

    public boolean isDistributedEnabled() {
        return distributedEnabled;
    }

    public void setDistributedEnabled(boolean distributedEnabled) {
        this.distributedEnabled = distributedEnabled;
    }
}
