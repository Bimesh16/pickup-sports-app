package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.bmessi.pickupsportsapp.model.SkillLevel;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "user_stats")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
public class UserStats {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    // Game Statistics
    @Column(name = "total_games_played", nullable = false)
    private Integer totalGamesPlayed = 0;
    
    @Column(name = "total_games_created", nullable = false)
    private Integer totalGamesCreated = 0;
    
    @Column(name = "total_games_won", nullable = false)
    private Integer totalGamesWon = 0;
    
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;
    
    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;
    
    @Column(name = "total_play_time_hours", nullable = false)
    private Double totalPlayTimeHours = 0.0;
    
    // Performance Metrics
    @Column(name = "average_rating")
    private Double averageRating;
    
    @Column(name = "total_ratings_received", nullable = false)
    private Integer totalRatingsReceived = 0;
    
    @Column(name = "skill_level_progression", nullable = false)
    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevelProgression = SkillLevel.BEGINNER;
    
    // Social Metrics
    @Column(name = "total_friends", nullable = false)
    private Integer totalFriends = 0;
    
    @Column(name = "total_teams_joined", nullable = false)
    private Integer totalTeamsJoined = 0;
    
    @Column(name = "social_score", nullable = false)
    private Integer socialScore = 0;
    
    // Activity Metrics
    @Column(name = "last_game_date")
    private LocalDateTime lastGameDate;
    
    @Column(name = "most_active_sport")
    private String mostActiveSport;
    
    @Column(name = "preferred_time_slot")
    private String preferredTimeSlot;
    
    @Column(name = "preferred_venue_type")
    private String preferredVenueType;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public UserStats() {}
    
    public UserStats(Long id, User user, Integer totalGamesPlayed, Integer totalGamesCreated, 
                    Integer totalGamesWon, Integer currentStreak, Integer longestStreak, 
                    Double totalPlayTimeHours, Double averageRating, Integer totalRatingsReceived, 
                    SkillLevel skillLevelProgression, Integer totalFriends, Integer totalTeamsJoined, 
                    Integer socialScore, LocalDateTime lastGameDate, String mostActiveSport, 
                    String preferredTimeSlot, String preferredVenueType, LocalDateTime createdAt, 
                    LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.totalGamesPlayed = totalGamesPlayed;
        this.totalGamesCreated = totalGamesCreated;
        this.totalGamesWon = totalGamesWon;
        this.currentStreak = currentStreak;
        this.longestStreak = longestStreak;
        this.totalPlayTimeHours = totalPlayTimeHours;
        this.averageRating = averageRating;
        this.totalRatingsReceived = totalRatingsReceived;
        this.skillLevelProgression = skillLevelProgression;
        this.totalFriends = totalFriends;
        this.totalTeamsJoined = totalTeamsJoined;
        this.socialScore = socialScore;
        this.lastGameDate = lastGameDate;
        this.mostActiveSport = mostActiveSport;
        this.preferredTimeSlot = preferredTimeSlot;
        this.preferredVenueType = preferredVenueType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Integer getTotalGamesPlayed() { return totalGamesPlayed; }
    public void setTotalGamesPlayed(Integer totalGamesPlayed) { this.totalGamesPlayed = totalGamesPlayed; }
    
    public Integer getTotalGamesCreated() { return totalGamesCreated; }
    public void setTotalGamesCreated(Integer totalGamesCreated) { this.totalGamesCreated = totalGamesCreated; }
    
    public Integer getTotalGamesWon() { return totalGamesWon; }
    public void setTotalGamesWon(Integer totalGamesWon) { this.totalGamesWon = totalGamesWon; }
    
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    
    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    
    public Double getTotalPlayTimeHours() { return totalPlayTimeHours; }
    public void setTotalPlayTimeHours(Double totalPlayTimeHours) { this.totalPlayTimeHours = totalPlayTimeHours; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getTotalRatingsReceived() { return totalRatingsReceived; }
    public void setTotalRatingsReceived(Integer totalRatingsReceived) { this.totalRatingsReceived = totalRatingsReceived; }
    
    public SkillLevel getSkillLevelProgression() { return skillLevelProgression; }
    public void setSkillLevelProgression(SkillLevel skillLevelProgression) { this.skillLevelProgression = skillLevelProgression; }
    
    public Integer getTotalFriends() { return totalFriends; }
    public void setTotalFriends(Integer totalFriends) { this.totalFriends = totalFriends; }
    
    public Integer getTotalTeamsJoined() { return totalTeamsJoined; }
    public void setTotalTeamsJoined(Integer totalTeamsJoined) { this.totalTeamsJoined = totalTeamsJoined; }
    
    public Integer getSocialScore() { return socialScore; }
    public void setSocialScore(Integer socialScore) { this.socialScore = socialScore; }
    
    public LocalDateTime getLastGameDate() { return lastGameDate; }
    public void setLastGameDate(LocalDateTime lastGameDate) { this.lastGameDate = lastGameDate; }
    
    public String getMostActiveSport() { return mostActiveSport; }
    public void setMostActiveSport(String mostActiveSport) { this.mostActiveSport = mostActiveSport; }
    
    public String getPreferredTimeSlot() { return preferredTimeSlot; }
    public void setPreferredTimeSlot(String preferredTimeSlot) { this.preferredTimeSlot = preferredTimeSlot; }
    
    public String getPreferredVenueType() { return preferredVenueType; }
    public void setPreferredVenueType(String preferredVenueType) { this.preferredVenueType = preferredVenueType; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public void incrementGamesPlayed() {
        this.totalGamesPlayed++;
    }
    
    public void incrementGamesCreated() {
        this.totalGamesCreated++;
    }
    
    public void incrementGamesWon() {
        this.totalGamesWon++;
    }
    
    public void updateStreak(boolean won) {
        if (won) {
            this.currentStreak++;
            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }
        } else {
            this.currentStreak = 0;
        }
    }
    
    public void addPlayTime(double hours) {
        this.totalPlayTimeHours += hours;
    }
    
    public void updateAverageRating(double newRating) {
        this.totalRatingsReceived++;
        if (this.averageRating == null) {
            this.averageRating = newRating;
        } else {
            this.averageRating = ((this.averageRating * (this.totalRatingsReceived - 1)) + newRating) / this.totalRatingsReceived;
        }
    }
}
