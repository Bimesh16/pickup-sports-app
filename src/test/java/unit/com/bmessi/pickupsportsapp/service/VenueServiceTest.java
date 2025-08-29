package unit.com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.venue.CreateVenueRequest;
import com.bmessi.pickupsportsapp.dto.venue.VenueResponse;
import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.service.VenueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private SportRepository sportRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VenueService venueService;

    private CreateVenueRequest createVenueRequest;
    private Venue venue;
    private Sport sport;

    @BeforeEach
    void setUp() {
        sport = new Sport();
        sport.setId(1L);
        sport.setName("soccer");
        sport.setDisplayName("Soccer");

        createVenueRequest = new CreateVenueRequest(
                "Central Park Soccer Field",
                "Professional soccer field with artificial turf",
                "123 Central Park West",
                "New York",
                "NY",
                "USA",
                "10023",
                40.7829,
                -73.9654,
                Venue.VenueType.OUTDOOR_FIELD,
                22,
                10,
                new BigDecimal("150.00"),
                new BigDecimal("15.00"),
                "+1-555-123-4567",
                "info@centralpark.com",
                "https://centralpark.com",
                Set.of(1L),
                List.of(),
                List.of()
        );

        venue = Venue.builder()
                .id(1L)
                .name("Central Park Soccer Field")
                .description("Professional soccer field with artificial turf")
                .address("123 Central Park West")
                .city("New York")
                .state("NY")
                .country("USA")
                .postalCode("10023")
                .latitude(40.7829)
                .longitude(-73.9654)
                .venueType(Venue.VenueType.OUTDOOR_FIELD)
                .maxCapacity(22)
                .minCapacity(10)
                .basePricePerHour(new BigDecimal("150.00"))
                .basePricePerPlayer(new BigDecimal("15.00"))
                .ownerId(1L)
                .contactPhone("+1-555-123-4567")
                .contactEmail("info@centralpark.com")
                .websiteUrl("https://centralpark.com")
                .status(Venue.VenueStatus.ACTIVE)
                .isVerified(false)
                .supportedSports(Set.of(sport))
                .build();
    }

    @Test
    void createVenue_Success() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        when(venueRepository.existsByNameAndCity("Central Park Soccer Field", "New York", null)).thenReturn(false);
        when(sportRepository.findAllById(Set.of(1L))).thenReturn(List.of(sport));
        when(venueRepository.save(any(Venue.class))).thenReturn(venue);

        // When
        VenueResponse result = venueService.createVenue(createVenueRequest, 1L);

        // Then
        assertNotNull(result);
        assertEquals("Central Park Soccer Field", result.name());
        assertEquals("New York", result.city());
        assertEquals(Venue.VenueType.OUTDOOR_FIELD, result.venueType());
        assertEquals(22, result.maxCapacity());
        assertEquals(10, result.minCapacity());
        assertEquals(new BigDecimal("150.00"), result.basePricePerHour());
        assertEquals(new BigDecimal("15.00"), result.basePricePerPlayer());
        assertEquals(1L, result.ownerId());
        assertFalse(result.isVerified());

        verify(venueRepository).save(any(Venue.class));
        verify(sportRepository).findAllById(Set.of(1L));
    }

    @Test
    void createVenue_OwnerNotFound_ThrowsException() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(false);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            venueService.createVenue(createVenueRequest, 1L)
        );

        verify(venueRepository, never()).save(any(Venue.class));
    }

    @Test
    void createVenue_DuplicateNameInCity_ThrowsException() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        when(venueRepository.existsByNameAndCity("Central Park Soccer Field", "New York", null)).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            venueService.createVenue(createVenueRequest, 1L)
        );

        verify(venueRepository, never()).save(any(Venue.class));
    }

    @Test
    void getVenueById_Success() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // When
        VenueResponse result = venueService.getVenueById(1L);

        // Then
        assertNotNull(result);
        assertEquals("Central Park Soccer Field", result.name());
        assertEquals("New York", result.city());
    }

    @Test
    void getVenueById_NotFound_ThrowsException() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            venueService.getVenueById(1L)
        );
    }
}
