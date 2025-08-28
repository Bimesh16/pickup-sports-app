package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.venue.CreateVenueRequest;
import com.bmessi.pickupsportsapp.dto.venue.VenueResponse;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.service.VenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/**
 * REST Controller for venue management operations.
 */
@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Venues", description = "Venue management endpoints")
public class VenueController {

    private final VenueService venueService;

    /**
     * Create a new venue.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new venue", description = "Creates a new venue with the provided details")
    public ResponseEntity<VenueResponse> createVenue(
            @Valid @RequestBody CreateVenueRequest request,
            Authentication authentication
    ) {
        log.info("Creating venue: {}", request.name());
        
        // Extract user ID from authentication
        Long userId = Long.valueOf(authentication.getName());
        
        VenueResponse venue = venueService.createVenue(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(venue);
    }

    /**
     * Get venue by ID.
     */
    @GetMapping("/{venueId}")
    @Operation(summary = "Get venue by ID", description = "Retrieves venue information by its ID")
    public ResponseEntity<VenueResponse> getVenueById(
            @Parameter(description = "Venue ID") @PathVariable Long venueId
    ) {
        log.debug("Fetching venue with ID: {}", venueId);
        
        VenueResponse venue = venueService.getVenueById(venueId);
        return ResponseEntity.ok(venue);
    }

    /**
     * Search venues with filters.
     */
    @GetMapping("/search")
    @Operation(summary = "Search venues", description = "Search venues with various filters")
    public ResponseEntity<Page<VenueResponse>> searchVenues(
            @Parameter(description = "City filter") @RequestParam(required = false) String city,
            @Parameter(description = "State filter") @RequestParam(required = false) String state,
            @Parameter(description = "Venue type filter") @RequestParam(required = false) Venue.VenueType venueType,
            @Parameter(description = "Minimum capacity") @RequestParam(required = false) Integer minCapacity,
            @Parameter(description = "Maximum capacity") @RequestParam(required = false) Integer maxCapacity,
            @Parameter(description = "Sport ID filter") @RequestParam(required = false) Long sportId,
            @Parameter(description = "Pagination and sorting") @PageableDefault(size = 20) Pageable pageable
    ) {
        log.debug("Searching venues with filters: city={}, state={}, type={}, capacity={}-{}, sport={}",
                city, state, venueType, minCapacity, maxCapacity, sportId);

        Page<VenueResponse> venues = venueService.searchVenues(
                city, state, venueType, minCapacity, maxCapacity, sportId, pageable
        );

        return ResponseEntity.ok(venues);
    }

    /**
     * Find venues within radius.
     */
    @GetMapping("/nearby")
    @Operation(summary = "Find nearby venues", description = "Find venues within a specified radius")
    public ResponseEntity<List<VenueResponse>> findVenuesWithinRadius(
            @Parameter(description = "Latitude") @RequestParam Double latitude,
            @Parameter(description = "Longitude") @RequestParam Double longitude,
            @Parameter(description = "Radius in kilometers") @RequestParam Double radiusKm
    ) {
        log.debug("Finding venues within {}km of ({}, {})", radiusKm, latitude, longitude);

        List<VenueResponse> venues = venueService.findVenuesWithinRadius(latitude, longitude, radiusKm);
        return ResponseEntity.ok(venues);
    }

    /**
     * Find venues available at a specific time.
     */
    @GetMapping("/available")
    @Operation(summary = "Find available venues", description = "Find venues available at a specific time")
    public ResponseEntity<List<VenueResponse>> findAvailableVenuesAtTime(
            @Parameter(description = "Day of week") @RequestParam DayOfWeek dayOfWeek,
            @Parameter(description = "Time") @RequestParam LocalTime time
    ) {
        log.debug("Finding venues available on {} at {}", dayOfWeek, time);

        List<VenueResponse> venues = venueService.findAvailableVenuesAtTime(dayOfWeek, time);
        return ResponseEntity.ok(venues);
    }

    /**
     * Find venues by price range.
     */
    @GetMapping("/price-range")
    @Operation(summary = "Find venues by price range", description = "Find venues within a specified price range")
    public ResponseEntity<Page<VenueResponse>> findVenuesByPriceRange(
            @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Pagination and sorting") @PageableDefault(size = 20) Pageable pageable
    ) {
        log.debug("Finding venues with price range: {} - {}", minPrice, maxPrice);

        Page<VenueResponse> venues = venueService.findVenuesByPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(venues);
    }

    /**
     * Find venues with specific amenities.
     */
    @GetMapping("/amenities")
    @Operation(summary = "Find venues by amenities", description = "Find venues that have specific amenities")
    public ResponseEntity<List<VenueResponse>> findVenuesByAmenities(
            @Parameter(description = "Amenity names") @RequestParam Set<String> amenityNames
    ) {
        log.debug("Finding venues with amenities: {}", amenityNames);

        List<VenueResponse> venues = venueService.findVenuesByAmenities(amenityNames);
        return ResponseEntity.ok(venues);
    }

    /**
     * Update venue status.
     */
    @PatchMapping("/{venueId}/status")
    @PreAuthorize("hasRole('ADMIN') or @venueService.isOwner(#venueId, authentication.principal)")
    @Operation(summary = "Update venue status", description = "Updates the status of a venue (Admin/Owner only)")
    public ResponseEntity<VenueResponse> updateVenueStatus(
            @Parameter(description = "Venue ID") @PathVariable Long venueId,
            @Parameter(description = "New status") @RequestParam Venue.VenueStatus status
    ) {
        log.info("Updating venue {} status to: {}", venueId, status);

        VenueResponse venue = venueService.updateVenueStatus(venueId, status);
        return ResponseEntity.ok(venue);
    }

    /**
     * Verify a venue.
     */
    @PostMapping("/{venueId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify venue", description = "Marks a venue as verified (Admin only)")
    public ResponseEntity<VenueResponse> verifyVenue(
            @Parameter(description = "Venue ID") @PathVariable Long venueId
    ) {
        log.info("Verifying venue: {}", venueId);

        VenueResponse venue = venueService.verifyVenue(venueId);
        return ResponseEntity.ok(venue);
    }

    /**
     * Get venues by owner.
     */
    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.principal.id")
    @Operation(summary = "Get venues by owner", description = "Retrieves all venues owned by a specific user")
    public ResponseEntity<List<VenueResponse>> getVenuesByOwner(
            @Parameter(description = "Owner ID") @PathVariable Long ownerId
    ) {
        log.debug("Fetching venues for owner: {}", ownerId);

        List<VenueResponse> venues = venueService.getVenuesByOwner(ownerId);
        return ResponseEntity.ok(venues);
    }

    /**
     * Get verified venues.
     */
    @GetMapping("/verified")
    @Operation(summary = "Get verified venues", description = "Retrieves all verified venues")
    public ResponseEntity<List<VenueResponse>> getVerifiedVenues() {
        log.debug("Fetching verified venues");

        List<VenueResponse> venues = venueService.getVerifiedVenues();
        return ResponseEntity.ok(venues);
    }
}
