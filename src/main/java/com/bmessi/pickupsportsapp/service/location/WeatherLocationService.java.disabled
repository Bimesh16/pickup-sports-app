package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.LocationUpdateEvent;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import com.bmessi.pickupsportsapp.service.location.LocationService.LocationPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Weather integration and location-based insights service.
 * 
 * Features:
 * - Real-time weather monitoring for game locations
 * - Weather-based game recommendations and alerts
 * - Seasonal activity analysis
 * - Weather impact on game attendance
 * - Location condition monitoring
 * - Smart weather-based notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherLocationService {

    private final GameRepository gameRepository;
    private final LocationService locationService;
    private final RealTimeEventService realTimeEventService;
    private final RedisTemplate<String, String> redisTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.weather.api.key:demo_key}")
    private String weatherApiKey;
    
    @Value("${app.weather.api.url:https://api.openweathermap.org/data/2.5}")
    private String weatherApiUrl;

    // Cache for weather data
    private final Map<String, WeatherData> weatherCache = new ConcurrentHashMap<>();
    private final Map<String, Instant> weatherCacheExpiry = new ConcurrentHashMap<>();
    
    // Redis keys
    private static final String WEATHER_CACHE_KEY = "weather:location:%s";
    private static final String WEATHER_ALERT_KEY = "weather:alert:%s";
    
    // Configuration
    private static final long WEATHER_CACHE_TTL_MINUTES = 30;
    private static final double WEATHER_ALERT_RADIUS_KM = 10.0;

    /**
     * Get current weather for a location with caching.
     */
    public WeatherData getCurrentWeather(double latitude, double longitude) {
        try {
            String locationKey = String.format("%.4f,%.4f", latitude, longitude);
            
            // Check cache first
            WeatherData cached = weatherCache.get(locationKey);
            Instant expiry = weatherCacheExpiry.get(locationKey);
            
            if (cached != null && expiry != null && Instant.now().isBefore(expiry)) {
                return cached;
            }

            // Fetch from weather API
            WeatherData weatherData = fetchWeatherFromAPI(latitude, longitude);
            
            if (weatherData != null) {
                // Cache the result
                weatherCache.put(locationKey, weatherData);
                weatherCacheExpiry.put(locationKey, Instant.now().plusSeconds(WEATHER_CACHE_TTL_MINUTES * 60));
                
                // Store in Redis for persistence
                storeWeatherInRedis(locationKey, weatherData);
            }

            return weatherData;

        } catch (Exception e) {
            log.error("Error getting weather for location ({}, {}): {}", latitude, longitude, e.getMessage());
            return createDefaultWeatherData(latitude, longitude);
        }
    }

    /**
     * Get weather forecast for upcoming games.
     */
    public List<GameWeatherForecast> getGameWeatherForecasts(List<Long> gameIds) {
        List<GameWeatherForecast> forecasts = new ArrayList<>();

        try {
            for (Long gameId : gameIds) {
                Optional<Game> gameOpt = gameRepository.findById(gameId);
                if (!gameOpt.isPresent()) continue;

                Game game = gameOpt.get();
                if (game.getLatitude() == null || game.getLongitude() == null || game.getTime() == null) {
                    continue;
                }

                WeatherData weather = getCurrentWeather(game.getLatitude(), game.getLongitude());
                WeatherImpact impact = assessWeatherImpact(weather, game);

                forecasts.add(GameWeatherForecast.builder()
                        .gameId(gameId)
                        .game(game)
                        .weather(weather)
                        .impact(impact)
                        .recommendation(generateWeatherRecommendation(weather, impact, game))
                        .build());
            }

        } catch (Exception e) {
            log.error("Error getting game weather forecasts: {}", e.getMessage());
        }

        return forecasts;
    }

    /**
     * Check weather conditions and send alerts for affected games.
     */
    @Scheduled(fixedRate = 1800000) // Every 30 minutes
    public void checkWeatherAlertsForGames() {
        try {
            log.debug("Starting weather alert check for games");

            // Find games in the next 24 hours with coordinates
            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime tomorrow = now.plusDays(1);

            List<Game> upcomingGames = gameRepository.findAll().stream()
                    .filter(g -> g.getTime() != null && 
                                g.getTime().isAfter(now) && 
                                g.getTime().isBefore(tomorrow))
                    .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                    .collect(Collectors.toList());

            for (Game game : upcomingGames) {
                checkWeatherForGame(game);
            }

            log.debug("Completed weather alert check for {} games", upcomingGames.size());

        } catch (Exception e) {
            log.error("Error during weather alert check: {}", e.getMessage());
        }
    }

    /**
     * Get weather-based location recommendations.
     */
    public WeatherLocationRecommendations getWeatherBasedRecommendations(double latitude, 
                                                                        double longitude, 
                                                                        String sport) {
        try {
            WeatherData currentWeather = getCurrentWeather(latitude, longitude);
            
            // Find nearby locations with better weather conditions
            List<AlternativeWeatherLocation> alternatives = findBetterWeatherLocations(
                latitude, longitude, currentWeather, sport);

            // Analyze weather suitability for the sport
            SportWeatherSuitability suitability = analyzeSportWeatherSuitability(currentWeather, sport);

            // Generate recommendations
            List<WeatherRecommendation> recommendations = generateWeatherRecommendations(
                currentWeather, suitability, sport);

            return WeatherLocationRecommendations.builder()
                    .location(new LocationPoint(latitude, longitude))
                    .currentWeather(currentWeather)
                    .sport(sport)
                    .suitability(suitability)
                    .recommendations(recommendations)
                    .alternatives(alternatives)
                    .lastUpdated(Instant.now())
                    .build();

        } catch (Exception e) {
            log.error("Error getting weather-based recommendations: {}", e.getMessage());
            return WeatherLocationRecommendations.builder().build();
        }
    }

    /**
     * Get seasonal activity insights for a location.
     */
    public SeasonalInsights getSeasonalInsights(double latitude, double longitude, int months) {
        try {
            // Analyze historical game data by season
            LocalDateTime since = LocalDateTime.now().minusMonths(months);
            
            List<Game> historicalGames = gameRepository.findAll().stream()
                    .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                    .filter(g -> {
                        double distance = locationService.calculateDistance(
                            latitude, longitude, g.getLatitude(), g.getLongitude());
                        return distance <= 20.0; // Within 20km
                    })
                    .filter(g -> g.getCreatedAt().toLocalDateTime().isAfter(since))
                    .collect(Collectors.toList());

            // Group by season
            Map<String, List<Game>> seasonalGames = historicalGames.stream()
                    .collect(Collectors.groupingBy(g -> getSeason(g.getTime())));

            // Analyze patterns
            Map<String, SeasonalPattern> patterns = seasonalGames.entrySet().stream()
                    .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> analyzeSeasonalPattern(entry.getValue())
                    ));

            String currentSeason = getSeason(OffsetDateTime.now());
            
            return SeasonalInsights.builder()
                    .location(new LocationPoint(latitude, longitude))
                    .analysisPeriodMonths(months)
                    .currentSeason(currentSeason)
                    .seasonalPatterns(patterns)
                    .totalGamesAnalyzed(historicalGames.size())
                    .seasonalRecommendations(generateSeasonalRecommendations(patterns, currentSeason))
                    .build();

        } catch (Exception e) {
            log.error("Error getting seasonal insights: {}", e.getMessage());
            return SeasonalInsights.builder().build();
        }
    }

    // Private helper methods

    private WeatherData fetchWeatherFromAPI(double latitude, double longitude) {
        try {
            if ("demo_key".equals(weatherApiKey)) {
                // Return demo weather data if no real API key
                return createDemoWeatherData(latitude, longitude);
            }

            String url = String.format("%s/weather?lat=%f&lon=%f&appid=%s&units=metric",
                    weatherApiUrl, latitude, longitude, weatherApiKey);

            // This would be the actual API call
            // Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            // return parseWeatherResponse(response);

            // For now, return demo data
            return createDemoWeatherData(latitude, longitude);

        } catch (Exception e) {
            log.error("Error fetching weather from API: {}", e.getMessage());
            return createDemoWeatherData(latitude, longitude);
        }
    }

    private WeatherData createDemoWeatherData(double latitude, double longitude) {
        return WeatherData.builder()
                .latitude(latitude)
                .longitude(longitude)
                .temperature(22.0)
                .humidity(65.0)
                .windSpeed(8.0)
                .windDirection(180)
                .pressure(1013.25)
                .visibility(10.0)
                .uvIndex(5.0)
                .condition("Partly Cloudy")
                .conditionCode("partly_cloudy")
                .precipitationChance(20.0)
                .timestamp(Instant.now())
                .source("DEMO")
                .build();
    }

    private WeatherData createDefaultWeatherData(double latitude, double longitude) {
        return WeatherData.builder()
                .latitude(latitude)
                .longitude(longitude)
                .temperature(20.0)
                .condition("Unknown")
                .timestamp(Instant.now())
                .source("DEFAULT")
                .build();
    }

    private void storeWeatherInRedis(String locationKey, WeatherData weather) {
        try {
            String redisKey = String.format(WEATHER_CACHE_KEY, locationKey);
            
            Map<String, String> weatherMap = Map.of(
                "temperature", String.valueOf(weather.getTemperature()),
                "humidity", String.valueOf(weather.getHumidity()),
                "windSpeed", String.valueOf(weather.getWindSpeed()),
                "condition", weather.getCondition(),
                "precipitationChance", String.valueOf(weather.getPrecipitationChance()),
                "timestamp", weather.getTimestamp().toString()
            );
            
            redisTemplate.opsForHash().putAll(redisKey, weatherMap);
            redisTemplate.expire(redisKey, WEATHER_CACHE_TTL_MINUTES, TimeUnit.MINUTES);

        } catch (Exception e) {
            log.error("Error storing weather in Redis: {}", e.getMessage());
        }
    }

    private void checkWeatherForGame(Game game) {
        try {
            WeatherData weather = getCurrentWeather(game.getLatitude(), game.getLongitude());
            WeatherImpact impact = assessWeatherImpact(weather, game);

            if (impact.getSeverity() == WeatherImpact.Severity.HIGH) {
                sendWeatherAlert(game, weather, impact);
            }

        } catch (Exception e) {
            log.error("Error checking weather for game {}: {}", game.getId(), e.getMessage());
        }
    }

    private WeatherImpact assessWeatherImpact(WeatherData weather, Game game) {
        WeatherImpact.Severity severity = WeatherImpact.Severity.LOW;
        List<String> concerns = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // Temperature concerns
        if (weather.getTemperature() < 0) {
            severity = WeatherImpact.Severity.HIGH;
            concerns.add("Freezing temperature");
            recommendations.add("Consider indoor alternatives");
        } else if (weather.getTemperature() > 35) {
            severity = WeatherImpact.Severity.HIGH;
            concerns.add("Extreme heat");
            recommendations.add("Ensure adequate hydration and take frequent breaks");
        }

        // Precipitation concerns
        if (weather.getPrecipitationChance() > 70) {
            severity = WeatherImpact.Severity.HIGH;
            concerns.add("High chance of rain");
            recommendations.add("Have backup indoor plans");
        } else if (weather.getPrecipitationChance() > 40) {
            severity = WeatherImpact.Severity.MEDIUM;
            concerns.add("Possible rain");
            recommendations.add("Monitor weather updates");
        }

        // Wind concerns
        if (weather.getWindSpeed() > 25) {
            severity = WeatherImpact.Severity.HIGH;
            concerns.add("Strong winds");
            recommendations.add("Consider postponing outdoor activities");
        }

        // UV concerns
        if (weather.getUvIndex() > 8) {
            if (severity == WeatherImpact.Severity.LOW) {
                severity = WeatherImpact.Severity.MEDIUM;
            }
            concerns.add("High UV index");
            recommendations.add("Use sunscreen and seek shade when possible");
        }

        return WeatherImpact.builder()
                .severity(severity)
                .concerns(concerns)
                .recommendations(recommendations)
                .suitabilityScore(calculateWeatherSuitability(weather, game))
                .build();
    }

    private double calculateWeatherSuitability(WeatherData weather, Game game) {
        double score = 100.0;

        // Temperature suitability
        double temp = weather.getTemperature();
        if (temp < 5 || temp > 30) {
            score -= 30;
        } else if (temp < 10 || temp > 25) {
            score -= 15;
        }

        // Precipitation penalty
        score -= weather.getPrecipitationChance() * 0.5;

        // Wind penalty
        if (weather.getWindSpeed() > 15) {
            score -= (weather.getWindSpeed() - 15) * 2;
        }

        // Sport-specific adjustments
        if (game.getSport() != null) {
            score = adjustForSport(score, weather, game.getSport());
        }

        return Math.max(0.0, Math.min(100.0, score));
    }

    private double adjustForSport(double baseScore, WeatherData weather, String sport) {
        return switch (sport.toLowerCase()) {
            case "soccer", "football" -> {
                // Soccer is more weather-tolerant
                if (weather.getPrecipitationChance() < 50) {
                    yield baseScore + 10;
                }
                yield baseScore;
            }
            case "tennis" -> {
                // Tennis is weather-sensitive
                if (weather.getWindSpeed() > 10) {
                    yield baseScore - 20;
                }
                yield baseScore;
            }
            case "basketball" -> {
                // Outdoor basketball affected by wind and rain
                if (weather.getWindSpeed() > 20 || weather.getPrecipitationChance() > 30) {
                    yield baseScore - 25;
                }
                yield baseScore;
            }
            case "swimming" -> {
                // Swimming less affected by weather
                yield baseScore + 5;
            }
            default -> baseScore;
        };
    }

    private void sendWeatherAlert(Game game, WeatherData weather, WeatherImpact impact) {
        try {
            String title = "⚠️ Weather Alert for Your Game";
            String message = String.format("Weather concerns for %s game at %s: %s", 
                                          game.getSport(), game.getLocation(),
                                          String.join(", ", impact.getConcerns()));

            // Send to game participants
            for (com.bmessi.pickupsportsapp.entity.User participant : game.getParticipants()) {
                NotificationEvent notification = new NotificationEvent(
                    participant.getUsername(),
                    title,
                    message,
                    "WEATHER_ALERT",
                    "/games/" + game.getId() + "/weather"
                );
                
                realTimeEventService.publishEvent(notification);
            }

            // Send location update event
            LocationUpdateEvent locationUpdate = new LocationUpdateEvent(
                game.getLocation(),
                "WEATHER_ALERT",
                title,
                message,
                impact.getSeverity().toString()
            );
            
            realTimeEventService.publishEvent(locationUpdate);

            log.info("Sent weather alert for game {}: {} (severity: {})", 
                    game.getId(), String.join(", ", impact.getConcerns()), impact.getSeverity());

        } catch (Exception e) {
            log.error("Error sending weather alert for game {}: {}", game.getId(), e.getMessage());
        }
    }

    private List<AlternativeWeatherLocation> findBetterWeatherLocations(double originLat, 
                                                                       double originLon,
                                                                       WeatherData currentWeather, 
                                                                       String sport) {
        List<AlternativeWeatherLocation> alternatives = new ArrayList<>();

        try {
            // Check nearby locations (simplified approach)
            double[] offsets = {0.1, 0.2, 0.3}; // Roughly 10km, 20km, 30km
            
            for (double offset : offsets) {
                // Check 4 cardinal directions
                for (int direction = 0; direction < 4; direction++) {
                    double lat = originLat + (direction < 2 ? offset : -offset);
                    double lon = originLon + (direction % 2 == 0 ? offset : -offset);
                    
                    WeatherData altWeather = getCurrentWeather(lat, lon);
                    
                    if (isBetterWeather(currentWeather, altWeather, sport)) {
                        double distance = locationService.calculateDistance(originLat, originLon, lat, lon);
                        
                        alternatives.add(AlternativeWeatherLocation.builder()
                                .location(new LocationPoint(lat, lon))
                                .weather(altWeather)
                                .distance(distance)
                                .improvementReason(getWeatherImprovementReason(currentWeather, altWeather))
                                .suitabilityScore(calculateWeatherSuitability(altWeather, 
                                        createDummyGame(sport))) // Create dummy game for scoring
                                .build());
                    }
                }
            }

            // Sort by suitability and distance
            alternatives.sort((a1, a2) -> {
                double score1 = a1.getSuitabilityScore() - a1.getDistance() * 2;
                double score2 = a2.getSuitabilityScore() - a2.getDistance() * 2;
                return Double.compare(score2, score1);
            });

        } catch (Exception e) {
            log.error("Error finding better weather locations: {}", e.getMessage());
        }

        return alternatives.stream().limit(5).collect(Collectors.toList());
    }

    private SportWeatherSuitability analyzeSportWeatherSuitability(WeatherData weather, String sport) {
        Map<String, Double> factors = new HashMap<>();
        
        // Analyze each weather factor for the sport
        factors.put("temperature", analyzeTemperatureSuitability(weather.getTemperature(), sport));
        factors.put("precipitation", 100.0 - weather.getPrecipitationChance());
        factors.put("wind", analyzeWindSuitability(weather.getWindSpeed(), sport));
        factors.put("visibility", Math.min(100.0, weather.getVisibility() * 10));
        
        double overallScore = factors.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        String suitabilityLevel = overallScore > 80 ? "EXCELLENT" :
                                 overallScore > 60 ? "GOOD" :
                                 overallScore > 40 ? "FAIR" : "POOR";

        return SportWeatherSuitability.builder()
                .sport(sport)
                .overallScore(overallScore)
                .suitabilityLevel(suitabilityLevel)
                .factors(factors)
                .bestConditions(generateBestConditionsAdvice(sport))
                .currentConditionAnalysis(analyzeCurrentConditions(weather, sport))
                .build();
    }

    private List<WeatherRecommendation> generateWeatherRecommendations(WeatherData weather, 
                                                                     SportWeatherSuitability suitability,
                                                                     String sport) {
        List<WeatherRecommendation> recommendations = new ArrayList<>();

        if (suitability.getOverallScore() < 60) {
            recommendations.add(WeatherRecommendation.builder()
                    .type("WEATHER_WARNING")
                    .title("Weather conditions not ideal")
                    .description("Current conditions may affect your " + sport + " game")
                    .priority(WeatherRecommendation.Priority.HIGH)
                    .action("Consider rescheduling or finding indoor alternatives")
                    .build());
        }

        if (weather.getPrecipitationChance() > 50) {
            recommendations.add(WeatherRecommendation.builder()
                    .type("RAIN_PREPARATION")
                    .title("Rain expected")
                    .description("High chance of precipitation during game time")
                    .priority(WeatherRecommendation.Priority.MEDIUM)
                    .action("Bring rain gear or consider indoor venues")
                    .build());
        }

        if (weather.getUvIndex() > 8) {
            recommendations.add(WeatherRecommendation.builder()
                    .type("UV_PROTECTION")
                    .title("High UV levels")
                    .description("Strong sun exposure expected")
                    .priority(WeatherRecommendation.Priority.MEDIUM)
                    .action("Use sunscreen, wear hat, stay hydrated")
                    .build());
        }

        return recommendations;
    }

    private String generateWeatherRecommendation(WeatherData weather, WeatherImpact impact, Game game) {
        if (impact.getSeverity() == WeatherImpact.Severity.LOW) {
            return "Perfect weather for " + game.getSport() + "! Enjoy your game.";
        } else if (impact.getSeverity() == WeatherImpact.Severity.MEDIUM) {
            return "Weather is playable but " + String.join(", ", impact.getConcerns()) + 
                   ". " + String.join(" ", impact.getRecommendations());
        } else {
            return "Weather conditions are challenging. " + String.join(" ", impact.getRecommendations());
        }
    }

    private String getSeason(OffsetDateTime time) {
        int month = time.getMonthValue();
        return switch (month) {
            case 12, 1, 2 -> "WINTER";
            case 3, 4, 5 -> "SPRING";
            case 6, 7, 8 -> "SUMMER";
            case 9, 10, 11 -> "FALL";
            default -> "UNKNOWN";
        };
    }

    private SeasonalPattern analyzeSeasonalPattern(List<Game> games) {
        Map<String, Long> sportFrequency = games.stream()
                .collect(Collectors.groupingBy(Game::getSport, Collectors.counting()));

        double averageParticipants = games.stream()
                .mapToInt(g -> g.getParticipants().size())
                .average()
                .orElse(0.0);

        return SeasonalPattern.builder()
                .totalGames(games.size())
                .popularSports(sportFrequency)
                .averageParticipants(averageParticipants)
                .activityLevel(games.size() > 50 ? "HIGH" : games.size() > 20 ? "MEDIUM" : "LOW")
                .build();
    }

    private List<String> generateSeasonalRecommendations(Map<String, SeasonalPattern> patterns, 
                                                        String currentSeason) {
        List<String> recommendations = new ArrayList<>();
        
        SeasonalPattern currentPattern = patterns.get(currentSeason);
        if (currentPattern != null) {
            if ("HIGH".equals(currentPattern.getActivityLevel())) {
                recommendations.add("Peak season for sports activity - book venues early!");
            } else if ("LOW".equals(currentPattern.getActivityLevel())) {
                recommendations.add("Quieter season - great time for trying new sports");
            }
        }
        
        return recommendations;
    }

    private boolean isBetterWeather(WeatherData current, WeatherData alternative, String sport) {
        double currentScore = calculateWeatherSuitability(current, createDummyGame(sport));
        double altScore = calculateWeatherSuitability(alternative, createDummyGame(sport));
        
        return altScore > currentScore + 15; // At least 15 points better
    }

    private String getWeatherImprovementReason(WeatherData current, WeatherData alternative) {
        List<String> improvements = new ArrayList<>();
        
        if (alternative.getTemperature() > current.getTemperature() + 5) {
            improvements.add("warmer");
        } else if (alternative.getTemperature() < current.getTemperature() - 5) {
            improvements.add("cooler");
        }
        
        if (alternative.getPrecipitationChance() < current.getPrecipitationChance() - 20) {
            improvements.add("less rain");
        }
        
        if (alternative.getWindSpeed() < current.getWindSpeed() - 5) {
            improvements.add("less windy");
        }
        
        return improvements.isEmpty() ? "better conditions" : String.join(", ", improvements);
    }

    private Game createDummyGame(String sport) {
        Game dummy = new Game();
        dummy.setSport(sport);
        return dummy;
    }

    private double analyzeTemperatureSuitability(double temperature, String sport) {
        // Optimal temperature ranges by sport
        return switch (sport.toLowerCase()) {
            case "soccer", "football" -> {
                if (temperature >= 15 && temperature <= 25) yield 100.0;
                if (temperature >= 10 && temperature <= 30) yield 80.0;
                yield Math.max(0, 100 - Math.abs(temperature - 20) * 3);
            }
            case "tennis" -> {
                if (temperature >= 18 && temperature <= 28) yield 100.0;
                yield Math.max(0, 100 - Math.abs(temperature - 23) * 3);
            }
            case "basketball" -> {
                if (temperature >= 12 && temperature <= 30) yield 100.0;
                yield Math.max(0, 100 - Math.abs(temperature - 21) * 2);
            }
            default -> {
                if (temperature >= 10 && temperature <= 28) yield 100.0;
                yield Math.max(0, 100 - Math.abs(temperature - 19) * 3);
            }
        };
    }

    private double analyzeWindSuitability(double windSpeed, String sport) {
        return switch (sport.toLowerCase()) {
            case "tennis", "badminton" -> Math.max(0, 100 - windSpeed * 8); // Very wind-sensitive
            case "golf" -> Math.max(0, 100 - windSpeed * 6); // Wind-sensitive
            case "soccer", "football" -> Math.max(0, 100 - windSpeed * 3); // Moderately affected
            default -> Math.max(0, 100 - windSpeed * 4); // Default sensitivity
        };
    }

    private List<String> generateBestConditionsAdvice(String sport) {
        return switch (sport.toLowerCase()) {
            case "soccer", "football" -> List.of(
                "Temperature: 15-25°C",
                "Light wind (under 15 km/h)",
                "No precipitation",
                "Good visibility"
            );
            case "tennis" -> List.of(
                "Temperature: 18-28°C", 
                "Minimal wind (under 10 km/h)",
                "Clear skies",
                "Low humidity"
            );
            case "basketball" -> List.of(
                "Temperature: 12-30°C",
                "Light wind",
                "Dry conditions"
            );
            default -> List.of(
                "Mild temperature (10-28°C)",
                "Light wind",
                "Clear conditions"
            );
        };
    }

    private String analyzeCurrentConditions(WeatherData weather, String sport) {
        List<String> analysis = new ArrayList<>();
        
        double suitability = calculateWeatherSuitability(weather, createDummyGame(sport));
        
        if (suitability > 80) {
            analysis.add("Excellent conditions for " + sport);
        } else if (suitability > 60) {
            analysis.add("Good conditions with minor considerations");
        } else {
            analysis.add("Challenging conditions - extra preparation recommended");
        }
        
        return String.join(". ", analysis);
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class WeatherData {
        private double latitude;
        private double longitude;
        private double temperature; // Celsius
        private double humidity; // Percentage
        private double windSpeed; // km/h
        private int windDirection; // Degrees
        private double pressure; // hPa
        private double visibility; // km
        private double uvIndex;
        private String condition; // Clear, Cloudy, Rain, etc.
        private String conditionCode;
        private double precipitationChance; // Percentage
        private Instant timestamp;
        private String source;
    }

    @lombok.Data
    @lombok.Builder
    public static class WeatherImpact {
        private Severity severity;
        private List<String> concerns;
        private List<String> recommendations;
        private double suitabilityScore;
        
        public enum Severity {
            LOW, MEDIUM, HIGH
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class GameWeatherForecast {
        private Long gameId;
        private Game game;
        private WeatherData weather;
        private WeatherImpact impact;
        private String recommendation;
    }

    @lombok.Data
    @lombok.Builder
    public static class WeatherLocationRecommendations {
        private LocationPoint location;
        private WeatherData currentWeather;
        private String sport;
        private SportWeatherSuitability suitability;
        private List<WeatherRecommendation> recommendations;
        private List<AlternativeWeatherLocation> alternatives;
        private Instant lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    public static class AlternativeWeatherLocation {
        private LocationPoint location;
        private WeatherData weather;
        private double distance;
        private String improvementReason;
        private double suitabilityScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class SportWeatherSuitability {
        private String sport;
        private double overallScore;
        private String suitabilityLevel;
        private Map<String, Double> factors;
        private List<String> bestConditions;
        private String currentConditionAnalysis;
    }

    @lombok.Data
    @lombok.Builder
    public static class WeatherRecommendation {
        private String type;
        private String title;
        private String description;
        private Priority priority;
        private String action;
        
        public enum Priority {
            LOW, MEDIUM, HIGH, URGENT
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class SeasonalInsights {
        private LocationPoint location;
        private int analysisPeriodMonths;
        private String currentSeason;
        private Map<String, SeasonalPattern> seasonalPatterns;
        private int totalGamesAnalyzed;
        private List<String> seasonalRecommendations;
    }

    @lombok.Data
    @lombok.Builder
    public static class SeasonalPattern {
        private int totalGames;
        private Map<String, Long> popularSports;
        private double averageParticipants;
        private String activityLevel;
    }
}
