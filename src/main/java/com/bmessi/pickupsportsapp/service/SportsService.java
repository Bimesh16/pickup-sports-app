package com.bmessi.pickupsportsapp.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class SportsService {

    public List<SportSummary> getAvailableSports() {
        return Arrays.asList(
            SportSummary.builder()
                .id("FOOTBALL")
                .name("Football")
                .description("The beautiful game")
                .icon("⚽")
                .isPopular(true)
                .build(),
            SportSummary.builder()
                .id("BASKETBALL")
                .name("Basketball")
                .description("Fast-paced court game")
                .icon("🏀")
                .isPopular(true)
                .build(),
            SportSummary.builder()
                .id("CRICKET")
                .name("Cricket")
                .description("Gentleman's game")
                .icon("🏏")
                .isPopular(true)
                .build(),
            SportSummary.builder()
                .id("BADMINTON")
                .name("Badminton")
                .description("Fast racket sport")
                .icon("🏸")
                .isPopular(false)
                .build(),
            SportSummary.builder()
                .id("TENNIS")
                .name("Tennis")
                .description("Classic racket sport")
                .icon("🎾")
                .isPopular(false)
                .build(),
            SportSummary.builder()
                .id("VOLLEYBALL")
                .name("Volleyball")
                .description("Team net sport")
                .icon("🏐")
                .isPopular(false)
                .build(),
            SportSummary.builder()
                .id("TABLE_TENNIS")
                .name("Table Tennis")
                .description("Indoor racket sport")
                .icon("🏓")
                .isPopular(false)
                .build(),
            SportSummary.builder()
                .id("FUTSAL")
                .name("Futsal")
                .description("Indoor football")
                .icon("⚽")
                .isPopular(true)
                .build()
        );
    }

    public List<SportSummary> getPopularSports() {
        return getAvailableSports().stream()
            .filter(SportSummary::isPopular)
            .toList();
    }

    public CountryInfo detectCountry(double latitude, double longitude) {
        // Mock country detection based on coordinates
        // In real implementation, this would use a geocoding service
        if (latitude >= 26.0 && latitude <= 30.0 && longitude >= 80.0 && longitude <= 88.0) {
            return CountryInfo.builder()
                .countryCode("NP")
                .countryName("Nepal")
                .currency("NPR")
                .timezone("Asia/Kathmandu")
                .build();
        } else if (latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0) {
            return CountryInfo.builder()
                .countryCode("IN")
                .countryName("India")
                .currency("INR")
                .timezone("Asia/Kolkata")
                .build();
        } else {
            return CountryInfo.builder()
                .countryCode("US")
                .countryName("United States")
                .currency("USD")
                .timezone("America/New_York")
                .build();
        }
    }

    public List<CountryInfo> getSupportedCountries() {
        return Arrays.asList(
            CountryInfo.builder()
                .countryCode("NP")
                .countryName("Nepal")
                .currency("NPR")
                .timezone("Asia/Kathmandu")
                .isSupported(true)
                .build(),
            CountryInfo.builder()
                .countryCode("IN")
                .countryName("India")
                .currency("INR")
                .timezone("Asia/Kolkata")
                .isSupported(true)
                .build(),
            CountryInfo.builder()
                .countryCode("US")
                .countryName("United States")
                .currency("USD")
                .timezone("America/New_York")
                .isSupported(true)
                .build(),
            CountryInfo.builder()
                .countryCode("CA")
                .countryName("Canada")
                .currency("CAD")
                .timezone("America/Toronto")
                .isSupported(true)
                .build()
        );
    }

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class SportSummary {
        private String id;
        private String name;
        private String description;
        private String icon;
        private boolean isPopular;
    }

    @lombok.Data
    @lombok.Builder
    public static class CountryInfo {
        private String countryCode;
        private String countryName;
        private String currency;
        private String timezone;
        private boolean isSupported;
    }
}