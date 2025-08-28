package com.bmessi.pickupsportsapp.dto.venue;

/**
 * Response for venue amenities.
 */
public record VenueAmenityResponse(
        Long id,
        String name,
        String description,
        Boolean isAvailable
) {}
