package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a sports venue or facility that can be booked for games.
 * 
 * <p>This entity manages comprehensive venue information including location, capacity,
 * pricing, amenities, and business operations. It supports various venue types from
 * indoor facilities to outdoor fields and specialized sports complexes.</p>
 * 
 * <p><strong>Core Features:</strong></p>
 * <ul>
 *   <li><strong>Location Management:</strong> Address, coordinates, and geographic data</li>
 *   <li><strong>Capacity Planning:</strong> Min/max capacity and utilization tracking</li>
 *   <li><strong>Pricing Structure:</strong> Hourly rates, per-player pricing, and cost management</li>
 *   <li><strong>Sport Support:</strong> Multiple sports, equipment, and facility requirements</li>
 *   <li><strong>Business Operations:</strong> Hours, contact info, and verification status</li>
 * </ul>
 * 
 * <p><strong>Venue Types:</strong></p>
 * <ul>
 *   <li><strong>INDOOR_FIELD:</strong> Climate-controlled indoor sports facilities</li>
 *   <li><strong>OUTDOOR_FIELD:</strong> Natural or artificial turf outdoor fields</li>
 *   <li><strong>COURT:</strong> Basketball, tennis, volleyball courts</li>
 *   <li><strong>POOL:</strong> Swimming pools and aquatic facilities</li>
 *   <li><strong>GYM:</strong> Fitness centers and workout facilities</li>
 *   <li><strong>TRACK:</strong> Running tracks and athletic facilities</li>
 *   <li><strong>MULTI_PURPOSE:</strong> Flexible spaces for various activities</li>
 *   <li><strong>SPECIALIZED:</strong> Sport-specific facilities (climbing, ice rinks, etc.)</li>
 * </ul>
 * 
 * <p><strong>Venue Status:</strong></p>
 * <ul>
 *   <li><strong>ACTIVE:</strong> Venue is open and accepting bookings</li>
 *   <li><strong>INACTIVE:</strong> Venue is temporarily unavailable</li>
 *   <li><strong>MAINTENANCE:</strong> Venue is under maintenance</li>
 *   <li><strong>TEMPORARILY_CLOSED:</strong> Venue is closed for a specific period</li>
 *   <li><strong>PERMANENTLY_CLOSED:</strong> Venue is no longer operational</li>
 * </ul>
 * 
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Name: Required, max 255 characters</li>
 *   <li>Address: Required, max 500 characters</li>
 *   <li>City: Required, max 100 characters</li>
 *   <li>Coordinates: Latitude (-90 to 90), Longitude (-180 to 180)</li>
 *   <li>Capacity: Min 1, Max 1000 players</li>
 *   <li>Price: Non-negative with proper decimal precision</li>
 *   <li>Contact: Valid email format, phone number patterns</li>
 * </ul>
 * 
 * <p><strong>Business Features:</strong></p>
 * <ul>
 *   <li>Dynamic pricing based on demand and time</li>
 *   <li>Capacity management and overflow handling</li>
 *   <li>Business hours and availability scheduling</li>
 *   <li>Amenity tracking and equipment management</li>
 *   <li>Owner verification and trust scoring</li>
 * </ul>
 * 
 * <p><strong>Relationships:</strong></p>
 * <ul>
 *   <li>One-to-many with Game entities (games hosted at venue)</li>
 *   <li>One-to-many with VenueBooking entities (booking history)</li>
 *   <li>Many-to-many with Sport entities (supported sports)</li>
 *   <li>One-to-many with VenueAmenity entities (available amenities)</li>
 *   <li>One-to-many with VenueBusinessHours entities (operating schedule)</li>
 *   <li>One-to-many with VenueImage entities (venue photos)</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "venues", indexes = {
        @Index(name = "idx_venue_location", columnList = "latitude, longitude"),
        @Index(name = "idx_venue_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Venue name is required")
    @Size(max = 255, message = "Venue name must not exceed 255 characters")
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    @Column(name = "state", length = 100)
    private String state;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90 degrees")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90 degrees")
    @Column(name = "latitude")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180 degrees")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180 degrees")
    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "venue_type", nullable = false)
    private VenueType venueType;

    @Min(value = 1, message = "Maximum capacity must be at least 1")
    @Max(value = 1000, message = "Maximum capacity cannot exceed 1000")
    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Min(value = 1, message = "Minimum capacity must be at least 1")
    @Max(value = 1000, message = "Minimum capacity cannot exceed 1000")
    @Column(name = "min_capacity")
    private Integer minCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private VenueStatus status = VenueStatus.ACTIVE;

    @DecimalMin(value = "0.0", message = "Base price per hour must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Base price per hour must have at most 6 digits and 2 decimal places")
    @Column(name = "base_price_per_hour", precision = 10, scale = 2)
    private BigDecimal basePricePerHour;

    @DecimalMin(value = "0.0", message = "Base price per player must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Base price per player must have at most 6 digits and 2 decimal places")
    @Column(name = "base_price_per_player", precision = 10, scale = 2)
    private BigDecimal basePricePerPlayer;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "owner_id")
    private Long ownerId;

    @Size(max = 20, message = "Contact phone must not exceed 20 characters")
    @Pattern(regexp = "^[+]?[0-9\\s\\-\\(\\)]+$", message = "Contact phone must contain only numbers, spaces, hyphens, and parentheses")
    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Size(max = 255, message = "Contact email must not exceed 255 characters")
    @Email(message = "Contact email must be a valid email address")
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://.*)?$", message = "Website URL must be a valid HTTP/HTTPS URL")
    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "venue_sports",
            joinColumns = @JoinColumn(name = "venue_id"),
            inverseJoinColumns = @JoinColumn(name = "sport_id")
    )
    @Builder.Default
    private Set<Sport> supportedSports = new HashSet<>();

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<VenueAmenity> amenities = new HashSet<>();

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<VenueBusinessHours> businessHours = new HashSet<>();

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<VenueImage> images = new HashSet<>();

    // Helper methods
    public void addSport(Sport sport) {
        if (supportedSports == null) {
            supportedSports = new HashSet<>();
        }
        supportedSports.add(sport);
    }

    public void removeSport(Sport sport) {
        if (supportedSports != null) {
            supportedSports.remove(sport);
        }
    }

    public void addAmenity(VenueAmenity amenity) {
        if (amenities == null) {
            amenities = new HashSet<>();
        }
        amenities.add(amenity);
        amenity.setVenue(this);
    }

    public void addBusinessHours(VenueBusinessHours hours) {
        if (businessHours == null) {
            businessHours = new HashSet<>();
        }
        businessHours.add(hours);
        hours.setVenue(this);
    }



    public enum VenueType {
        INDOOR_FIELD,
        OUTDOOR_FIELD,
        COURT,
        POOL,
        GYM,
        TRACK,
        MULTI_PURPOSE,
        SPECIALIZED
    }

    public enum VenueStatus {
        ACTIVE,
        INACTIVE,
        MAINTENANCE,
        TEMPORARILY_CLOSED,
        PERMANENTLY_CLOSED
    }
}
