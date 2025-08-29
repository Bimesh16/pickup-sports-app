package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_connection")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialConnection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connected_user_id", nullable = false)
    private User connectedUser;
    
    // Connection Details
    @Enumerated(EnumType.STRING)
    @Column(name = "connection_type", nullable = false)
    private ConnectionType connectionType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ConnectionStatus status = ConnectionStatus.PENDING;
    
    @Column(name = "strength", nullable = false)
    @Builder.Default
    private Integer strength = 1; // 1-10 scale
    
    // Interaction Metrics
    @Column(name = "games_played_together", nullable = false)
    @Builder.Default
    private Integer gamesPlayedTogether = 0;
    
    @Column(name = "total_play_time_hours", nullable = false)
    @Builder.Default
    private Double totalPlayTimeHours = 0.0;
    
    @Column(name = "last_interaction_date")
    private LocalDateTime lastInteractionDate;
    
    @Column(name = "interaction_frequency")
    private Double interactionFrequency; // interactions per week
    
    // Compatibility Metrics
    @Column(name = "skill_compatibility")
    private Double skillCompatibility;
    
    @Column(name = "sport_preference_match")
    private Double sportPreferenceMatch;
    
    @Column(name = "time_preference_match")
    private Double timePreferenceMatch;
    
    @Column(name = "venue_preference_match")
    private Double venuePreferenceMatch;
    
    // Social Metrics
    @Column(name = "communication_score")
    private Double communicationScore;
    
    @Column(name = "teamwork_score")
    private Double teamworkScore;
    
    @Column(name = "sportsmanship_score")
    private Double sportsmanshipScore;
    
    // Connection History
    @Column(name = "connected_at")
    private LocalDateTime connectedAt;
    
    @Column(name = "connection_source")
    private String connectionSource; // e.g., "game", "mutual_friend", "search"
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Manual Getters and Setters (in addition to Lombok)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public User getConnectedUser() { return connectedUser; }
    public void setConnectedUser(User connectedUser) { this.connectedUser = connectedUser; }
    
    public ConnectionType getConnectionType() { return connectionType; }
    public void setConnectionType(ConnectionType connectionType) { this.connectionType = connectionType; }
    
    public ConnectionStatus getStatus() { return status; }
    public void setStatus(ConnectionStatus status) { this.status = status; }
    
    public Integer getStrength() { return strength; }
    public void setStrength(Integer strength) { this.strength = strength; }
    
    public Integer getGamesPlayedTogether() { return gamesPlayedTogether; }
    public void setGamesPlayedTogether(Integer gamesPlayedTogether) { this.gamesPlayedTogether = gamesPlayedTogether; }
    
    public Double getTotalPlayTimeHours() { return totalPlayTimeHours; }
    public void setTotalPlayTimeHours(Double totalPlayTimeHours) { this.totalPlayTimeHours = totalPlayTimeHours; }
    
    public LocalDateTime getLastInteractionDate() { return lastInteractionDate; }
    public void setLastInteractionDate(LocalDateTime lastInteractionDate) { this.lastInteractionDate = lastInteractionDate; }
    
    public Double getInteractionFrequency() { return interactionFrequency; }
    public void setInteractionFrequency(Double interactionFrequency) { this.interactionFrequency = interactionFrequency; }
    
    public Double getSkillCompatibility() { return skillCompatibility; }
    public void setSkillCompatibility(Double skillCompatibility) { this.skillCompatibility = skillCompatibility; }
    
    public Double getSportPreferenceMatch() { return sportPreferenceMatch; }
    public void setSportPreferenceMatch(Double sportPreferenceMatch) { this.sportPreferenceMatch = sportPreferenceMatch; }
    
    public Double getTimePreferenceMatch() { return timePreferenceMatch; }
    public void setTimePreferenceMatch(Double timePreferenceMatch) { this.timePreferenceMatch = timePreferenceMatch; }
    
    public Double getVenuePreferenceMatch() { return venuePreferenceMatch; }
    public void setVenuePreferenceMatch(Double venuePreferenceMatch) { this.venuePreferenceMatch = venuePreferenceMatch; }
    
    public Double getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }
    
    public Double getTeamworkScore() { return teamworkScore; }
    public void setTeamworkScore(Double teamworkScore) { this.teamworkScore = teamworkScore; }
    
    public Double getSportsmanshipScore() { return sportsmanshipScore; }
    public void setSportsmanshipScore(Double sportsmanshipScore) { this.sportsmanshipScore = sportsmanshipScore; }
    
    public LocalDateTime getConnectedAt() { return connectedAt; }
    public void setConnectedAt(LocalDateTime connectedAt) { this.connectedAt = connectedAt; }
    
    public String getConnectionSource() { return connectionSource; }
    public void setConnectionSource(String connectionSource) { this.connectionSource = connectionSource; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Enums
    public enum ConnectionType {
        FRIEND, TEAMMATE, RIVAL, MENTOR, STUDENT, ACQUAINTANCE
    }
    
    public enum ConnectionStatus {
        PENDING, ACTIVE, BLOCKED, REMOVED
    }
    
    // Helper methods
    public void acceptConnection() {
        this.status = ConnectionStatus.ACTIVE;
        this.connectedAt = LocalDateTime.now();
    }
    
    public void blockConnection() {
        this.status = ConnectionStatus.BLOCKED;
    }
    
    public void removeConnection() {
        this.status = ConnectionStatus.REMOVED;
    }
    
    public void incrementGamesPlayed() {
        this.gamesPlayedTogether++;
        this.lastInteractionDate = LocalDateTime.now();
    }
    
    public void addPlayTime(double hours) {
        this.totalPlayTimeHours += hours;
    }
    
    public void updateStrength(int newStrength) {
        this.strength = Math.max(1, Math.min(10, newStrength));
    }
    
    public boolean isActive() {
        return this.status == ConnectionStatus.ACTIVE;
    }
    
    public boolean isBlocked() {
        return this.status == ConnectionStatus.BLOCKED;
    }
    
    public double getOverallCompatibility() {
        double total = 0.0;
        int count = 0;
        
        if (this.skillCompatibility != null) {
            total += this.skillCompatibility;
            count++;
        }
        if (this.sportPreferenceMatch != null) {
            total += this.sportPreferenceMatch;
            count++;
        }
        if (this.timePreferenceMatch != null) {
            total += this.timePreferenceMatch;
            count++;
        }
        if (this.venuePreferenceMatch != null) {
            total += this.venuePreferenceMatch;
            count++;
        }
        
        return count > 0 ? total / count : 0.0;
    }
}
