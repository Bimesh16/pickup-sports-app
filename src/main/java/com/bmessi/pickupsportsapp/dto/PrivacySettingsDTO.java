package com.bmessi.pickupsportsapp.dto;

public class PrivacySettingsDTO {
    private boolean profileVisible;
    private boolean locationVisible;
    private boolean contactVisible;
    private boolean statsVisible;

    public PrivacySettingsDTO() {}

    public PrivacySettingsDTO(boolean profileVisible, boolean locationVisible, boolean contactVisible, boolean statsVisible) {
        this.profileVisible = profileVisible;
        this.locationVisible = locationVisible;
        this.contactVisible = contactVisible;
        this.statsVisible = statsVisible;
    }

    // Getters and setters
    public boolean isProfileVisible() { return profileVisible; }
    public void setProfileVisible(boolean profileVisible) { this.profileVisible = profileVisible; }

    public boolean isLocationVisible() { return locationVisible; }
    public void setLocationVisible(boolean locationVisible) { this.locationVisible = locationVisible; }

    public boolean isContactVisible() { return contactVisible; }
    public void setContactVisible(boolean contactVisible) { this.contactVisible = contactVisible; }

    public boolean isStatsVisible() { return statsVisible; }
    public void setStatsVisible(boolean statsVisible) { this.statsVisible = statsVisible; }
}
