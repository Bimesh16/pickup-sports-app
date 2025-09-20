package com.bmessi.pickupsportsapp.dto;

import java.util.Map;

public class SportProfileDTO {
    private String sport;
    private String skillLevel;
    private String position;
    private Map<String, Object> attributes;

    public SportProfileDTO() {}

    public SportProfileDTO(String sport, String skillLevel, String position, Map<String, Object> attributes) {
        this.sport = sport;
        this.skillLevel = skillLevel;
        this.position = position;
        this.attributes = attributes;
    }

    // Getters and setters
    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public String getSkillLevel() { return skillLevel; }
    public void setSkillLevel(String skillLevel) { this.skillLevel = skillLevel; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
}
