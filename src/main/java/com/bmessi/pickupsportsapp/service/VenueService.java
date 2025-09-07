package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    public List<VenueSummary> getNearbyVenues(double latitude, double longitude, double radiusKm) {
        List<Venue> venues = venueRepository.findNearbyVenues(latitude, longitude, radiusKm);
        
        return venues.stream()
            .map(this::convertToVenueSummary)
            .collect(Collectors.toList());
    }

    public VenueSummary getVenueDetails(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new RuntimeException("Venue not found"));
        
        return convertToVenueSummary(venue);
    }

    public List<VenueSummary> searchVenues(String query, int page, int size) {
        List<Venue> venues = venueRepository.searchVenues(query, PageRequest.of(page, size))
            .getContent();
        
        return venues.stream()
            .map(this::convertToVenueSummary)
            .collect(Collectors.toList());
    }

    public List<VenueSummary> getTopRatedVenues(int limit) {
        List<Venue> venues = venueRepository.findTopRatedVenues(PageRequest.of(0, limit));
        
        return venues.stream()
            .map(this::convertToVenueSummary)
            .collect(Collectors.toList());
    }

    private VenueSummary convertToVenueSummary(Venue venue) {
        return VenueSummary.builder()
            .id(venue.getId())
            .name(venue.getName())
            .address(venue.getAddress())
            .latitude(venue.getLatitude())
            .longitude(venue.getLongitude())
            .description(venue.getDescription())
            .phone(venue.getPhone())
            .email(venue.getEmail())
            .website(venue.getWebsite())
            .rating(venue.getRating())
            .amenities(venue.getAmenities())
            .photos(venue.getPhotos())
            .build();
    }

    // DTO
    @lombok.Data
    @lombok.Builder
    public static class VenueSummary {
        private Long id;
        private String name;
        private String address;
        private Double latitude;
        private Double longitude;
        private String description;
        private String phone;
        private String email;
        private String website;
        private Double rating;
        private List<String> amenities;
        private List<String> photos;
    }
}