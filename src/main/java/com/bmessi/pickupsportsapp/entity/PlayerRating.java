package com.bmessi.pickupsportsapp.entity;

import com.bmessi.pickupsportsapp.entity.game.Game;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "player_rating",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_rating_rater_rated_game",
                columnNames = {"rater_id", "rated_id", "game_id"}
        ),
        indexes = {
                @Index(name = "idx_rating_rated", columnList = "rated_id"),
                @Index(name = "idx_rating_game", columnList = "game_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who rated
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rater_id", nullable = false)
    private User rater;

    // Who is being rated
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rated_id", nullable = false)
    private User rated;

    // For which game
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    // Score 1..5
    @Column(nullable = false)
    private int score;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Called just before the entity is first persisted.  Sets both
     * createdAt and updatedAt to the current time.
     */
    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Called just before any update to the entity.  Updates the updatedAt timestamp.
     */
    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
