package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth.login")
public class LoginPolicyProperties {

    /**
     * Maximum consecutive failed login attempts per user before lockout.
     */
    private int maxFailuresPerUser = 5;

    /**
     * Maximum failed login attempts per IP within ipWindowMinutes before temporary block.
     */
    private int maxFailuresPerIp = 30;

    /**
     * Lockout duration in minutes for a user after exceeding max failures.
     */
    private int lockoutMinutes = 15;

    /**
     * Sliding window in minutes for counting failures per IP.
     */
    private int ipWindowMinutes = 10;

    /**
     * Per-IP request limit for /auth/login within a 60s window.
     */
    private int requestsPerIpPerMinute = 60;

    private boolean distributedEnabled = false;

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
}
