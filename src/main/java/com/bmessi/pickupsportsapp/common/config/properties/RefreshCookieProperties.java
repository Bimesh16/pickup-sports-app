package com.bmessi.pickupsportsapp.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.refresh-cookie")
public class RefreshCookieProperties {

    private boolean enabled = true;
    private String name = "refreshToken";
    private String path = "/";
    private String domain;
    private String sameSite = "Lax";
    private Boolean secure = null;
    private boolean httpOnly = true;
    private int maxAgeDays = 14;

    public boolean isEnabled() {
        return enabled;
    }
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = (name == null || name.isBlank()) ? this.name : name.trim();
    }

    public String getPath() {
        return path;
    }
    public void setPath(String path) {
        this.path = (path == null || path.isBlank()) ? "/" : path.trim();
    }

    public String getDomain() {
        return domain;
    }
    public void setDomain(String domain) {
        this.domain = (domain == null || domain.isBlank()) ? null : domain.trim();
    }

    public String getSameSite() {
        return sameSite;
    }
    public void setSameSite(String sameSite) {
        this.sameSite = (sameSite == null || sameSite.isBlank()) ? this.sameSite : sameSite.trim();
    }

    public Boolean getSecure() {
        return secure;
    }
    public void setSecure(Boolean secure) {
        this.secure = secure;
    }

    public boolean isHttpOnly() {
        return httpOnly;
    }
    public void setHttpOnly(boolean httpOnly) {
        this.httpOnly = httpOnly;
    }

    public int getMaxAgeDays() {
        return maxAgeDays;
    }
    public void setMaxAgeDays(int maxAgeDays) {
        this.maxAgeDays = maxAgeDays;
    }
}

