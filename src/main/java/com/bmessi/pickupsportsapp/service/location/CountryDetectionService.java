package com.bmessi.pickupsportsapp.service.location;

/**
 * Service for detecting user country and location information.
 * 
 * <p>This service provides country detection capabilities to enable
 * location-based routing and country-specific features.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
public interface CountryDetectionService {

    /**
     * Detects the country code from GPS coordinates.
     * 
     * @param latitude GPS latitude
     * @param longitude GPS longitude
     * @return ISO 3166-1 alpha-2 country code (e.g., "NP", "IN", "US")
     */
    String detectCountry(Double latitude, Double longitude);

    /**
     * Gets country information including name and region.
     * 
     * @param countryCode ISO country code
     * @return Country information
     */
    CountryInfo getCountryInfo(String countryCode);

    /**
     * Checks if a country is supported by the application.
     * 
     * @param countryCode ISO country code
     * @return true if country is supported
     */
    boolean isCountrySupported(String countryCode);
}
