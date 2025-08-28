package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.venue.*;
import com.bmessi.pickupsportsapp.service.VenueBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for venue booking operations.
 */
@RestController
@RequestMapping("/venue-bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Venue Bookings", description = "Venue booking management endpoints")
public class VenueBookingController {

    private final VenueBookingService venueBookingService;

    /**
     * Check venue availability for a specific time range.
     */
    @GetMapping("/{venueId}/availability")
    @Operation(summary = "Check venue availability", description = "Check if a venue is available for a specific time range")
    public ResponseEntity<VenueBookingService.AvailabilityResult> checkAvailability(
            @Parameter(description = "Venue ID") @PathVariable Long venueId,
            @Parameter(description = "Start time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "End time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime
    ) {
        log.debug("Checking availability for venue {} from {} to {}", venueId, startTime, endTime);

        VenueBookingService.AvailabilityResult result = venueBookingService.checkAvailability(
                venueId, 
                startTime.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime(),
                endTime.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime()
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Get available time slots for a venue on a specific date.
     */
    @GetMapping("/{venueId}/time-slots")
    @Operation(summary = "Get available time slots", description = "Get available time slots for a venue on a specific date")
    public ResponseEntity<List<TimeSlot>> getAvailableTimeSlots(
            @Parameter(description = "Venue ID") @PathVariable Long venueId,
            @Parameter(description = "Date to check") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Sport to play") @RequestParam String sport
    ) {
        log.debug("Getting available time slots for venue {} on {} for sport {}", venueId, date, sport);

        List<TimeSlot> timeSlots = venueBookingService.getAvailableTimeSlots(venueId, date, sport);
        return ResponseEntity.ok(timeSlots);
    }

    /**
     * Create a venue booking.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create venue booking", description = "Create a new venue booking")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        log.info("Creating booking for venue {} by user {}", request.venueId(), authentication.getName());

        // Extract user ID from authentication
        Long userId = Long.valueOf(authentication.getName());

        BookingResponse booking = venueBookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    /**
     * Confirm a booking after payment.
     */
    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Confirm booking", description = "Confirm a booking after payment is processed")
    public ResponseEntity<Void> confirmBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId
    ) {
        log.info("Confirming booking: {}", bookingId);

        venueBookingService.confirmBooking(bookingId);
        return ResponseEntity.ok().build();
    }

    /**
     * Cancel a booking.
     */
    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel booking", description = "Cancel a venue booking")
    public ResponseEntity<Void> cancelBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @Parameter(description = "Cancellation reason") @RequestParam String reason,
            Authentication authentication
    ) {
        log.info("Cancelling booking: {} by user: {}", bookingId, authentication.getName());

        // Extract user ID from authentication
        Long userId = Long.valueOf(authentication.getName());

        venueBookingService.cancelBooking(bookingId, userId, reason);
        return ResponseEntity.ok().build();
    }

    /**
     * Get user's bookings.
     */
    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user bookings", description = "Get all bookings for the authenticated user")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        log.debug("Getting bookings for user: {}", authentication.getName());

        // Extract user ID from authentication
        Long userId = Long.valueOf(authentication.getName());

        List<BookingResponse> bookings = venueBookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get venue's bookings.
     */
    @GetMapping("/venue/{venueId}")
    @Operation(summary = "Get venue bookings", description = "Get all bookings for a specific venue")
    public ResponseEntity<List<BookingResponse>> getVenueBookings(
            @Parameter(description = "Venue ID") @PathVariable Long venueId
    ) {
        log.debug("Getting bookings for venue: {}", venueId);

        List<BookingResponse> bookings = venueBookingService.getVenueBookings(venueId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get upcoming bookings for a user.
     */
    @GetMapping("/my-bookings/upcoming")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get upcoming bookings", description = "Get upcoming bookings for the authenticated user")
    public ResponseEntity<List<BookingResponse>> getMyUpcomingBookings(Authentication authentication) {
        log.debug("Getting upcoming bookings for user: {}", authentication.getName());

        // Extract user ID from authentication
        Long userId = Long.valueOf(authentication.getName());

        List<BookingResponse> bookings = venueBookingService.getUserBookings(userId);
        // Filter for upcoming bookings (this could be optimized in the service)
        List<BookingResponse> upcomingBookings = bookings.stream()
                .filter(booking -> booking.startTime().isAfter(java.time.OffsetDateTime.now()))
                .toList();
        
        return ResponseEntity.ok(upcomingBookings);
    }

    /**
     * Get past bookings for a user.
     */
    @GetMapping("/my-bookings/past")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get past bookings", description = "Get past bookings for the authenticated user")
    public ResponseEntity<List<BookingResponse>> getMyPastBookings(Authentication authentication) {
        log.debug("Getting past bookings for user: {}", authentication.getName());

        // Extract user ID from authentication
        Long userId = Long.valueOf(authentication.getName());

        List<BookingResponse> bookings = venueBookingService.getUserBookings(userId);
        // Filter for past bookings (this could be optimized in the service)
        List<BookingResponse> pastBookings = bookings.stream()
                .filter(booking -> booking.startTime().isBefore(java.time.OffsetDateTime.now()))
                .toList();
        
        return ResponseEntity.ok(pastBookings);
    }
}
