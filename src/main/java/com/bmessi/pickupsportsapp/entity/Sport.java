package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Sport entity representing different sports available in the system.
 */
@Entity
@Table(name = "sports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "category", length = 50)
    private String category; // e.g., "Team Sports", "Individual Sports", "Racket Sports"

    @Column(name = "min_players")
    private Integer minPlayers;

    @Column(name = "max_players")
    private Integer maxPlayers;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    @Column(name = "rules_summary", length = 1000)
    private String rulesSummary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}