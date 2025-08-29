package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.bmessi.pickupsportsapp.model.SkillLevel;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "user_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    // Sports Preferences
    @ElementCollection
    @CollectionTable(name = "user_preferred_sports", joinColumns = @JoinColumn(name = "user_preferences_id"))
    @Column(name = "sport_name")
    private java.util.List<String> preferredSports;
    
    @ElementCollection
    @CollectionTable(name = "user_sport_skill_levels", joinColumns = @JoinColumn(name = "user_preferences_id"))
    @MapKeyColumn(name = "sport_name")
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "skill_level")
    private java.util.Map<String, SkillLevel> sportSkillLevels;
    
    // Time Preferences
    @ElementCollection
    @CollectionTable(name = "user_preferred_time_slots", joinColumns = @JoinColumn(name = "user_preferences_id"))
    @Column(name = "time_slot")
    private java.util.List<String> preferredTimeSlots;
    
    @ElementCollection
    @CollectionTable(name = "user_preferred_days", joinColumns = @JoinColumn(name = "user_preferences_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private java.util.List<DayOfWeek> preferredDays;
    
    @Column(name = "earliest_start_time")
    private LocalTime earliestStartTime;
    
    @Column(name = "latest_end_time")
    private LocalTime latestEndTime;
    
    @Column(name = "preferred_game_duration_hours")
    private Double preferredGameDurationHours;
    
    // Venue Preferences
    @ElementCollection
    @CollectionTable(name = "user_preferred_venue_types", joinColumns = @JoinColumn(name = "user_preferences_id"))
    @Column(name = "venue_type")
    private java.util.List<String> preferredVenueTypes;
    
    @Column(name = "max_travel_distance_km")
    private Double maxTravelDistanceKm;
    
    @Column(name = "preferred_venue_features")
    private String preferredVenueFeatures; // JSON string
    
    @Column(name = "max_price_per_hour")
    private Double maxPricePerHour;
    
    // Social Preferences
    @Column(name = "preferred_group_size_min")
    private Integer preferredGroupSizeMin;
    
    @Column(name = "preferred_group_size_max")
    private Integer preferredGroupSizeMax;
    
    @Column(name = "prefer_competitive_games")
    private Boolean preferCompetitiveGames;
    
    @Column(name = "prefer_casual_games")
    private Boolean preferCasualGames;
    
    @Column(name = "open_to_new_players")
    private Boolean openToNewPlayers;
    
    @Column(name = "prefer_same_skill_level")
    private Boolean preferSameSkillLevel;
    
    // Communication Preferences
    @Column(name = "notification_preferences")
    private String notificationPreferences; // JSON string
    
    @Column(name = "communication_style")
    @Enumerated(EnumType.STRING)
    private CommunicationStyle communicationStyle;
    
    @Column(name = "language_preference")
    private String languagePreference;
    
    // Privacy Preferences
    @Column(name = "profile_visibility")
    @Enumerated(EnumType.STRING)
    private ProfileVisibility profileVisibility;
    
    @Column(name = "show_online_status")
    private Boolean showOnlineStatus;
    
    @Column(name = "allow_friend_requests")
    private Boolean allowFriendRequests;
    
    @Column(name = "show_game_history")
    private Boolean showGameHistory;
    
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
    
    public java.util.List<String> getPreferredSports() { return preferredSports; }
    public void setPreferredSports(java.util.List<String> preferredSports) { this.preferredSports = preferredSports; }
    
    public java.util.Map<String, SkillLevel> getSportSkillLevels() { return sportSkillLevels; }
    public void setSportSkillLevels(java.util.Map<String, SkillLevel> sportSkillLevels) { this.sportSkillLevels = sportSkillLevels; }
    
    public java.util.List<String> getPreferredTimeSlots() { return preferredTimeSlots; }
    public void setPreferredTimeSlots(java.util.List<String> preferredTimeSlots) { this.preferredTimeSlots = preferredTimeSlots; }
    
    public java.util.List<DayOfWeek> getPreferredDays() { return preferredDays; }
    public void setPreferredDays(java.util.List<DayOfWeek> preferredDays) { this.preferredDays = preferredDays; }
    
    public LocalTime getEarliestStartTime() { return earliestStartTime; }
    public void setEarliestStartTime(LocalTime earliestStartTime) { this.earliestStartTime = earliestStartTime; }
    
    public LocalTime getLatestEndTime() { return latestEndTime; }
    public void setLatestEndTime(LocalTime latestEndTime) { this.latestEndTime = latestEndTime; }
    
    public Double getPreferredGameDurationHours() { return preferredGameDurationHours; }
    public void setPreferredGameDurationHours(Double preferredGameDurationHours) { this.preferredGameDurationHours = preferredGameDurationHours; }
    
    public java.util.List<String> getPreferredVenueTypes() { return preferredVenueTypes; }
    public void setPreferredVenueTypes(java.util.List<String> preferredVenueTypes) { this.preferredVenueTypes = preferredVenueTypes; }
    
    public Double getMaxTravelDistanceKm() { return maxTravelDistanceKm; }
    public void setMaxTravelDistanceKm(Double maxTravelDistanceKm) { this.maxTravelDistanceKm = maxTravelDistanceKm; }
    
    public String getPreferredVenueFeatures() { return preferredVenueFeatures; }
    public void setPreferredVenueFeatures(String preferredVenueFeatures) { this.preferredVenueFeatures = preferredVenueFeatures; }
    
    public Double getMaxPricePerHour() { return maxPricePerHour; }
    public void setMaxPricePerHour(Double maxPricePerHour) { this.maxPricePerHour = maxPricePerHour; }
    
    public Integer getPreferredGroupSizeMin() { return preferredGroupSizeMin; }
    public void setPreferredGroupSizeMin(Integer preferredGroupSizeMin) { this.preferredGroupSizeMin = preferredGroupSizeMin; }
    
    public Integer getPreferredGroupSizeMax() { return preferredGroupSizeMax; }
    public void setPreferredGroupSizeMax(Integer preferredGroupSizeMax) { this.preferredGroupSizeMax = preferredGroupSizeMax; }
    
    public Boolean getPreferCompetitiveGames() { return preferCompetitiveGames; }
    public void setPreferCompetitiveGames(Boolean preferCompetitiveGames) { this.preferCompetitiveGames = preferCompetitiveGames; }
    
    public Boolean getPreferCasualGames() { return preferCasualGames; }
    public void setPreferCasualGames(Boolean preferCasualGames) { this.preferCasualGames = preferCasualGames; }
    
    public Boolean getOpenToNewPlayers() { return openToNewPlayers; }
    public void setOpenToNewPlayers(Boolean openToNewPlayers) { this.openToNewPlayers = openToNewPlayers; }
    
    public Boolean getPreferSameSkillLevel() { return preferSameSkillLevel; }
    public void setPreferSameSkillLevel(Boolean preferSameSkillLevel) { this.preferSameSkillLevel = preferSameSkillLevel; }
    
    public String getNotificationPreferences() { return notificationPreferences; }
    public void setNotificationPreferences(String notificationPreferences) { this.notificationPreferences = notificationPreferences; }
    
    public CommunicationStyle getCommunicationStyle() { return communicationStyle; }
    public void setCommunicationStyle(CommunicationStyle communicationStyle) { this.communicationStyle = communicationStyle; }
    
    public String getLanguagePreference() { return languagePreference; }
    public void setLanguagePreference(String languagePreference) { this.languagePreference = languagePreference; }
    
    public ProfileVisibility getProfileVisibility() { return profileVisibility; }
    public void setProfileVisibility(ProfileVisibility profileVisibility) { this.profileVisibility = profileVisibility; }
    
    public Boolean getShowOnlineStatus() { return showOnlineStatus; }
    public void setShowOnlineStatus(Boolean showOnlineStatus) { this.showOnlineStatus = showOnlineStatus; }
    
    public Boolean getAllowFriendRequests() { return allowFriendRequests; }
    public void setAllowFriendRequests(Boolean allowFriendRequests) { this.allowFriendRequests = allowFriendRequests; }
    
    public Boolean getShowGameHistory() { return showGameHistory; }
    public void setShowGameHistory(Boolean showGameHistory) { this.showGameHistory = showGameHistory; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Enums
    public enum CommunicationStyle {
        VERBAL, TEXT, BOTH, MINIMAL
    }
    
    public enum ProfileVisibility {
        PUBLIC, FRIENDS_ONLY, PRIVATE
    }
    
    // Helper methods
    public void addPreferredSport(String sport) {
        if (this.preferredSports == null) {
            this.preferredSports = new java.util.ArrayList<>();
        }
        if (!this.preferredSports.contains(sport)) {
            this.preferredSports.add(sport);
        }
    }
    
    public void removePreferredSport(String sport) {
        if (this.preferredSports != null) {
            this.preferredSports.remove(sport);
        }
    }
    
    public void setSportSkillLevel(String sport, SkillLevel skillLevel) {
        if (this.sportSkillLevels == null) {
            this.sportSkillLevels = new java.util.HashMap<>();
        }
        this.sportSkillLevels.put(sport, skillLevel);
    }
    
    public SkillLevel getSportSkillLevel(String sport) {
        if (this.sportSkillLevels != null) {
            return this.sportSkillLevels.get(sport);
        }
        return null;
    }
    
    public void addPreferredTimeSlot(String timeSlot) {
        if (this.preferredTimeSlots == null) {
            this.preferredTimeSlots = new java.util.ArrayList<>();
        }
        if (!this.preferredTimeSlots.contains(timeSlot)) {
            this.preferredTimeSlots.add(timeSlot);
        }
    }
    
    public void addPreferredDay(DayOfWeek day) {
        if (this.preferredDays == null) {
            this.preferredDays = new java.util.ArrayList<>();
        }
        if (!this.preferredDays.contains(day)) {
            this.preferredDays.add(day);
        }
    }
    
    public boolean isTimeSlotPreferred(String timeSlot) {
        return this.preferredTimeSlots != null && this.preferredTimeSlots.contains(timeSlot);
    }
    
    public boolean isDayPreferred(DayOfWeek day) {
        return this.preferredDays != null && this.preferredDays.contains(day);
    }
    
    public boolean isSportPreferred(String sport) {
        return this.preferredSports != null && this.preferredSports.contains(sport);
    }
}
