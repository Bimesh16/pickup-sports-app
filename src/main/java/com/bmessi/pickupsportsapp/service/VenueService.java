package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.venue.CreateVenueRequest;
import com.bmessi.pickupsportsapp.dto.venue.VenueResponse;
import com.bmessi.pickupsportsapp.dto.venue.SportSummary;
import com.bmessi.pickupsportsapp.dto.venue.VenueAmenityResponse;
import com.bmessi.pickupsportsapp.dto.venue.VenueBusinessHoursResponse;
import com.bmessi.pickupsportsapp.dto.venue.VenueImageResponse;
import com.bmessi.pickupsportsapp.entity.*;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing venues and related operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenueService {

    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;
    private final UserRepository userRepository;

    /**
     * Create a new venue.
     */
    public VenueResponse createVenue(CreateVenueRequest request, Long ownerId) {
        log.info("Creating venue: {} for owner: {}", request.name(), ownerId);

        // Validate owner exists
        if (!userRepository.existsById(ownerId)) {
            throw new IllegalArgumentException("Owner not found with ID: " + ownerId);
        }

        // Check if venue name is unique in the city
        if (venueRepository.existsByNameAndCity(request.name(), request.city(), null)) {
            throw new IllegalArgumentException("Venue name already exists in this city");
        }

        // Build venue
        Venue venue = Venue.builder()
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .postalCode(request.postalCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .venueType(request.venueType())
                .maxCapacity(request.maxCapacity())
                .minCapacity(request.minCapacity())
                .basePricePerHour(request.basePricePerHour())
                .basePricePerPlayer(request.basePricePerPlayer())
                .ownerId(ownerId)
                .contactPhone(request.contactPhone())
                .contactEmail(request.contactEmail())
                .websiteUrl(request.websiteUrl())
                .status(Venue.VenueStatus.ACTIVE)
                .isVerified(false)
                .build();

        // Add supported sports
        if (request.sportIds() != null && !request.sportIds().isEmpty()) {
            Set<Sport> sports = sportRepository.findAllById(request.sportIds())
                    .stream()
                    .collect(Collectors.toSet());
            venue.setSupportedSports(sports);
        }

        // Add amenities
        if (request.amenities() != null) {
            request.amenities().forEach(amenityRequest -> {
                VenueAmenity amenity = VenueAmenity.builder()
                        .name(amenityRequest.name())
                        .description(amenityRequest.description())
                        .isAvailable(true)
                        .build();
                venue.addAmenity(amenity);
            });
        }

        // Add business hours
        if (request.businessHours() != null) {
            request.businessHours().forEach(hoursRequest -> {
                VenueBusinessHours hours = VenueBusinessHours.builder()
                        .dayOfWeek(hoursRequest.dayOfWeek())
                        .openTime(hoursRequest.openTime())
                        .closeTime(hoursRequest.closeTime())
                        .isClosed(hoursRequest.isClosed() != null ? hoursRequest.isClosed() : false)
                        .build();
                venue.addBusinessHours(hours);
            });
        }

        Venue savedVenue = venueRepository.save(venue);
        log.info("Created venue with ID: {}", savedVenue.getId());

        return mapToVenueResponse(savedVenue);
    }

    /**
     * Get venue by ID.
     */
    @Transactional(readOnly = true)
    public VenueResponse getVenueById(Long venueId) {
        log.debug("Fetching venue by ID: {}", venueId);
        
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        return mapToVenueResponse(venue);
    }

    /**
     * Search venues with filters.
     */
    @Transactional(readOnly = true)
    public Page<VenueResponse> searchVenues(
            String city,
            String state,
            Venue.VenueType venueType,
            Integer minCapacity,
            Integer maxCapacity,
            Long sportId,
            Pageable pageable
    ) {
        log.debug("Searching venues with filters: city={}, state={}, type={}, capacity={}-{}, sport={}",
                city, state, venueType, minCapacity, maxCapacity, sportId);

        Page<Venue> venues = venueRepository.searchVenues(
                city, state, venueType, minCapacity, maxCapacity, sportId, pageable
        );

        return venues.map(this::mapToVenueResponse);
    }

    /**
     * Find venues within radius.
     */
    @Transactional(readOnly = true)
    public List<VenueResponse> findVenuesWithinRadius(Double latitude, Double longitude, Double radiusKm) {
        log.debug("Finding venues within {}km of ({}, {})", radiusKm, latitude, longitude);

        List<Object[]> results = venueRepository.findVenuesWithinRadius(latitude, longitude, radiusKm);
        
        return results.stream()
                .map(result -> {
                    Venue venue = (Venue) result[0];
                    Double distance = (Double) result[1];
                    VenueResponse response = mapToVenueResponse(venue);
                    // Note: We could extend VenueResponse to include distance if needed
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Find venues available at a specific time.
     */
    @Transactional(readOnly = true)
    public List<VenueResponse> findAvailableVenuesAtTime(DayOfWeek dayOfWeek, LocalTime time) {
        log.debug("Finding venues available on {} at {}", dayOfWeek, time);

        List<Venue> venues = venueRepository.findAvailableVenuesAtTime(dayOfWeek, time);
        return venues.stream()
                .map(this::mapToVenueResponse)
                .collect(Collectors.toList());
    }

    /**
     * Find venues by price range.
     */
    @Transactional(readOnly = true)
    public Page<VenueResponse> findVenuesByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.debug("Finding venues with price range: {} - {}", minPrice, maxPrice);

        Page<Venue> venues = venueRepository.findByPriceRange(minPrice, maxPrice, pageable);
        return venues.map(this::mapToVenueResponse);
    }

    /**
     * Find venues with specific amenities.
     */
    @Transactional(readOnly = true)
    public List<VenueResponse> findVenuesByAmenities(Set<String> amenityNames) {
        log.debug("Finding venues with amenities: {}", amenityNames);

        List<Venue> venues = venueRepository.findByAmenities(amenityNames);
        return venues.stream()
                .map(this::mapToVenueResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update venue status.
     */
    public VenueResponse updateVenueStatus(Long venueId, Venue.VenueStatus status) {
        log.info("Updating venue {} status to: {}", venueId, status);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        venue.setStatus(status);
        Venue updatedVenue = venueRepository.save(venue);

        return mapToVenueResponse(updatedVenue);
    }

    /**
     * Verify a venue.
     */
    public VenueResponse verifyVenue(Long venueId) {
        log.info("Verifying venue: {}", venueId);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        venue.setIsVerified(true);
        Venue verifiedVenue = venueRepository.save(venue);

        return mapToVenueResponse(verifiedVenue);
    }

    /**
     * Get venues by owner.
     */
    @Transactional(readOnly = true)
    public List<VenueResponse> getVenuesByOwner(Long ownerId) {
        log.debug("Fetching venues for owner: {}", ownerId);

        List<Venue> venues = venueRepository.findByOwnerId(ownerId);
        return venues.stream()
                .map(this::mapToVenueResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get verified venues.
     */
    @Transactional(readOnly = true)
    public List<VenueResponse> getVerifiedVenues() {
        log.debug("Fetching verified venues");

        List<Venue> venues = venueRepository.findByIsVerifiedTrue();
        return venues.stream()
                .map(this::mapToVenueResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map venue entity to response DTO.
     */
    private VenueResponse mapToVenueResponse(Venue venue) {
        return new VenueResponse(
                venue.getId(),
                venue.getName(),
                venue.getDescription(),
                venue.getAddress(),
                venue.getCity(),
                venue.getState(),
                venue.getCountry(),
                venue.getPostalCode(),
                venue.getLatitude(),
                venue.getLongitude(),
                venue.getVenueType(),
                venue.getMaxCapacity(),
                venue.getMinCapacity(),
                venue.getStatus(),
                venue.getBasePricePerHour(),
                venue.getBasePricePerPlayer(),
                venue.getIsVerified(),
                venue.getOwnerId(),
                venue.getContactPhone(),
                venue.getContactEmail(),
                venue.getWebsiteUrl(),
                venue.getCreatedAt(),
                venue.getUpdatedAt(),
                venue.getSupportedSports().stream()
                        .map(sport -> new SportSummary(sport.getId(), sport.getName(), sport.getDisplayName()))
                        .collect(Collectors.toSet()),
                venue.getAmenities().stream()
                        .map(amenity -> new VenueAmenityResponse(
                                amenity.getId(), amenity.getName(), amenity.getDescription(), amenity.getIsAvailable()))
                        .collect(Collectors.toList()),
                venue.getBusinessHours().stream()
                        .map(hours -> new VenueBusinessHoursResponse(
                                hours.getId(), hours.getDayOfWeek(), hours.getOpenTime(), hours.getCloseTime(), hours.getIsClosed()))
                        .collect(Collectors.toList()),
                venue.getImages().stream()
                        .map(image -> new VenueImageResponse(
                                image.getId(), image.getImageUrl(), image.getAltText(), image.getIsPrimary(), image.getSortOrder()))
                        .collect(Collectors.toList())
        );
    }
}
