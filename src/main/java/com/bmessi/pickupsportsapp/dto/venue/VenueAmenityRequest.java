package com.bmessi.pickupsportsapp.dto.venue;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for venue amenities.
 */
@Schema(name = "VenueAmenityRequest", description = "Request body for venue amenities")
public record VenueAmenityRequest(
        @Schema(description = "Amenity name", example = "Parking")
        @NotBlank @Size(max = 100)
        String name,
        
        @Schema(description = "Amenity description", example = "Free parking available")
        @Size(max = 500)
        String description
) {}
