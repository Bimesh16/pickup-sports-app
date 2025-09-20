package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.venue.BookingRequest;
import com.bmessi.pickupsportsapp.dto.venue.BookingResponse;
import com.bmessi.pickupsportsapp.dto.venue.TimeSlot;
import com.bmessi.pickupsportsapp.entity.*;
import com.bmessi.pickupsportsapp.repository.VenueBookingRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
// import com.bmessi.pickupsportsapp.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing venue bookings and availability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenueBookingService {

    private final VenueBookingRepository venueBookingRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    // private final PaymentService paymentService;

    /**
     * Check venue availability for a specific time range.
     */
    @Transactional(readOnly = true)
    public AvailabilityResult checkAvailability(Long venueId, OffsetDateTime startTime, OffsetDateTime endTime) {
        log.debug("Checking availability for venue {} from {} to {}", venueId, startTime, endTime);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        // Check business hours
        if (!isWithinBusinessHours(venue, startTime, endTime)) {
            return new AvailabilityResult(false, "Venue is not open during requested time", null);
        }

        // Check for conflicting bookings
        List<VenueBooking> conflictingBookings = venueBookingRepository.findConflictingBookings(
                venueId, startTime, endTime);

        if (!conflictingBookings.isEmpty()) {
            return new AvailabilityResult(false, "Venue is already booked during requested time", null);
        }

        // Calculate cost
        BigDecimal totalCost = calculateBookingCost(venue, startTime, endTime);

        return new AvailabilityResult(true, "Venue is available", totalCost);
    }

    /**
     * Get available time slots for a venue on a specific date.
     */
    @Transactional(readOnly = true)
    public List<TimeSlot> getAvailableTimeSlots(Long venueId, LocalDate date, String sport) {
        log.debug("Getting available time slots for venue {} on {} for sport {}", venueId, date, sport);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        // Check if venue supports the sport
        boolean supportsSport = venue.getSupportedSports().stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(sport));
        
        if (!supportsSport) {
            throw new IllegalArgumentException("Venue does not support sport: " + sport);
        }

        // Get business hours for the day
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        Optional<VenueBusinessHours> businessHours = venue.getBusinessHours().stream()
                .filter(bh -> bh.getDayOfWeek() == dayOfWeek)
                .findFirst();

        if (businessHours.isEmpty() || businessHours.get().getIsClosed()) {
            return List.of(); // Venue is closed on this day
        }

        VenueBusinessHours hours = businessHours.get();
        LocalTime openTime = hours.getOpenTime();
        LocalTime closeTime = hours.getCloseTime();

        // Generate time slots (e.g., 1-hour slots)
        List<TimeSlot> allSlots = generateTimeSlots(date, openTime, closeTime, Duration.ofHours(1));

        // Filter out unavailable slots
        return allSlots.stream()
                .filter(slot -> isSlotAvailable(venueId, slot.startTime(), slot.endTime()))
                .collect(Collectors.toList());
    }

    /**
     * Create a venue booking.
     */
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        log.info("Creating booking for venue {} by user {}", request.venueId(), userId);

        // Validate request
        validateBookingRequest(request);

        // Check availability
        AvailabilityResult availability = checkAvailability(request.venueId(), request.startTime(), request.endTime());
        if (!availability.isAvailable()) {
            throw new IllegalStateException("Venue is not available: " + availability.reason());
        }

        // Get venue and user
        Venue venue = venueRepository.findById(request.venueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        com.bmessi.pickupsportsapp.entity.game.Game game = gameRepository.findById(request.gameId())
                .orElseThrow(() -> new IllegalArgumentException("Game not found"));

        // Create booking
        VenueBooking booking = VenueBooking.builder()
                .venue(venue)
                .game(game)
                .bookedBy(user)
                .startTime(request.startTime())
                .endTime(request.endTime())
                .totalCost(availability.totalCost())
                .costPerPlayer(request.costPerPlayer())
                .status(VenueBooking.BookingStatus.PENDING)
                .paymentStatus(VenueBooking.PaymentStatus.PENDING)
                .notes(request.notes())
                .build();

        VenueBooking savedBooking = venueBookingRepository.save(booking);

        // Create payment intent (TODO: Restore when PaymentService is fixed)
        // String paymentIntentId = paymentService.createIntentForVenueBooking(
        //         savedBooking.getId(), venue.getId(), userId);
        String paymentIntentId = "temp_" + savedBooking.getId();
        savedBooking.setPaymentIntentId(paymentIntentId);
        venueBookingRepository.save(savedBooking);

        log.info("Created booking {} with payment intent {}", savedBooking.getId(), paymentIntentId);

        return new BookingResponse(
                savedBooking.getId(),
                savedBooking.getVenue().getName(),
                savedBooking.getGame().getId(),
                savedBooking.getStartTime(),
                savedBooking.getEndTime(),
                savedBooking.getTotalCost(),
                savedBooking.getStatus(),
                paymentIntentId
        );
    }

    /**
     * Confirm a booking after payment.
     */
    public void confirmBooking(Long bookingId) {
        log.info("Confirming booking: {}", bookingId);

        VenueBooking booking = venueBookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != VenueBooking.BookingStatus.PENDING) {
            throw new IllegalStateException("Booking is not in pending status");
        }

        booking.setStatus(VenueBooking.BookingStatus.CONFIRMED);
        booking.setPaymentStatus(VenueBooking.PaymentStatus.PAID);
        venueBookingRepository.save(booking);

        log.info("Booking {} confirmed successfully", bookingId);
    }

    /**
     * Cancel a booking.
     */
    public void cancelBooking(Long bookingId, Long userId, String reason) {
        log.info("Cancelling booking: {} by user: {}", bookingId, userId);

        VenueBooking booking = venueBookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Check if user can cancel (owner or admin)
        if (!booking.getBookedBy().getId().equals(userId)) {
            throw new IllegalStateException("User not authorized to cancel this booking");
        }

        if (booking.getStatus() == VenueBooking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        // Check cancellation policy
        if (!canCancelBooking(booking)) {
            throw new IllegalStateException("Booking cannot be cancelled according to policy");
        }

        booking.setStatus(VenueBooking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(OffsetDateTime.now());
        booking.setCancelledBy(userId);

        // Process refund if payment was made
        if (booking.getPaymentStatus() == VenueBooking.PaymentStatus.PAID) {
            BigDecimal refundAmount = calculateRefundAmount(booking);
            booking.setRefundAmount(refundAmount);
            // TODO: Process actual refund through payment service
        }

        venueBookingRepository.save(booking);
        log.info("Booking {} cancelled successfully", bookingId);
    }

    /**
     * Get user's bookings.
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        log.debug("Getting bookings for user: {}", userId);

        List<VenueBooking> bookings = venueBookingRepository.findByBookedById(userId);
        
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get venue's bookings.
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getVenueBookings(Long venueId) {
        log.debug("Getting bookings for venue: {}", venueId);

        List<VenueBooking> bookings = venueBookingRepository.findByVenueId(venueId);
        
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    // Helper methods

    private boolean isWithinBusinessHours(Venue venue, OffsetDateTime startTime, OffsetDateTime endTime) {
        DayOfWeek dayOfWeek = startTime.getDayOfWeek();
        
        Optional<VenueBusinessHours> businessHours = venue.getBusinessHours().stream()
                .filter(bh -> bh.getDayOfWeek() == dayOfWeek)
                .findFirst();

        if (businessHours.isEmpty() || businessHours.get().getIsClosed()) {
            return false;
        }

        VenueBusinessHours hours = businessHours.get();
        LocalTime startTimeOfDay = startTime.toLocalTime();
        LocalTime endTimeOfDay = endTime.toLocalTime();

        // Allow bookings that start at or after opening time and end at or before closing time
        return !startTimeOfDay.isBefore(hours.getOpenTime()) && 
               !endTimeOfDay.isAfter(hours.getCloseTime());
    }

    private List<TimeSlot> generateTimeSlots(LocalDate date, LocalTime openTime, LocalTime closeTime, Duration slotDuration) {
        List<TimeSlot> slots = new java.util.ArrayList<>();
        LocalDateTime current = LocalDateTime.of(date, openTime);
        LocalDateTime end = LocalDateTime.of(date, closeTime);

        while (current.plus(slotDuration).isBefore(end)) {
            slots.add(new TimeSlot(current, current.plus(slotDuration)));
            current = current.plus(slotDuration);
        }

        return slots;
    }

    private boolean isSlotAvailable(Long venueId, LocalDateTime startTime, LocalDateTime endTime) {
        // Convert LocalDateTime to OffsetDateTime for the repository call
        OffsetDateTime startOffset = startTime.atZone(ZoneId.systemDefault()).toOffsetDateTime();
        OffsetDateTime endOffset = endTime.atZone(ZoneId.systemDefault()).toOffsetDateTime();
        
        List<VenueBooking> conflictingBookings = venueBookingRepository.findConflictingBookings(
                venueId, startOffset, endOffset);
        return conflictingBookings.isEmpty();
    }

    private BigDecimal calculateBookingCost(Venue venue, OffsetDateTime startTime, OffsetDateTime endTime) {
        Duration duration = Duration.between(startTime, endTime);
        long hours = duration.toHours();
        
        if (venue.getBasePricePerHour() != null) {
            return venue.getBasePricePerHour().multiply(BigDecimal.valueOf(hours));
        }
        
        return BigDecimal.ZERO;
    }

    private void validateBookingRequest(BookingRequest request) {
        if (request.gameId() == null) {
            throw new IllegalArgumentException("Game ID is required");
        }

        if (request.startTime().isAfter(request.endTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.startTime().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }

        Duration duration = Duration.between(request.startTime(), request.endTime());
        if (duration.toHours() < 1) {
            throw new IllegalArgumentException("Booking must be at least 1 hour");
        }

        if (duration.toHours() > 24) {
            throw new IllegalArgumentException("Booking cannot exceed 24 hours");
        }
    }

    private boolean canCancelBooking(VenueBooking booking) {
        // Simple policy: can cancel if more than 24 hours before start
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startTime = booking.getStartTime();
        
        return Duration.between(now, startTime).toHours() > 24;
    }

    private BigDecimal calculateRefundAmount(VenueBooking booking) {
        // Simple policy: full refund if cancelled more than 24 hours before
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startTime = booking.getStartTime();
        
        if (Duration.between(now, startTime).toHours() > 24) {
            return booking.getTotalCost();
        }
        
        // Partial refund: 50% if cancelled within 24 hours
        return booking.getTotalCost().multiply(BigDecimal.valueOf(0.5));
    }

    private BookingResponse mapToBookingResponse(VenueBooking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getVenue().getName(),
                booking.getGame() != null ? booking.getGame().getId() : null,
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalCost(),
                booking.getStatus(),
                booking.getPaymentIntentId()
        );
    }

    // Response classes
    public record AvailabilityResult(boolean isAvailable, String reason, BigDecimal totalCost) {}
}
