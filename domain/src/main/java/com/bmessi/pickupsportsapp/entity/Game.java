
package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a pickup game. Includes GPS coordinates so
 * games can be filtered by proximity.
 */
@Entity
@Table(name = "game")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sport", nullable = false, length = 100)
    private String sport;

    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @Column(name = "time", nullable = true)
    private Instant time;

    @Column(name = "skill_level", length = 50)
    private String skillLevel;

    /**
     * Latitude of the game location (optional).
     */
    @Column
    private Double latitude;

    /**
     * Longitude of the game location (optional).
     */
    @Column
    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Version
    private Long version;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "game_participants",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> participants = new HashSet<>();

    // Helper methods for participants
    public void addParticipant(User user) {
        if (participants == null) {
            participants = new HashSet<>();
        }
        participants.add(user);
    }

    public void removeParticipant(User user) {
        if (participants != null) {
            participants.remove(user);
        }
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}