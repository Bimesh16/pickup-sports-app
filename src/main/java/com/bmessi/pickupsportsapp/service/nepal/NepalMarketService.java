package com.bmessi.pickupsportsapp.service.nepal;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Nepal Market Service for country-specific game discovery and analytics.
 * 
 * <p>This service provides Nepal-optimized game discovery, venue recommendations,
 * and market analytics tailored for the local sports culture and preferences.</p>
 * 
 * <p><strong>Nepal Focus Areas:</strong></p>
 * <ul>
 *   <li><strong>Futsal Priority:</strong> Indoor soccer is the most popular sport</li>
 *   <li><strong>Kathmandu Valley:</strong> Primary market with high density</li>
 *   <li><strong>Regional Centers:</strong> Pokhara, Biratnagar, Birgunj expansion</li>
 *   <li><strong>Local Culture:</strong> Time slots, pricing, and preferences</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NepalMarketService {

    private final GameRepository gameRepository;
    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;

    // ==================== Futsal-Focused Game Discovery ====================

    /**
     * Find nearby futsal games optimized for Nepal market.
     */
    public List<FutsalGameDTO> findNearbyFutsal(Double latitude, Double longitude, Double radiusKm, String timeSlot) {
        log.info("Finding nearby futsal games at ({}, {}) within {}km, timeSlot: {}", latitude, longitude, radiusKm, timeSlot);
        
        // Get futsal sport
        Sport futsal = sportRepository.findByNameIgnoreCase("futsal");
        if (futsal == null) {
            log.warn("Futsal sport not found, returning empty list");
            return new ArrayList<>();
        }
        
        // Use existing location-based search method
        Page<Game> gamePage = gameRepository.findByLocationWithinRadius(
                "futsal", null, null, null, null, latitude, longitude, radiusKm, 
                PageRequest.of(0, 50)); // Get up to 50 games
        
        List<Game> games = gamePage.getContent();
        
        return games.stream()
                .filter(game -> timeSlot == null || isInTimeSlot(game.getTime(), timeSlot))
                .map(this::convertToFutsalGameDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get popular futsal areas in Kathmandu Valley.
     */
    public List<PopularAreaDTO> getPopularFutsalAreas() {
        log.info("Getting popular futsal areas in Kathmandu Valley");
        
        List<PopularAreaDTO> areas = new ArrayList<>();
        
        // Popular areas based on Nepal market research
        areas.add(PopularAreaDTO.builder()
                .areaName("Baneshwor")
                .nepaliName("बनेश्वर")
                .latitude(27.7172)
                .longitude(85.3240)
                .activeGames(15)
                .totalVenues(8)
                .averagePrice(250.0)
                .popularityLevel("HIGH")
                .bestTimeSlot("EVENING")
                .totalPlayers(120)
                .build());
        
        areas.add(PopularAreaDTO.builder()
                .areaName("Koteshwor")
                .nepaliName("कोटेश्वर")
                .latitude(27.6783)
                .longitude(85.3555)
                .activeGames(12)
                .totalVenues(6)
                .averagePrice(280.0)
                .popularityLevel("HIGH")
                .bestTimeSlot("EVENING")
                .totalPlayers(95)
                .build());
        
        areas.add(PopularAreaDTO.builder()
                .areaName("Thapathali")
                .nepaliName("थापाथली")
                .latitude(27.6894)
                .longitude(85.3206)
                .activeGames(10)
                .totalVenues(5)
                .averagePrice(300.0)
                .popularityLevel("MEDIUM")
                .bestTimeSlot("MORNING")
                .totalPlayers(75)
                .build());
        
        areas.add(PopularAreaDTO.builder()
                .areaName("Kupondole")
                .nepaliName("कुपण्डोल")
                .latitude(27.6783)
                .longitude(85.3100)
                .activeGames(8)
                .totalVenues(4)
                .averagePrice(350.0)
                .popularityLevel("MEDIUM")
                .bestTimeSlot("NIGHT")
                .totalPlayers(60)
                .build());
        
        return areas;
    }

    /**
     * Get localized sports with Nepali translations.
     */
    public List<LocalizedSportDTO> getLocalizedSports() {
        log.info("Getting sports with Nepali translations");
        
        List<LocalizedSportDTO> sports = new ArrayList<>();
        
        // Futsal (most popular in Nepal)
        sports.add(LocalizedSportDTO.builder()
                .sportId(1L)
                .englishName("Futsal")
                .nepaliName("फुटसल")
                .description("Indoor football variant")
                .nepaliDescription("भित्री फुटबलको एक प्रकार")
                .category("BALL_SPORTS")
                .equipment("Futsal ball, indoor shoes, shin guards")
                .rules("FIFA Futsal rules with 5 players per team")
                .nepaliRules("पाँच खेलाडी भएको टोलीको फिफा फुटसल नियम")
                .isPopular(true)
                .iconPath("/icons/futsal.png")
                .build());
        
        // Soccer (traditional football)
        sports.add(LocalizedSportDTO.builder()
                .sportId(2L)
                .englishName("Soccer")
                .nepaliName("फुटबल")
                .description("Traditional football with 11 players")
                .nepaliDescription("एघार खेलाडी भएको परम्परागत फुटबल")
                .category("BALL_SPORTS")
                .equipment("Soccer cleats, ball, goals")
                .rules("FIFA football rules")
                .nepaliRules("फिफा फुटबल नियम")
                .isPopular(true)
                .iconPath("/icons/soccer.png")
                .build());
        
        // Cricket (growing popularity)
        sports.add(LocalizedSportDTO.builder()
                .sportId(3L)
                .englishName("Cricket")
                .nepaliName("क्रिकेट")
                .description("Bat and ball sport")
                .nepaliDescription("ब्याट र बल खेल")
                .category("TRADITIONAL")
                .equipment("Cricket bat, ball, protective gear")
                .rules("ICC cricket rules")
                .nepaliRules("आईसीसी क्रिकेट नियम")
                .isPopular(true)
                .iconPath("/icons/cricket.png")
                .build());
        
        // Volleyball (popular in rural areas)
        sports.add(LocalizedSportDTO.builder()
                .sportId(4L)
                .englishName("Volleyball")
                .nepaliName("भलिबल")
                .description("Team sport with net")
                .nepaliDescription("जालसहितको टोली खेल")
                .category("BALL_SPORTS")
                .equipment("Volleyball, net, court")
                .rules("FIVB volleyball rules")
                .nepaliRules("एफआईभीबी भलिबल नियम")
                .isPopular(false)
                .iconPath("/icons/volleyball.png")
                .build());
        
        return sports;
    }

    /**
     * Get Nepal time slot preferences.
     */
    public List<PopularTimeSlotDTO> getPopularTimeSlots(String area) {
        log.info("Getting popular time slots for area: {}", area);
        
        List<PopularTimeSlotDTO> timeSlots = new ArrayList<>();
        
        // Morning (6 AM - 9 AM) - Popular for office workers
        timeSlots.add(PopularTimeSlotDTO.builder()
                .timeSlot("MORNING")
                .startTime("06:00")
                .endTime("09:00")
                .totalBookings(25)
                .totalRevenue(new BigDecimal("7500"))
                .averagePrice(300.0)
                .totalPlayers(150)
                .popularityScore(0.3)
                .dayOfWeek("SUNDAY")
                .build());
        
        // Evening (5 PM - 9 PM) - Most popular time
        timeSlots.add(PopularTimeSlotDTO.builder()
                .timeSlot("EVENING")
                .startTime("17:00")
                .endTime("21:00")
                .totalBookings(80)
                .totalRevenue(new BigDecimal("24000"))
                .averagePrice(300.0)
                .totalPlayers(480)
                .popularityScore(0.8)
                .dayOfWeek("SATURDAY")
                .build());
        
        // Night (9 PM - 12 AM) - Young professionals
        timeSlots.add(PopularTimeSlotDTO.builder()
                .timeSlot("NIGHT")
                .startTime("21:00")
                .endTime("00:00")
                .totalBookings(45)
                .totalRevenue(new BigDecimal("13500"))
                .averagePrice(300.0)
                .totalPlayers(270)
                .popularityScore(0.5)
                .dayOfWeek("FRIDAY")
                .build());
        
        return timeSlots;
    }

    // ==================== Helper Methods ====================

    private FutsalGameDTO convertToFutsalGameDTO(Game game) {
        return FutsalGameDTO.builder()
                .gameId(game.getId())
                .title(game.getDescription() != null ? game.getDescription() : "Futsal Game")
                .venueName(game.getVenue() != null ? game.getVenue().getName() : "Unknown Venue")
                .venueAddress(game.getLocation())
                .latitude(game.getLatitude())
                .longitude(game.getLongitude())
                .pricePerPlayer(game.getPricePerPlayer())
                .maxPlayers(game.getMaxPlayers())
                .currentPlayers(game.getParticipants() != null ? game.getParticipants().size() : 0)
                .startTime(game.getTime())
                .endTime(game.getTime() != null && game.getDurationMinutes() != null ? 
                        game.getTime().plusMinutes(game.getDurationMinutes()) : null)
                .skillLevel(game.getSkillLevel())
                .gameType("5v5") // Default for futsal
                .isIndoor(true) // Default for futsal
                .area(extractAreaFromAddress(game.getLocation()))
                .distanceKm(calculateDistance(game))
                .hostName(game.getUser() != null ? game.getUser().getUsername() : "Unknown Host")
                .hostRating("4.5") // Mock data for now
                .hasParking(false) // Mock data
                .hasChangingRoom(false) // Mock data
                .paymentMethod("eSewa") // Default for Nepal
                .status(game.getStatus().name())
                .build();
    }

    private boolean isInTimeSlot(OffsetDateTime startTime, String timeSlot) {
        if (startTime == null) return true;
        
        LocalTime time = startTime.toLocalTime();
        
        switch (timeSlot.toUpperCase()) {
            case "MORNING":
                return time.isAfter(LocalTime.of(6, 0)) && time.isBefore(LocalTime.of(9, 0));
            case "EVENING":
                return time.isAfter(LocalTime.of(17, 0)) && time.isBefore(LocalTime.of(21, 0));
            case "NIGHT":
                return time.isAfter(LocalTime.of(21, 0)) || time.isBefore(LocalTime.of(6, 0));
            default:
                return true;
        }
    }

    private String extractAreaFromAddress(String address) {
        if (address == null) return "Unknown";
        
        String[] areas = {"Baneshwor", "Koteshwor", "Thapathali", "Kupondole", "Pulchowk", "Satdobato"};
        for (String area : areas) {
            if (address.toLowerCase().contains(area.toLowerCase())) {
                return area;
            }
        }
        return "Kathmandu";
    }

    private Double calculateDistance(Game game) {
        // Mock distance calculation - would use actual geolocation in production
        return Math.random() * 10.0; // 0-10 km
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class FutsalGameDTO {
        private Long gameId;
        private String title;
        private String venueName;
        private String venueAddress;
        private Double latitude;
        private Double longitude;
        private BigDecimal pricePerPlayer;
        private Integer maxPlayers;
        private Integer currentPlayers;
        private OffsetDateTime startTime;
        private OffsetDateTime endTime;
        private String skillLevel;
        private String gameType;
        private Boolean isIndoor;
        private String area;
        private Double distanceKm;
        private String hostName;
        private String hostRating;
        private Boolean hasParking;
        private Boolean hasChangingRoom;
        private String paymentMethod;
        private String status;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PopularAreaDTO {
        private String areaName;
        private String nepaliName;
        private Double latitude;
        private Double longitude;
        private Integer activeGames;
        private Integer totalVenues;
        private Double averagePrice;
        private String popularityLevel;
        private String bestTimeSlot;
        private Integer totalPlayers;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PopularTimeSlotDTO {
        private String timeSlot;
        private String startTime;
        private String endTime;
        private Integer totalBookings;
        private BigDecimal totalRevenue;
        private Double averagePrice;
        private Integer totalPlayers;
        private Double popularityScore;
        private String dayOfWeek;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class LocalizedSportDTO {
        private Long sportId;
        private String englishName;
        private String nepaliName;
        private String description;
        private String nepaliDescription;
        private String category;
        private String equipment;
        private String rules;
        private String nepaliRules;
        private Boolean isPopular;
        private String iconPath;
    }
}