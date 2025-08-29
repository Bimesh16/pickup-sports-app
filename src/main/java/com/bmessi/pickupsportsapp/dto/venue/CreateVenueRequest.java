package com.bmessi.pickupsportsapp.dto.venue;

import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.dto.venue.VenueAmenityRequest;
import com.bmessi.pickupsportsapp.dto.venue.VenueBusinessHoursRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Request payload for creating a new venue.
 */
@Schema(name = "CreateVenueRequest", description = "Request body to create a venue")
public record CreateVenueRequest(

        @Schema(description = "Venue name", example = "Central Park Soccer Field")
        @NotBlank @Size(max = 255)
        String name,

        @Schema(description = "Venue description", example = "Professional soccer field with artificial turf")
        @Size(max = 1000)
        String description,

        @Schema(description = "Full address", example = "123 Central Park West")
        @NotBlank @Size(max = 500)
        String address,

        @Schema(description = "City", example = "New York")
        @NotBlank @Size(max = 100)
        String city,

        @Schema(description = "State/Province", example = "NY")
        @Size(max = 100)
        String state,

        @Schema(description = "Country", example = "USA")
        @Size(max = 100)
        String country,

        @Schema(description = "Postal code", example = "10023")
        @Size(max = 20)
        String postalCode,

        @Schema(description = "Latitude in degrees", example = "40.7829")
        @DecimalMin(value = "-90.0", inclusive = true, message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", inclusive = true, message = "Latitude must be <= 90")
        Double latitude,

        @Schema(description = "Longitude in degrees", example = "-73.9654")
        @DecimalMin(value = "-180.0", inclusive = true, message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", inclusive = true, message = "Longitude must be <= 180")
        Double longitude,

        @Schema(description = "Type of venue", example = "OUTDOOR_FIELD")
        @NotNull
        Venue.VenueType venueType,

        @Schema(description = "Maximum capacity", example = "22")
        @Min(value = 1, message = "Max capacity must be at least 1")
        @Max(value = 1000, message = "Max capacity cannot exceed 1000")
        Integer maxCapacity,

        @Schema(description = "Minimum capacity", example = "10")
        @Min(value = 1, message = "Min capacity must be at least 1")
        Integer minCapacity,

        @Schema(description = "Base price per hour", example = "150.00")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits and 2 decimal places")
        BigDecimal basePricePerHour,

        @Schema(description = "Base price per player", example = "15.00")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price per player must be non-negative")
        @Digits(integer = 6, fraction = 2, message = "Price per player must have at most 6 digits and 2 decimal places")
        BigDecimal basePricePerPlayer,

        @Schema(description = "Contact phone number", example = "+1-555-123-4567")
        @Pattern(regexp = "^[+]?[0-9\\s\\-()]+$", message = "Invalid phone number format")
        @Size(max = 20)
        String contactPhone,

        @Schema(description = "Contact email", example = "info@centralpark.com")
        @Email(message = "Invalid email format")
        @Size(max = 255)
        String contactEmail,

        @Schema(description = "Website URL", example = "https://centralpark.com")
        @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$", message = "Invalid URL format")
        @Size(max = 500)
        String websiteUrl,

        @Schema(description = "List of sport IDs this venue supports")
        @NotEmpty(message = "At least one sport must be specified")
        Set<Long> sportIds,

        @Schema(description = "List of amenities available at this venue")
        List<VenueAmenityRequest> amenities,

        @Schema(description = "Business hours for each day of the week")
        List<VenueBusinessHoursRequest> businessHours
) {}
