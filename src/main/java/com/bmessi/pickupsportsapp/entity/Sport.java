package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import java.util.List;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;

@Entity
@Table(name = "sport")
public class Sport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "category", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SportCategory category;
    
    @Column(name = "team_size_min", nullable = false)
    private Integer teamSizeMin;
    
    @Column(name = "team_size_max", nullable = false)
    private Integer teamSizeMax;
    
    @Column(name = "total_players_min", nullable = false)
    private Integer totalPlayersMin;
    
    @Column(name = "total_players_max", nullable = false)
    private Integer totalPlayersMax;
    
    @Column(name = "duration_minutes_min", nullable = false)
    private Integer durationMinutesMin;
    
    @Column(name = "duration_minutes_max", nullable = false)
    private Integer durationMinutesMax;
    
    @Column(name = "skill_levels", length = 500)
    private String skillLevels; // JSON array of skill levels
    
    @Column(name = "equipment_required", length = 1000)
    private String equipmentRequired; // JSON array of equipment
    
    @Column(name = "equipment_provided", length = 1000)
    private String equipmentProvided; // JSON array of equipment
    
    @Column(name = "venue_types", length = 500)
    private String venueTypes; // JSON array of venue types
    
    @Column(name = "rules", length = 2000)
    private String rules;
    
    @Column(name = "popularity_score")
    private Double popularityScore; // 0.00 to 10.00
    
    @Column(name = "difficulty_level", length = 20)
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "is_team_sport", nullable = false)
    private Boolean isTeamSport;
    
    @Column(name = "is_indoor", nullable = false)
    private Boolean isIndoor;
    
    @Column(name = "is_outdoor", nullable = false)
    private Boolean isOutdoor;
    
    @Column(name = "is_weather_dependent", nullable = false)
    private Boolean isWeatherDependent;
    
    @Column(name = "icon_url", length = 500)
    private String iconUrl;
    
    @Column(name = "banner_url", length = 500)
    private String bannerUrl;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.time.OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.time.OffsetDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "sport", cascade = CascadeType.ALL)
    private List<Game> games;
    
    @ManyToMany(mappedBy = "supportedSports", fetch = FetchType.LAZY)
    private List<Venue> venues;
    
    // Enums
    public enum SportCategory {
        BALL_SPORTS,      // Soccer, Basketball, Volleyball
        RACKET_SPORTS,    // Badminton, Tennis, Table Tennis
        MIND_SPORTS,      // Chess, Go, Bridge
        WATER_SPORTS,     // Swimming, Water Polo
        TRACK_SPORTS,     // Athletics, Running
        COMBAT_SPORTS,    // Boxing, MMA, Wrestling
        EXTREME_SPORTS,   // Skateboarding, BMX
        TRADITIONAL       // Cricket, Kabaddi, Sepak Takraw
    }
    
    public enum DifficultyLevel {
        BEGINNER,      // Easy to learn
        INTERMEDIATE,  // Moderate skill required
        ADVANCED,      // High skill required
        EXPERT         // Professional level
    }
    
    // Constructors
    public Sport() {
        this.createdAt = java.time.OffsetDateTime.now();
        this.updatedAt = java.time.OffsetDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public SportCategory getCategory() {
        return category;
    }
    
    public void setCategory(SportCategory category) {
        this.category = category;
    }
    
    public Integer getTeamSizeMin() {
        return teamSizeMin;
    }
    
    public void setTeamSizeMin(Integer teamSizeMin) {
        this.teamSizeMin = teamSizeMin;
    }
    
    public Integer getTeamSizeMax() {
        return teamSizeMax;
    }
    
    public void setTeamSizeMax(Integer teamSizeMax) {
        this.teamSizeMax = teamSizeMax;
    }
    
    public Integer getTotalPlayersMin() {
        return totalPlayersMin;
    }
    
    public void setTotalPlayersMin(Integer totalPlayersMin) {
        this.totalPlayersMin = totalPlayersMin;
    }
    
    public Integer getTotalPlayersMax() {
        return totalPlayersMax;
    }
    
    public void setTotalPlayersMax(Integer totalPlayersMax) {
        this.totalPlayersMax = totalPlayersMax;
    }
    
    public Integer getDurationMinutesMin() {
        return durationMinutesMin;
    }
    
    public void setDurationMinutesMin(Integer durationMinutesMin) {
        this.durationMinutesMin = durationMinutesMin;
    }
    
    public Integer getDurationMinutesMax() {
        return durationMinutesMax;
    }
    
    public void setDurationMinutesMax(Integer durationMinutesMax) {
        this.durationMinutesMax = durationMinutesMax;
    }
    
    public String getSkillLevels() {
        return skillLevels;
    }
    
    public void setSkillLevels(String skillLevels) {
        this.skillLevels = skillLevels;
    }
    
    public String getEquipmentRequired() {
        return equipmentRequired;
    }
    
    public void setEquipmentRequired(String equipmentRequired) {
        this.equipmentRequired = equipmentRequired;
    }
    
    public String getEquipmentProvided() {
        return equipmentProvided;
    }
    
    public void setEquipmentProvided(String equipmentProvided) {
        this.equipmentProvided = equipmentProvided;
    }
    
    public String getVenueTypes() {
        return venueTypes;
    }
    
    public void setVenueTypes(String venueTypes) {
        this.venueTypes = venueTypes;
    }
    
    public String getRules() {
        return rules;
    }
    
    public void setRules(String rules) {
        this.rules = rules;
    }
    
    public Double getPopularityScore() {
        return popularityScore;
    }
    
    public void setPopularityScore(Double popularityScore) {
        this.popularityScore = popularityScore;
    }
    
    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Boolean getIsTeamSport() {
        return isTeamSport;
    }
    
    public void setIsTeamSport(Boolean isTeamSport) {
        this.isTeamSport = isTeamSport;
    }
    
    public Boolean getIsIndoor() {
        return isIndoor;
    }
    
    public void setIsIndoor(Boolean isIndoor) {
        this.isIndoor = isIndoor;
    }
    
    public Boolean getIsOutdoor() {
        return isOutdoor;
    }
    
    public void setIsOutdoor(Boolean isOutdoor) {
        this.isOutdoor = isOutdoor;
    }
    
    public Boolean getIsWeatherDependent() {
        return isWeatherDependent;
    }
    
    public void setIsWeatherDependent(Boolean isWeatherDependent) {
        this.isWeatherDependent = isWeatherDependent;
    }
    
    public String getIconUrl() {
        return iconUrl;
    }
    
    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }
    
    public String getBannerUrl() {
        return bannerUrl;
    }
    
    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public java.time.OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(java.time.OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public java.time.OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(java.time.OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<Game> getGames() {
        return games;
    }
    
    public void setGames(List<Game> games) {
        this.games = games;
    }
    
    public List<Venue> getVenues() {
        return venues;
    }
    
    public void setVenues(List<Venue> venues) {
        this.venues = venues;
    }
}