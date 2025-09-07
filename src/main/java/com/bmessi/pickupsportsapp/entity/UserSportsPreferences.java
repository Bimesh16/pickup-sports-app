package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

/**
 * Entity representing user sports preferences and settings.
 * 
 * Features:
 * - Default cricket format preferences
 * - Sports skill levels per sport
 * - Availability preferences
 * - Travel radius settings
 * 
 * @author Pickup Sports App Team
 * @version 1.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "user_sports_preferences", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSportsPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_user_sports_preferences_user"))
    private User user;

    @Column(name = "default_cricket_format", length = 20)
    private String defaultCricketFormat;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_sport_skill_levels", joinColumns = @JoinColumn(name = "user_sports_preferences_id"))
    @MapKeyColumn(name = "sport")
    @Column(name = "skill_level", length = 20)
    @Builder.Default
    private java.util.Map<String, String> sportSkillLevels = new java.util.HashMap<>();

    @Column(name = "travel_radius_km")
    private Integer travelRadiusKm;

    @Column(name = "availability_days")
    private String availabilityDays; // JSON string or comma-separated

    @Column(name = "preferred_time_slots")
    private String preferredTimeSlots; // JSON string or comma-separated

    @Column(name = "open_to_invites")
    @Builder.Default
    private boolean openToInvites = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public static UserSportsPreferences defaults(User user) {
        return UserSportsPreferences.builder()
                .user(user)
                .defaultCricketFormat("T20")
                .sportSkillLevels(java.util.Map.of("soccer", "intermediate"))
                .travelRadiusKm(10)
                .availabilityDays("monday,tuesday,wednesday,thursday,friday,saturday,sunday")
                .preferredTimeSlots("evening")
                .openToInvites(true)
                .build();
    }
}
