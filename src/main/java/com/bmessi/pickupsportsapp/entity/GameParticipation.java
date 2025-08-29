package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.bmessi.pickupsportsapp.entity.game.Game;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_participation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameParticipation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;
    
    // Participation Details
    @Enumerated(EnumType.STRING)
    @Column(name = "participation_type", nullable = false)
    private ParticipationType participationType;
    
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;
    
    @Column(name = "left_at")
    private LocalDateTime leftAt;
    
    @Column(name = "was_present", nullable = false)
    @Builder.Default
    private Boolean wasPresent = false;
    
    // Performance Metrics
    @Column(name = "performance_rating")
    private Double performanceRating;
    
    @Column(name = "team_score")
    private Integer teamScore;
    
    @Column(name = "individual_contribution")
    private String individualContribution;
    
    @Column(name = "sportsmanship_rating")
    private Double sportsmanshipRating;
    
    // Feedback and Reviews
    @Column(name = "feedback_received", columnDefinition = "TEXT")
    private String feedbackReceived;
    
    @Column(name = "feedback_given", columnDefinition = "TEXT")
    private String feedbackGiven;
    
    @Column(name = "recommendation_score")
    private Integer recommendationScore; // 1-5 scale
    
    // Game Outcome
    @Column(name = "game_result")
    @Enumerated(EnumType.STRING)
    private GameResult gameResult;
    
    @Column(name = "enjoyment_level")
    private Integer enjoymentLevel; // 1-10 scale
    
    @Column(name = "would_play_again")
    private Boolean wouldPlayAgain;
    
    // Social Aspects
    @Column(name = "new_connections_made")
    private Integer newConnectionsMade;
    
    @Column(name = "team_chemistry_rating")
    private Double teamChemistryRating;
    
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
    
    public Game getGame() { return game; }
    public void setGame(Game game) { this.game = game; }
    
    public ParticipationType getParticipationType() { return participationType; }
    public void setParticipationType(ParticipationType participationType) { this.participationType = participationType; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    
    public LocalDateTime getLeftAt() { return leftAt; }
    public void setLeftAt(LocalDateTime leftAt) { this.leftAt = leftAt; }
    
    public Boolean getWasPresent() { return wasPresent; }
    public void setWasPresent(Boolean wasPresent) { this.wasPresent = wasPresent; }
    
    public Double getPerformanceRating() { return performanceRating; }
    public void setPerformanceRating(Double performanceRating) { this.performanceRating = performanceRating; }
    
    public Integer getTeamScore() { return teamScore; }
    public void setTeamScore(Integer teamScore) { this.teamScore = teamScore; }
    
    public String getIndividualContribution() { return individualContribution; }
    public void setIndividualContribution(String individualContribution) { this.individualContribution = individualContribution; }
    
    public Double getSportsmanshipRating() { return sportsmanshipRating; }
    public void setSportsmanshipRating(Double sportsmanshipRating) { this.sportsmanshipRating = sportsmanshipRating; }
    
    public String getFeedbackReceived() { return feedbackReceived; }
    public void setFeedbackReceived(String feedbackReceived) { this.feedbackReceived = feedbackReceived; }
    
    public String getFeedbackGiven() { return feedbackGiven; }
    public void setFeedbackGiven(String feedbackGiven) { this.feedbackGiven = feedbackGiven; }
    
    public Integer getRecommendationScore() { return recommendationScore; }
    public void setRecommendationScore(Integer recommendationScore) { this.recommendationScore = recommendationScore; }
    
    public GameResult getGameResult() { return gameResult; }
    public void setGameResult(GameResult gameResult) { this.gameResult = gameResult; }
    
    public Integer getEnjoymentLevel() { return enjoymentLevel; }
    public void setEnjoymentLevel(Integer enjoymentLevel) { this.enjoymentLevel = enjoymentLevel; }
    
    public Boolean getWouldPlayAgain() { return wouldPlayAgain; }
    public void setWouldPlayAgain(Boolean wouldPlayAgain) { this.wouldPlayAgain = wouldPlayAgain; }
    
    public Integer getNewConnectionsMade() { return newConnectionsMade; }
    public void setNewConnectionsMade(Integer newConnectionsMade) { this.newConnectionsMade = newConnectionsMade; }
    
    public Double getTeamChemistryRating() { return teamChemistryRating; }
    public void setTeamChemistryRating(Double teamChemistryRating) { this.teamChemistryRating = teamChemistryRating; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Enums
    public enum ParticipationType {
        CREATOR, PARTICIPANT, SPECTATOR, SUBSTITUTE
    }
    
    public enum GameResult {
        WIN, LOSS, DRAW, CANCELLED, DID_NOT_FINISH
    }
    
    // Helper methods
    public void markAsPresent() {
        this.wasPresent = true;
    }
    
    public void leaveGame() {
        this.leftAt = LocalDateTime.now();
    }
    

    
    public boolean isActive() {
        return this.leftAt == null;
    }
    
    public long getParticipationDurationMinutes() {
        if (this.leftAt != null) {
            return java.time.Duration.between(this.joinedAt, this.leftAt).toMinutes();
        }
        return java.time.Duration.between(this.joinedAt, LocalDateTime.now()).toMinutes();
    }
}
