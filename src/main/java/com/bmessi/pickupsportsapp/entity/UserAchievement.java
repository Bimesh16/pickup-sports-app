package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_achievement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAchievement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;
    
    // Achievement Details
    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;
    
    @Column(name = "progress_percentage", nullable = false)
    @Builder.Default
    private Integer progressPercentage = 100;
    
    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;
    
    @Column(name = "max_level", nullable = false)
    @Builder.Default
    private Integer maxLevel = 1;
    
    @Column(name = "points_earned", nullable = false)
    @Builder.Default
    private Integer pointsEarned = 0;
    
    // Achievement Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AchievementStatus status = AchievementStatus.ACTIVE;
    
    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    // Social Sharing
    @Column(name = "shared_at")
    private LocalDateTime sharedAt;
    
    @Column(name = "share_count", nullable = false)
    @Builder.Default
    private Integer shareCount = 0;
    
    // Metadata
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string for additional data
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Manual Getters and Setters (in addition to Lombok)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Achievement getAchievement() { return achievement; }
    public void setAchievement(Achievement achievement) { this.achievement = achievement; }
    
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    
    public Integer getMaxLevel() { return maxLevel; }
    public void setMaxLevel(Integer maxLevel) { this.maxLevel = maxLevel; }
    
    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
    
    public AchievementStatus getStatus() { return status; }
    public void setStatus(AchievementStatus status) { this.status = status; }
    
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public LocalDateTime getSharedAt() { return sharedAt; }
    public void setSharedAt(LocalDateTime sharedAt) { this.sharedAt = sharedAt; }
    
    public Integer getShareCount() { return shareCount; }
    public void setShareCount(Integer shareCount) { this.shareCount = shareCount; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // Enums
    public enum AchievementStatus {
        ACTIVE, HIDDEN, DISABLED, EXPIRED
    }
    
    // Helper methods
    public void incrementLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
        }
    }
    
    public void updateProgress(int newProgress) {
        this.progressPercentage = Math.min(100, Math.max(0, newProgress));
    }
    
    public void addPoints(int points) {
        this.pointsEarned += points;
    }
    
    public void share() {
        this.sharedAt = LocalDateTime.now();
        this.shareCount++;
    }
    
    public boolean isMaxLevel() {
        return this.currentLevel >= this.maxLevel;
    }
    
    public boolean isCompleted() {
        return this.progressPercentage >= 100;
    }
}
