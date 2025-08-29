package com.bmessi.pickupsportsapp.entity.ai;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * AI-generated player recommendation for games.
 */
@Entity
@Table(name = "player_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_player_id", nullable = false)
    private User recommendedPlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requesting_player_id", nullable = false)
    private User requestingPlayer;

    @Column(name = "recommendation_score", precision = 5, scale = 4, nullable = false)
    private BigDecimal recommendationScore;

    @Column(name = "reason", length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RecommendationStatus status;

    @Column(name = "ai_model_version", length = 50)
    private String aiModelVersion;

    @Column(name = "features_used", length = 1000)
    private String featuresUsed; // JSON string of features used for recommendation

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum RecommendationStatus {
        PENDING, ACCEPTED, REJECTED, EXPIRED
    }
}
