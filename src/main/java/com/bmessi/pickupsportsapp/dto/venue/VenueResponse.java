package com.bmessi.pickupsportsapp.dto.venue;

import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.dto.venue.SportSummary;
import com.bmessi.pickupsportsapp.dto.venue.VenueAmenityResponse;
import com.bmessi.pickupsportsapp.dto.venue.VenueBusinessHoursResponse;
import com.bmessi.pickupsportsapp.dto.venue.VenueImageResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

/**
 * Response payload for venue information.
 */
@Schema(name = "VenueResponse", description = "Venue information response")
public record VenueResponse(
        @Schema(description = "Venue identifier", example = "42")
        Long id,

        @Schema(description = "Venue name", example = "Central Park Soccer Field")
        String name,

        @Schema(description = "Venue description", example = "Professional soccer field with artificial turf")
        String description,

        @Schema(description = "Full address", example = "123 Central Park West")
        String address,

        @Schema(description = "City", example = "New York")
        String city,

        @Schema(description = "State/Province", example = "NY")
        String state,

        @Schema(description = "Country", example = "USA")
        String country,

        @Schema(description = "Postal code", example = "10023")
        String postalCode,

        @Schema(description = "Latitude in degrees", example = "40.7829")
        Double latitude,

        @Schema(description = "Longitude in degrees", example = "-73.9654")
        Double longitude,

        @Schema(description = "Type of venue", example = "OUTDOOR_FIELD")
        Venue.VenueType venueType,

        @Schema(description = "Maximum capacity", example = "22")
        Integer maxCapacity,

        @Schema(description = "Minimum capacity", example = "10")
        Integer minCapacity,

        @Schema(description = "Venue status", example = "ACTIVE")
        Venue.VenueStatus status,

        @Schema(description = "Base price per hour", example = "150.00")
        BigDecimal basePricePerHour,

        @Schema(description = "Base price per player", example = "15.00")
        BigDecimal basePricePerPlayer,

        @Schema(description = "Whether venue is verified", example = "true")
        Boolean isVerified,

        @Schema(description = "Owner ID", example = "123")
        Long ownerId,

        @Schema(description = "Contact phone number", example = "+1-555-123-4567")
        String contactPhone,

        @Schema(description = "Contact email", example = "info@centralpark.com")
        String contactEmail,

        @Schema(description = "Website URL", example = "https://centralpark.com")
        String websiteUrl,

        @Schema(description = "Creation timestamp")
        OffsetDateTime createdAt,

        @Schema(description = "Last update timestamp")
        OffsetDateTime updatedAt,

        @Schema(description = "List of supported sports")
        Set<SportSummary> supportedSports,

        @Schema(description = "List of amenities")
        List<VenueAmenityResponse> amenities,

        @Schema(description = "Business hours")
        List<VenueBusinessHoursResponse> businessHours,

        @Schema(description = "List of venue images")
        List<VenueImageResponse> images
) {}
