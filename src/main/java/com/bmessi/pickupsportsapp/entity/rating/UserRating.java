package com.bmessi.pickupsportsapp.entity.rating;

import com.bmessi.pickupsportsapp.entity.User;
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
 * User rating entity for tracking player ratings and social feedback.
 */
@Entity
@Table(name = "user_ratings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rated_user_id", nullable = false)
    private User ratedUser; // User being rated

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rater_user_id", nullable = false)
    private User raterUser; // User giving the rating

    @Column(name = "rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal rating; // 1.00 to 5.00 scale

    @Column(name = "sport", length = 50)
    private String sport; // Sport-specific rating

    @Enumerated(EnumType.STRING)
    @Column(name = "rating_category", nullable = false)
    private RatingCategory ratingCategory;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous;

    @Column(name = "game_id")
    private Long gameId; // Associated game if rating is game-specific

    @Column(name = "tournament_id")
    private Long tournamentId; // Associated tournament if rating is tournament-specific

    @Column(name = "venue_id")
    private Long venueId; // Associated venue if rating is venue-specific

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RatingStatus status;

    @Column(name = "moderation_notes", length = 500)
    private String moderationNotes;

    @Column(name = "moderated_by")
    private Long moderatedBy; // Admin user ID who moderated this rating

    @Column(name = "moderated_at")
    private OffsetDateTime moderatedAt;

    @Column(name = "helpful_votes")
    private Integer helpfulVotes;

    @Column(name = "unhelpful_votes")
    private Integer unhelpfulVotes;

    @Column(name = "reported_count")
    private Integer reportedCount;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured; // Featured review for display

    @Column(name = "response_comment", length = 1000)
    private String responseComment; // Response from the rated user

    @Column(name = "response_date")
    private OffsetDateTime responseDate;

    @Column(name = "rating_date", nullable = false)
    private OffsetDateTime ratingDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum RatingCategory {
        OVERALL, SKILL_LEVEL, SPORTSMANSHIP, RELIABILITY, TEAMWORK, COMMUNICATION, 
        PUNCTUALITY, EQUIPMENT_SHARING, COACHING_ABILITY, REFEREE_QUALITY, 
        VENUE_QUALITY, ORGANIZATION, VALUE_FOR_MONEY, SAFETY, CLEANLINESS, OTHER
    }

    public enum RatingStatus {
        PENDING, APPROVED, REJECTED, HIDDEN, DELETED
    }
}
