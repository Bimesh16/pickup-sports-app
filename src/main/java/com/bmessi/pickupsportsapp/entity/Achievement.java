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
@Table(name = "achievement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, unique = true)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private AchievementCategory category;
    
    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AchievementType type;
    
    // Requirements
    @Column(name = "requirement_value", nullable = false)
    private Integer requirementValue;
    
    @Column(name = "requirement_metric", nullable = false)
    private String requirementMetric; // e.g., "games_played", "streak_days", "rating"
    
    @Column(name = "max_levels", nullable = false)
    @Builder.Default
    private Integer maxLevels = 1;
    
    // Rewards
    @Column(name = "base_points", nullable = false)
    private Integer basePoints;
    
    @Column(name = "points_per_level")
    private Integer pointsPerLevel;
    
    @Column(name = "badge_icon")
    private String badgeIcon;
    
    @Column(name = "badge_color")
    private String badgeColor;
    
    // Display
    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private Boolean isHidden = false;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;
    
    // Status
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
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
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public AchievementCategory getCategory() { return category; }
    public void setCategory(AchievementCategory category) { this.category = category; }
    
    public AchievementType getType() { return type; }
    public void setType(AchievementType type) { this.type = type; }
    
    public Integer getRequirementValue() { return requirementValue; }
    public void setRequirementValue(Integer requirementValue) { this.requirementValue = requirementValue; }
    
    public String getRequirementMetric() { return requirementMetric; }
    public void setRequirementMetric(String requirementMetric) { this.requirementMetric = requirementMetric; }
    
    public Integer getMaxLevels() { return maxLevels; }
    public void setMaxLevels(Integer maxLevels) { this.maxLevels = maxLevels; }
    
    public Integer getBasePoints() { return basePoints; }
    public void setBasePoints(Integer basePoints) { this.basePoints = basePoints; }
    
    public Integer getPointsPerLevel() { return pointsPerLevel; }
    public void setPointsPerLevel(Integer pointsPerLevel) { this.pointsPerLevel = pointsPerLevel; }
    
    public String getBadgeIcon() { return badgeIcon; }
    public void setBadgeIcon(String badgeIcon) { this.badgeIcon = badgeIcon; }
    
    public String getBadgeColor() { return badgeColor; }
    public void setBadgeColor(String badgeColor) { this.badgeColor = badgeColor; }
    
    public Boolean getIsHidden() { return isHidden; }
    public void setIsHidden(Boolean isHidden) { this.isHidden = isHidden; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Enums
    public enum AchievementCategory {
        GAMEPLAY, SOCIAL, SKILL, MILESTONE, SPECIAL, SEASONAL
    }
    
    public enum AchievementType {
        SINGLE, PROGRESSIVE, REPEATABLE, TIME_BOUND
    }
    
    // Helper methods
    public boolean isAvailable() {
        LocalDateTime now = LocalDateTime.now();
        return this.isActive && 
               (this.startDate == null || now.isAfter(this.startDate)) &&
               (this.endDate == null || now.isBefore(this.endDate));
    }
    
    public int calculatePoints(int level) {
        if (this.pointsPerLevel != null) {
            return this.basePoints + (this.pointsPerLevel * (level - 1));
        }
        return this.basePoints;
    }
    
    public boolean isProgressive() {
        return this.type == AchievementType.PROGRESSIVE;
    }
    
    public boolean isRepeatable() {
        return this.type == AchievementType.REPEATABLE;
    }
}
