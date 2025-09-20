package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class TeamDTO {
    private Long id;
    private String name;
    private String description;
    private String sport;
    private List<String> members;
    private OffsetDateTime createdAt;

    public TeamDTO() {}

    public TeamDTO(Long id, String name, String description, String sport, List<String> members, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sport = sport;
        this.members = members;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public List<String> getMembers() { return members; }
    public void setMembers(List<String> members) { this.members = members; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
