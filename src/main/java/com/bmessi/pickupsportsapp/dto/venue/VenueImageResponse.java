package com.bmessi.pickupsportsapp.dto.venue;

/**
 * Response for venue images.
 */
public record VenueImageResponse(
        Long id,
        String imageUrl,
        String altText,
        Boolean isPrimary,
        Integer sortOrder
) {}
