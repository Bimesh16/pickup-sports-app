package unit.com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.venue.BookingRequest;
import com.bmessi.pickupsportsapp.dto.venue.BookingResponse;
import com.bmessi.pickupsportsapp.dto.venue.TimeSlot;
import com.bmessi.pickupsportsapp.entity.*;
import com.bmessi.pickupsportsapp.repository.VenueBookingRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.VenueBookingService;
import com.bmessi.pickupsportsapp.service.payment.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.*;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueBookingServiceTest {

    @Mock
    private VenueBookingRepository venueBookingRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private VenueBookingService venueBookingService;

    private Venue venue;
    private User user;
    private Sport sport;
    private VenueBusinessHours businessHours;
    private BookingRequest bookingRequest;

    @BeforeEach
    void setUp() {
        sport = new Sport();
        sport.setId(1L);
        sport.setName("soccer");
        sport.setDisplayName("Soccer");

        businessHours = VenueBusinessHours.builder()
                .id(1L)
                .dayOfWeek(DayOfWeek.TUESDAY)
                .openTime(LocalTime.of(9, 0))
                .closeTime(LocalTime.of(22, 0))
                .isClosed(false)
                .build();

        venue = Venue.builder()
                .id(1L)
                .name("Central Park Soccer Field")
                .description("Professional soccer field")
                .address("123 Central Park West")
                .city("New York")
                .venueType(Venue.VenueType.OUTDOOR_FIELD)
                .maxCapacity(22)
                .minCapacity(10)
                .basePricePerHour(new BigDecimal("150.00"))
                .basePricePerPlayer(new BigDecimal("15.00"))
                .status(Venue.VenueStatus.ACTIVE)
                .supportedSports(Set.of(sport))
                .businessHours(Set.of(businessHours))
                .build();

        user = User.builder()
                .id(1L)
                .username("testuser")
                .password("password")
                .build();

        bookingRequest = new BookingRequest(
                1L,
                LocalDateTime.of(2026, 8, 25, 18, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), // Monday 6 PM
                LocalDateTime.of(2026, 8, 25, 20, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), // Monday 8 PM
                new BigDecimal("15.00"),
                "Soccer game for intermediate players"
        );
    }

    @Test
    void checkAvailability_Success() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueBookingRepository.findConflictingBookings(any(), any(), any())).thenReturn(List.of());

        // When
        VenueBookingService.AvailabilityResult result = venueBookingService.checkAvailability(
                1L, 
                LocalDateTime.of(2026, 8, 25, 18, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), 
                LocalDateTime.of(2026, 8, 25, 20, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime()
        );

        // Then
        assertTrue(result.isAvailable());
        assertEquals("Venue is available", result.reason());
        assertEquals(new BigDecimal("300.00"), result.totalCost()); // 2 hours * $150/hour

        verify(venueRepository).findById(1L);
        verify(venueBookingRepository).findConflictingBookings(any(), any(), any());
    }

    @Test
    void checkAvailability_VenueClosed() {
        // Given
        VenueBusinessHours closedBusinessHours = VenueBusinessHours.builder()
                .id(1L)
                .dayOfWeek(DayOfWeek.TUESDAY)
                .openTime(LocalTime.of(9, 0))
                .closeTime(LocalTime.of(22, 0))
                .isClosed(true)
                .build();
        
        Venue closedVenue = Venue.builder()
                .id(1L)
                .name("Central Park Soccer Field")
                .description("Professional soccer field")
                .address("123 Central Park West")
                .city("New York")
                .venueType(Venue.VenueType.OUTDOOR_FIELD)
                .maxCapacity(22)
                .minCapacity(10)
                .basePricePerHour(new BigDecimal("150.00"))
                .basePricePerPlayer(new BigDecimal("15.00"))
                .status(Venue.VenueStatus.ACTIVE)
                .supportedSports(Set.of(sport))
                .businessHours(Set.of(closedBusinessHours))
                .build();
        
        when(venueRepository.findById(1L)).thenReturn(Optional.of(closedVenue));

        // When
        VenueBookingService.AvailabilityResult result = venueBookingService.checkAvailability(
                1L, 
                LocalDateTime.of(2026, 8, 25, 18, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), 
                LocalDateTime.of(2026, 8, 25, 20, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime()
        );

        // Then
        assertFalse(result.isAvailable());
        assertEquals("Venue is not open during requested time", result.reason());
        assertNull(result.totalCost());
    }

    @Test
    void checkAvailability_ConflictingBooking() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueBookingRepository.findConflictingBookings(any(), any(), any()))
                .thenReturn(List.of(VenueBooking.builder().id(1L).build()));

        // When
        VenueBookingService.AvailabilityResult result = venueBookingService.checkAvailability(
                1L, 
                LocalDateTime.of(2026, 8, 25, 18, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), 
                LocalDateTime.of(2026, 8, 25, 20, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime()
        );

        // Then
        assertFalse(result.isAvailable());
        assertEquals("Venue is already booked during requested time", result.reason());
        assertNull(result.totalCost());
    }

    @Test
    void getAvailableTimeSlots_Success() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueBookingRepository.findConflictingBookings(any(), any(), any())).thenReturn(List.of());

        // When
        List<TimeSlot> timeSlots = venueBookingService.getAvailableTimeSlots(
                1L, 
                LocalDate.of(2026, 8, 25), // Monday
                "soccer"
        );

        // Then
        assertFalse(timeSlots.isEmpty());
        // Should have slots from 9 AM to 10 PM (12 slots of 1 hour each)
        assertEquals(12, timeSlots.size());

        verify(venueRepository).findById(1L);
    }

    @Test
    void getAvailableTimeSlots_VenueClosed() {
        // Given
        businessHours.setIsClosed(true);
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // When
        List<TimeSlot> timeSlots = venueBookingService.getAvailableTimeSlots(
                1L, 
                LocalDate.of(2026, 8, 25), // Monday
                "soccer"
        );

        // Then
        assertTrue(timeSlots.isEmpty());
    }

    @Test
    void getAvailableTimeSlots_SportNotSupported() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            venueBookingService.getAvailableTimeSlots(
                1L, 
                LocalDate.of(2026, 8, 25), // Monday
                "basketball"
            )
        );
    }

    @Test
    void createBooking_Success() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(venueBookingRepository.findConflictingBookings(any(), any(), any())).thenReturn(List.of());
        when(venueBookingRepository.save(any(VenueBooking.class))).thenAnswer(inv -> {
            VenueBooking booking = inv.getArgument(0);
            booking.setId(1L);
            return booking;
        });
        when(paymentService.createIntentForVenueBooking(any(), any(), any())).thenReturn("pi_123456");

        // When
        BookingResponse result = venueBookingService.createBooking(bookingRequest, 1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Central Park Soccer Field", result.venueName());
        assertEquals(new BigDecimal("300.00"), result.totalCost());
        assertEquals(VenueBooking.BookingStatus.PENDING, result.status());
        assertEquals("pi_123456", result.paymentIntentId());

        verify(venueBookingRepository).save(any(VenueBooking.class));
        verify(paymentService).createIntentForVenueBooking(any(), any(), any());
    }

    @Test
    void createBooking_VenueNotAvailable() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueBookingRepository.findConflictingBookings(any(), any(), any()))
                .thenReturn(List.of(VenueBooking.builder().id(1L).build()));

        // When & Then
        assertThrows(IllegalStateException.class, () -> 
            venueBookingService.createBooking(bookingRequest, 1L)
        );

        verify(venueRepository).findById(1L);
        verify(venueBookingRepository).findConflictingBookings(any(), any(), any());
        verify(venueBookingRepository, never()).save(any(VenueBooking.class));
    }

    @Test
    void createBooking_InvalidTimeRange() {
        // Given
        BookingRequest invalidRequest = new BookingRequest(
                1L,
                LocalDateTime.of(2026, 8, 25, 20, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), // 8 PM
                LocalDateTime.of(2026, 8, 25, 18, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), // 6 PM (after start time)
                new BigDecimal("15.00"),
                "Invalid time range"
        );

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            venueBookingService.createBooking(invalidRequest, 1L)
        );

        verify(venueBookingRepository, never()).save(any(VenueBooking.class));
    }
}
