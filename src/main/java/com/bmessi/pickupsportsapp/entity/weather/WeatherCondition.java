package com.bmessi.pickupsportsapp.entity.weather;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Weather condition entity for tracking weather data and its impact on games.
 */
// Temporarily disabled due to precision/scale issues
// @Entity
// @Table(name = "weather_conditions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "location", nullable = false, length = 100)
    private String location; // City or venue location

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "forecast_date", nullable = false)
    private OffsetDateTime forecastDate;

    @Column(name = "forecast_time", nullable = false)
    private OffsetDateTime forecastTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "weather_type", nullable = false)
    private WeatherType weatherType;

    @Column(name = "temperature_celsius", precision = 5, scale = 2)
    private BigDecimal temperatureCelsius;

    @Column(name = "temperature_fahrenheit", precision = 5, scale = 2)
    private BigDecimal temperatureFahrenheit;

    @Column(name = "feels_like_celsius", precision = 5, scale = 2)
    private BigDecimal feelsLikeCelsius;

    @Column(name = "feels_like_fahrenheit", precision = 5, scale = 2)
    private BigDecimal feelsLikeFahrenheit;

    @Column(name = "humidity_percentage", precision = 5, scale = 2)
    private BigDecimal humidityPercentage;

    @Column(name = "wind_speed_kmh", precision = 6, scale = 2)
    private BigDecimal windSpeedKmh;

    @Column(name = "wind_speed_mph", precision = 6, scale = 2)
    private BigDecimal windSpeedMph;

    @Column(name = "wind_direction_degrees")
    private Integer windDirectionDegrees;

    @Column(name = "wind_direction_cardinal", length = 10)
    private String windDirectionCardinal; // N, NE, E, SE, S, SW, W, NW

    @Column(name = "precipitation_probability", precision = 5, scale = 2)
    private BigDecimal precipitationProbability;

    @Column(name = "precipitation_amount_mm", precision = 6, scale = 2)
    private BigDecimal precipitationAmountMm;

    @Column(name = "precipitation_amount_inches", precision = 6, scale = 2)
    private BigDecimal precipitationAmountInches;

    @Column(name = "visibility_km", precision = 6, scale = 2)
    private BigDecimal visibilityKm;

    @Column(name = "visibility_miles", precision = 6, scale = 2)
    private BigDecimal visibilityMiles;

    @Column(name = "uv_index", precision = 4, scale = 2)
    private BigDecimal uvIndex;

    @Column(name = "air_quality_index")
    private Integer airQualityIndex;

    @Column(name = "pressure_hpa", precision = 7, scale = 2)
    private BigDecimal pressureHpa;

    @Column(name = "pressure_inhg", precision = 5, scale = 2)
    private BigDecimal pressureInhg;

    @Column(name = "dew_point_celsius", precision = 5, scale = 2)
    private BigDecimal dewPointCelsius;

    @Column(name = "dew_point_fahrenheit", precision = 5, scale = 2)
    private BigDecimal dewPointFahrenheit;

    @Column(name = "cloud_cover_percentage")
    private Integer cloudCoverPercentage;

    @Column(name = "sunrise_time")
    private OffsetDateTime sunriseTime;

    @Column(name = "sunset_time")
    private OffsetDateTime sunsetTime;

    @Column(name = "moon_phase", length = 50)
    private String moonPhase;

    @Column(name = "weather_description", length = 200)
    private String weatherDescription;

    @Column(name = "weather_icon", length = 100)
    private String weatherIcon;

    @Column(name = "data_source", length = 100)
    private String dataSource; // e.g., "OpenWeatherMap", "AccuWeather", "NOAA"

    @Column(name = "confidence_level", precision = 3, scale = 2)
    private BigDecimal confidenceLevel; // 0.00 to 1.00

    @Column(name = "last_updated")
    private OffsetDateTime lastUpdated;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum WeatherType {
        CLEAR, CLOUDY, PARTLY_CLOUDY, RAIN, SNOW, SLEET, HAIL, FOG, MIST, 
        THUNDERSTORM, DRIZZLE, SHOWER, BLIZZARD, DUST, SMOKE, HAZE, 
        TORNADO, HURRICANE, TROPICAL_STORM, WINDY, CALM, LIGHT_BREEZE, 
        MODERATE_BREEZE, FRESH_BREEZE, STRONG_BREEZE, HIGH_WIND, GALE, 
        STORM, VIOLENT_STORM, HURRICANE_FORCE
    }
}
