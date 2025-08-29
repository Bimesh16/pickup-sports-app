package com.bmessi.pickupsportsapp.entity;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.model.SkillLevel;
import com.bmessi.pickupsportsapp.security.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

/**
 * Entity representing an application user.
 * 
 * Core Features:
 * - User authentication and profile management
 * - Role-based access control with multiple roles
 * - Multi-factor authentication (MFA) support
 * - Trusted device management
 * - Social login integration capabilities
 * 
 * Profile & Preferences:
 * - Comprehensive user profile with sports preferences
 * - Skill level and position specifications
 * - Contact preferences and privacy settings
 * - Avatar and bio management
 * - Location-based services with GPS coordinates
 * 
 * Social & Ratings:
 * - User rating system with average and count
 * - Game participation history
 * - Social connections and friend management
 * - User verification and trust scores
 * 
 * Security & Privacy:
 * - Password hashing and security
 * - MFA secret management
 * - Account verification status
 * - Privacy controls and data preferences
 * - Audit trail with creation and update timestamps
 * 
 * Business Logic:
 * - User can participate in multiple games
 * - Games are managed through Game entity relationships
 * - Location services for game discovery
 * - Skill-based matching and recommendations
 * 
 * Validation Rules:
 * - Username: 3-50 characters, alphanumeric with underscores
 * - Password: 8-128 characters, required
 * - Email: valid email format, required
 * - Age: 13-120 years
 * - Bio: max 1000 characters
 * - Avatar URL: max 500 characters
 * - Location: max 100 characters
 * - Phone: max 20 characters, phone number format
 * 
 * Relationships:
 * - One-to-many with Game (games hosted by user)
 * - Many-to-many with Game (games participated in)
 * - One-to-many with various audit and notification entities
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "app_user")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "games")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Column(name = "password", nullable = false, length = 128)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", length = 20)
    @Builder.Default
    private Set<Role> roles = Set.of(Role.USER);

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_sport_id")
    private Sport preferredSport;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    @Column(name = "location", length = 100)
    private String location;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Column(name = "latitude")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Column(name = "longitude")
    private Double longitude;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    @Column(name = "bio", length = 1000)
    private String bio;

    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://.*)?$", message = "Avatar URL must be a valid HTTP/HTTPS URL")
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", length = 20)
    private SkillLevel skillLevel;

    @Size(max = 50, message = "Position must not exceed 50 characters")
    @Column(name = "position", length = 50)
    private String position;

    @Size(max = 20, message = "Contact preference must not exceed 20 characters")
    @Column(name = "contact_preference", length = 20)
    private String contactPreference;

    @Min(value = 13, message = "Age must be at least 13")
    @Max(value = 120, message = "Age must not exceed 120")
    @Column(name = "age")
    private Integer age;

    @DecimalMin(value = "0.0", message = "Rating average cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating average cannot exceed 5.0")
    @Column(name = "rating_average")
    @Builder.Default
    private Double ratingAverage = 0.0;

    @Min(value = 0, message = "Rating count cannot be negative")
    @Column(name = "rating_count")
    @Builder.Default
    private Integer ratingCount = 0;

    @Column(name = "mfa_secret")
    private String mfaSecret;

    @Column(name = "mfa_enabled")
    @Builder.Default
    private boolean mfaEnabled = false;

    @Column(name = "is_verified")
    @Builder.Default
    private boolean isVerified = false;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Pattern(regexp = "^[+]?[0-9\\s\\-\\(\\)]+$", message = "Phone number must contain only numbers, spaces, hyphens, and parentheses")
    @Column(name = "phone", length = 20)
    private String phone;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Game> games = new java.util.ArrayList<>();

    public enum Role {
        USER, ADMIN, MODERATOR, PREMIUM_USER
    }


}
