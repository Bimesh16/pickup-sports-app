package com.bmessi.pickupsportsapp.service.location;

import lombok.Builder;

/**
 * Information about a country including its code, name, and region.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Builder
public record CountryInfo(
    String countryCode,
    String countryName,
    String region,
    String continent,
    String currency,
    String timezone,
    Boolean isSupported
) {}
