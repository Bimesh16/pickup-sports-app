package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.mobile.GeolocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Country-based location service for geographic game discovery and management.
 * 
 * <p>This service provides location-based game discovery across different countries
 * with support for regional preferences, time zones, and local sports cultures.</p>
 * 
 * <p><strong>Supported Countries:</strong></p>
 * <ul>
 *   <li><strong>United States:</strong> State-based regions, major metropolitan areas</li>
 *   <li><strong>Canada:</strong> Provincial regions, major cities</li>
 *   <li><strong>Mexico:</strong> State and major city regions</li>
 *   <li><strong>India:</strong> State and metro city regions</li>
 *   <li><strong>Nepal:</strong> Development regions and major cities</li>
 * </ul>
 * 
 * <p><strong>Features:</strong></p>
 * <ul>
 *   <li><strong>Auto-Detection:</strong> Detect country from GPS coordinates</li>
 *   <li><strong>Regional Search:</strong> Games within states/provinces/regions</li>
 *   <li><strong>Cultural Sports:</strong> Country-specific popular sports</li>
 *   <li><strong>Time Zone Support:</strong> Local time conversion and display</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CountryLocationService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final GeolocationService geolocationService;

    /**
     * Detect country from GPS coordinates.
     */
    @Cacheable(cacheNames = "country-detection", key = "#lat + ':' + #lon")
    public CountryInfo detectCountry(double lat, double lon) {
        // Country boundary detection logic
        CountryBoundary detectedCountry = detectCountryFromCoordinates(lat, lon);
        
        if (detectedCountry == null) {
            return CountryInfo.builder()
                .countryCode("UNKNOWN")
                .countryName("Unknown Location")
                .build();
        }

        return CountryInfo.builder()
            .countryCode(detectedCountry.getCountryCode())
            .countryName(detectedCountry.getCountryName())
            .region(detectRegion(lat, lon, detectedCountry))
            .timeZone(detectedCountry.getTimeZone())
            .popularSports(getPopularSportsForCountry(detectedCountry.getCountryCode()))
            .currency(detectedCountry.getCurrency())
            .build();
    }

    /**
     * Get games available in a specific country.
     */
    @Transactional(readOnly = true)
    public Page<GameSummaryDTO> getGamesByCountry(String countryCode, GameFilterRequest filters, Pageable pageable) {
        log.debug("Finding games in country: {} with filters: {}", countryCode, filters);

        CountryBoundary boundary = getCountryBoundary(countryCode);
        if (boundary == null) {
            throw new IllegalArgumentException("Unsupported country: " + countryCode);
        }

        // Use geographic bounding box for efficient querying
        Page<Game> games = gameRepository.findGamesInBoundingBox(
            boundary.getMinLat(),
            boundary.getMaxLat(),
            boundary.getMinLon(),
            boundary.getMaxLon(),
            filters.sport(),
            filters.skillLevel(),
            filters.fromTime(),
            filters.toTime(),
            pageable
        );

        return games.map(this::convertToGameSummaryDTO);
    }

    /**
     * Get games in a specific region/state within a country.
     */
    @Transactional(readOnly = true)
    public Page<GameSummaryDTO> getGamesByRegion(String countryCode, String regionCode, 
                                                GameFilterRequest filters, Pageable pageable) {
        log.debug("Finding games in region: {}/{}", countryCode, regionCode);

        RegionBoundary region = getRegionBoundary(countryCode, regionCode);
        if (region == null) {
            throw new IllegalArgumentException("Unsupported region: " + countryCode + "/" + regionCode);
        }

        Page<Game> games = gameRepository.findGamesInBoundingBox(
            region.getMinLat(),
            region.getMaxLat(), 
            region.getMinLon(),
            region.getMaxLon(),
            filters.sport(),
            filters.skillLevel(),
            filters.fromTime(),
            filters.toTime(),
            pageable
        );

        return games.map(this::convertToGameSummaryDTO);
    }

    /**
     * Get popular sports for a specific country.
     */
    @Cacheable(cacheNames = "popular-sports", key = "#countryCode")
    public List<CountrySpotlightSport> getPopularSportsForCountry(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> List.of(
                new CountrySpotlightSport("Basketball", "🏀", "America's favorite indoor sport"),
                new CountrySpotlightSport("Football", "🏈", "American football - tackle and flag"),
                new CountrySpotlightSport("Soccer", "⚽", "Growing popularity across all ages"),
                new CountrySpotlightSport("Baseball", "⚾", "America's pastime"),
                new CountrySpotlightSport("Tennis", "🎾", "Year-round individual and doubles")
            );
            
            case "CA" -> List.of(
                new CountrySpotlightSport("Hockey", "🏒", "Canada's national winter sport"),
                new CountrySpotlightSport("Soccer", "⚽", "Most played sport across Canada"),
                new CountrySpotlightSport("Basketball", "🏀", "Popular in urban areas"),
                new CountrySpotlightSport("Lacrosse", "🥍", "Canada's national summer sport"),
                new CountrySpotlightSport("Baseball", "⚾", "Summer favorite")
            );
            
            case "MX" -> List.of(
                new CountrySpotlightSport("Soccer", "⚽", "Mexico's most beloved sport"),
                new CountrySpotlightSport("Baseball", "⚾", "Very popular, especially in northern states"),
                new CountrySpotlightSport("Boxing", "🥊", "Rich boxing tradition"),
                new CountrySpotlightSport("Basketball", "🏀", "Growing urban popularity"),
                new CountrySpotlightSport("Volleyball", "🏐", "Beach and indoor variants")
            );
            
            case "IN" -> List.of(
                new CountrySpotlightSport("Cricket", "🏏", "India's national obsession"),
                new CountrySpotlightSport("Badminton", "🏸", "Very popular indoor sport"),
                new CountrySpotlightSport("Kabaddi", "🤼", "Traditional contact sport"),
                new CountrySpotlightSport("Soccer", "⚽", "Growing rapidly, especially in youth"),
                new CountrySpotlightSport("Hockey", "🏑", "National sport with rich history"),
                new CountrySpotlightSport("Tennis", "🎾", "Popular individual sport")
            );
            
            case "NP" -> List.of(
                new CountrySpotlightSport("Cricket", "🏏", "Most popular sport in Nepal"),
                new CountrySpotlightSport("Soccer", "⚽", "Wide participation across all regions"),
                new CountrySpotlightSport("Volleyball", "🏐", "Very popular in rural and urban areas"),
                new CountrySpotlightSport("Basketball", "🏀", "Growing popularity in cities"),
                new CountrySpotlightSport("Badminton", "🏸", "Popular indoor sport")
            );
            
            default -> List.of(
                new CountrySpotlightSport("Soccer", "⚽", "World's most popular sport"),
                new CountrySpotlightSport("Basketball", "🏀", "Global urban favorite"),
                new CountrySpotlightSport("Tennis", "🎾", "International individual sport")
            );
        };
    }

    /**
     * Update user's location and country preferences.
     */
    @Transactional
    public void updateUserLocationAndCountry(String username, double lat, double lon) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            log.warn("User not found for location update: {}", username);
            return;
        }

        // Detect country from coordinates
        CountryInfo countryInfo = detectCountry(lat, lon);
        
        // Update user location
        user.setLatitude(lat);
        user.setLongitude(lon);
        user.setCountryCode(countryInfo.getCountryCode());
        user.setRegionCode(countryInfo.getRegion());
        user.setTimezone(countryInfo.getTimeZone());
        user.setUpdatedAt(OffsetDateTime.now());
        
        userRepository.save(user);

        log.info("Updated location for user {}: {} in {}/{}", 
            username, countryInfo.getCountryName(), countryInfo.getCountryCode(), countryInfo.getRegion());
    }

    /**
     * Get trending games in user's country/region.
     */
    @Cacheable(cacheNames = "trending-games", key = "#countryCode + ':' + #regionCode + ':' + #sport")
    public List<GameSummaryDTO> getTrendingGames(String countryCode, String regionCode, String sport, int limit) {
        // Implementation would find games with high registration rates, recent activity, etc.
        
        GameFilterRequest filters = new GameFilterRequest(
            sport,
            null, // skillLevel
            OffsetDateTime.now(),
            OffsetDateTime.now().plusDays(7),
            null, // priceRange
            true  // onlyAvailable
        );

        List<Game> trendingGames;
        if (regionCode != null) {
            Page<Game> regionGames = gameRepository.findGamesInBoundingBox(
                getRegionBoundary(countryCode, regionCode).getMinLat(),
                getRegionBoundary(countryCode, regionCode).getMaxLat(),
                getRegionBoundary(countryCode, regionCode).getMinLon(),
                getRegionBoundary(countryCode, regionCode).getMaxLon(),
                filters.sport(),
                filters.skillLevel(),
                filters.fromTime(),
                filters.toTime(),
                Pageable.ofSize(limit * 2) // Get more to filter trending
            );
            trendingGames = regionGames.getContent();
        } else {
            CountryBoundary country = getCountryBoundary(countryCode);
            Page<Game> countryGames = gameRepository.findGamesInBoundingBox(
                country.getMinLat(),
                country.getMaxLat(),
                country.getMinLon(),
                country.getMaxLon(),
                filters.sport(),
                filters.skillLevel(),
                filters.fromTime(),
                filters.toTime(),
                Pageable.ofSize(limit * 2)
            );
            trendingGames = countryGames.getContent();
        }

        // Sort by "trendiness" - combination of recent registrations, proximity to full, etc.
        return trendingGames.stream()
            .sorted((a, b) -> Double.compare(calculateTrendingScore(b), calculateTrendingScore(a)))
            .limit(limit)
            .map(this::convertToGameSummaryDTO)
            .toList();
    }

    // ===== PRIVATE HELPER METHODS =====

    private CountryBoundary detectCountryFromCoordinates(double lat, double lon) {
        // Simplified country detection based on bounding boxes
        // In production, you'd use a proper geocoding service or detailed boundary data
        
        if (isWithinUS(lat, lon)) {
            return getCountryBoundary("US");
        } else if (isWithinCanada(lat, lon)) {
            return getCountryBoundary("CA");  
        } else if (isWithinMexico(lat, lon)) {
            return getCountryBoundary("MX");
        } else if (isWithinIndia(lat, lon)) {
            return getCountryBoundary("IN");
        } else if (isWithinNepal(lat, lon)) {
            return getCountryBoundary("NP");
        }
        
        return null;
    }

    private boolean isWithinUS(double lat, double lon) {
        return lat >= 24.396308 && lat <= 49.384358 && 
               lon >= -125.000000 && lon <= -66.93457;
    }

    private boolean isWithinCanada(double lat, double lon) {
        return lat >= 41.681 && lat <= 83.23324 && 
               lon >= -141.003 && lon <= -52.6480987209;
    }

    private boolean isWithinMexico(double lat, double lon) {
        return lat >= 14.5388 && lat <= 32.7186 && 
               lon >= -118.4662 && lon <= -86.7104;
    }

    private boolean isWithinIndia(double lat, double lon) {
        return lat >= 6.4627 && lat <= 35.513327 && 
               lon >= 68.1766451354 && lon <= 97.4025614766;
    }

    private boolean isWithinNepal(double lat, double lon) {
        return lat >= 26.3478 && lat <= 30.4227 && 
               lon >= 80.0884 && lon <= 88.2015;
    }

    private CountryBoundary getCountryBoundary(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> CountryBoundary.builder()
                .countryCode("US")
                .countryName("United States")
                .minLat(24.396308).maxLat(49.384358)
                .minLon(-125.000000).maxLon(-66.93457)
                .currency("USD")
                .timeZone("America/New_York") // Default to Eastern
                .build();
                
            case "CA" -> CountryBoundary.builder()
                .countryCode("CA")
                .countryName("Canada")
                .minLat(41.681).maxLat(83.23324)
                .minLon(-141.003).maxLon(-52.6480987209)
                .currency("CAD")
                .timeZone("America/Toronto") // Default to Eastern
                .build();
                
            case "MX" -> CountryBoundary.builder()
                .countryCode("MX")
                .countryName("Mexico")
                .minLat(14.5388).maxLat(32.7186)
                .minLon(-118.4662).maxLon(-86.7104)
                .currency("MXN")
                .timeZone("America/Mexico_City")
                .build();
                
            case "IN" -> CountryBoundary.builder()
                .countryCode("IN")
                .countryName("India")
                .minLat(6.4627).maxLat(35.513327)
                .minLon(68.1766451354).maxLon(97.4025614766)
                .currency("INR")
                .timeZone("Asia/Kolkata")
                .build();
                
            case "NP" -> CountryBoundary.builder()
                .countryCode("NP")
                .countryName("Nepal")
                .minLat(26.3478).maxLat(30.4227)
                .minLon(80.0884).maxLon(88.2015)
                .currency("NPR")
                .timeZone("Asia/Kathmandu")
                .build();
                
            default -> null;
        };
    }

    private RegionBoundary getRegionBoundary(String countryCode, String regionCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> getUSStateBoundary(regionCode);
            case "CA" -> getCanadianProvinceBoundary(regionCode);
            case "MX" -> getMexicanStateBoundary(regionCode);
            case "IN" -> getIndianStateBoundary(regionCode);
            case "NP" -> getNepalRegionBoundary(regionCode);
            default -> null;
        };
    }

    private RegionBoundary getUSStateBoundary(String stateCode) {
        // Sample state boundaries - in production use comprehensive geographic data
        return switch (stateCode.toUpperCase()) {
            case "CA" -> RegionBoundary.builder()
                .regionCode("CA").regionName("California")
                .minLat(32.5343).maxLat(42.0095)
                .minLon(-124.4821).maxLon(-114.1308)
                .majorCities(List.of("Los Angeles", "San Francisco", "San Diego", "Sacramento"))
                .build();
                
            case "NY" -> RegionBoundary.builder()
                .regionCode("NY").regionName("New York")
                .minLat(40.4774).maxLat(45.0153)
                .minLon(-79.7625).maxLon(-71.7517)
                .majorCities(List.of("New York City", "Buffalo", "Rochester", "Syracuse"))
                .build();
                
            case "TX" -> RegionBoundary.builder()
                .regionCode("TX").regionName("Texas")
                .minLat(25.8371).maxLat(36.5007)
                .minLon(-106.6456).maxLon(-93.5083)
                .majorCities(List.of("Houston", "Dallas", "Austin", "San Antonio"))
                .build();
                
            default -> null;
        };
    }

    private RegionBoundary getIndianStateBoundary(String stateCode) {
        return switch (stateCode.toUpperCase()) {
            case "MH" -> RegionBoundary.builder()
                .regionCode("MH").regionName("Maharashtra") 
                .minLat(15.6024).maxLat(22.0273)
                .minLon(72.6589).maxLon(80.8913)
                .majorCities(List.of("Mumbai", "Pune", "Nagpur", "Nashik"))
                .build();
                
            case "KA" -> RegionBoundary.builder()
                .regionCode("KA").regionName("Karnataka")
                .minLat(11.5945).maxLat(18.4574) 
                .minLon(74.0434).maxLon(78.5685)
                .majorCities(List.of("Bangalore", "Mysore", "Mangalore", "Hubli"))
                .build();
                
            case "DL" -> RegionBoundary.builder()
                .regionCode("DL").regionName("Delhi")
                .minLat(28.4089).maxLat(28.8833)
                .minLon(76.8388).maxLon(77.3465)
                .majorCities(List.of("New Delhi", "Old Delhi", "Gurgaon", "Noida"))
                .build();
                
            default -> null;
        };
    }

    private RegionBoundary getNepalRegionBoundary(String regionCode) {
        return switch (regionCode.toUpperCase()) {
            case "CENTRAL" -> RegionBoundary.builder()
                .regionCode("CENTRAL").regionName("Central Development Region")
                .minLat(27.3000).maxLat(28.3000)
                .minLon(84.0000).maxLon(86.5000)
                .majorCities(List.of("Kathmandu", "Lalitpur", "Bhaktapur", "Hetauda"))
                .build();
                
            case "WESTERN" -> RegionBoundary.builder()
                .regionCode("WESTERN").regionName("Western Development Region")
                .minLat(28.0000).maxLat(30.0000)
                .minLon(80.0000).maxLon(84.0000)
                .majorCities(List.of("Pokhara", "Butwal", "Nepalgunj", "Dhangadhi"))
                .build();
                
            default -> null;
        };
    }

    private String detectRegion(double lat, double lon, CountryBoundary country) {
        // Detect specific region/state based on coordinates
        return switch (country.getCountryCode()) {
            case "US" -> detectUSState(lat, lon);
            case "CA" -> detectCanadianProvince(lat, lon);
            case "IN" -> detectIndianState(lat, lon);
            case "NP" -> detectNepalRegion(lat, lon);
            case "MX" -> detectMexicanState(lat, lon);
            default -> "UNKNOWN";
        };
    }

    private String detectUSState(double lat, double lon) {
        // Simplified state detection - use more precise boundary data in production
        if (lat >= 32.5 && lat <= 42.0 && lon >= -124.5 && lon <= -114.1) return "CA";
        if (lat >= 40.4 && lat <= 45.0 && lon >= -79.8 && lon <= -71.7) return "NY";
        if (lat >= 25.8 && lat <= 36.5 && lon >= -106.6 && lon <= -93.5) return "TX";
        return "UNKNOWN";
    }

    private String detectIndianState(double lat, double lon) {
        if (lat >= 15.6 && lat <= 22.0 && lon >= 72.6 && lon <= 80.9) return "MH"; // Maharashtra
        if (lat >= 11.5 && lat <= 18.4 && lon >= 74.0 && lon <= 78.6) return "KA"; // Karnataka  
        if (lat >= 28.4 && lat <= 28.9 && lon >= 76.8 && lon <= 77.3) return "DL"; // Delhi
        return "UNKNOWN";
    }

    private String detectNepalRegion(double lat, double lon) {
        if (lat >= 27.3 && lat <= 28.3 && lon >= 84.0 && lon <= 86.5) return "CENTRAL";
        if (lat >= 28.0 && lat <= 30.0 && lon >= 80.0 && lon <= 84.0) return "WESTERN";
        return "CENTRAL"; // Default to central region
    }

    private String detectCanadianProvince(double lat, double lon) {
        // Add Canadian province detection logic
        return "ON"; // Default to Ontario
    }

    private String detectMexicanState(double lat, double lon) {
        // Add Mexican state detection logic  
        return "CDMX"; // Default to Mexico City
    }

    private double calculateTrendingScore(Game game) {
        double score = 0.0;
        
        // Recent registration activity (higher score for recent RSVPs)
        long hoursUntilGame = java.time.Duration.between(OffsetDateTime.now(), game.getTime()).toHours();
        if (hoursUntilGame > 0 && hoursUntilGame <= 168) { // Within next week
            score += Math.max(0, 100 - hoursUntilGame); // Closer games score higher
        }
        
        // Participation rate (how full the game is)
        if (game.getCapacity() > 0) {
            int currentParticipants = game.getParticipants().size();
            double participationRate = (double) currentParticipants / game.getCapacity();
            score += participationRate * 50; // Up to 50 points for participation
        }
        
        // Recently created games get bonus
        long hoursSinceCreation = java.time.Duration.between(game.getCreatedAt(), OffsetDateTime.now()).toHours();
        if (hoursSinceCreation <= 24) {
            score += 25; // Bonus for new games
        }
        
        // Price appeal (moderate pricing gets higher score)
        if (game.getPricePerPlayer() != null) {
            double price = game.getPricePerPlayer().doubleValue();
            if (price >= 5 && price <= 25) {
                score += 20; // Sweet spot pricing
            }
        }
        
        return score;
    }

    private GameSummaryDTO convertToGameSummaryDTO(Game game) {
        return new GameSummaryDTO(
            game.getId(),
            game.getSport(),
            game.getLocation(),
            game.getTime(),
            game.getSkillLevel(),
            game.getLatitude(),
            game.getLongitude(),
            null // distance will be calculated separately if needed
        );
    }

    // ===== SUPPORTING CLASSES =====

    @Data
    @Builder
    public static class CountryInfo {
        private String countryCode;
        private String countryName;
        private String region;
        private String timeZone;
        private List<CountrySpotlightSport> popularSports;
        private String currency;
        private String language;
        private String flagEmoji;
    }

    @Data
    @Builder
    private static class CountryBoundary {
        private String countryCode;
        private String countryName;
        private double minLat;
        private double maxLat;
        private double minLon;
        private double maxLon;
        private String currency;
        private String timeZone;
    }

    @Data
    @Builder
    private static class RegionBoundary {
        private String regionCode;
        private String regionName;
        private double minLat;
        private double maxLat;
        private double minLon;
        private double maxLon;
        private List<String> majorCities;
    }

    public record CountrySpotlightSport(
        String name,
        String emoji,
        String description
    ) {}

    public record GameFilterRequest(
        String sport,
        String skillLevel,
        OffsetDateTime fromTime,
        OffsetDateTime toTime,
        String priceRange,
        Boolean onlyAvailable
    ) {}
}