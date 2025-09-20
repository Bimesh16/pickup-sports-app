package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;

public class BadgeDTO {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private OffsetDateTime earnedAt;

    public BadgeDTO() {}

    public BadgeDTO(Long id, String name, String description, String iconUrl, OffsetDateTime earnedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.earnedAt = earnedAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public OffsetDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(OffsetDateTime earnedAt) { this.earnedAt = earnedAt; }
}
