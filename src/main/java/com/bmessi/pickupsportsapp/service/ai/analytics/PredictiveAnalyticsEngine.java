package com.bmessi.pickupsportsapp.service.ai.analytics;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class PredictiveAnalyticsEngine {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GameRepository gameRepository;
    
    @Autowired
    private VenueRepository venueRepository;
    
    // In-memory analytics cache for performance
    private final Map<String, Object> analyticsCache = new ConcurrentHashMap<>();
    private final AtomicInteger cacheHits = new AtomicInteger(0);
    private final AtomicInteger cacheMisses = new AtomicInteger(0);
    
    // User behavior patterns cache
    private final Map<Long, UserBehaviorPattern> userBehaviorCache = new ConcurrentHashMap<>();
    
    // Demand forecasting cache
    private final Map<String, DemandForecast> demandForecastCache = new ConcurrentHashMap<>();
    
    /**
     * Predict user behavior patterns based on historical data
     */
    public UserBehaviorPrediction predictUserBehavior(Long userId, int predictionDays) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return UserBehaviorPrediction.defaultPrediction();
        }
        
        // Check cache first
        String cacheKey = "user_behavior_" + userId + "_" + predictionDays;
        if (analyticsCache.containsKey(cacheKey)) {
            cacheHits.incrementAndGet();
            return (UserBehaviorPrediction) analyticsCache.get(cacheKey);
        }
        
        cacheMisses.incrementAndGet();
        
        // Analyze historical behavior
        UserBehaviorPattern pattern = analyzeUserBehaviorPattern(user);
        userBehaviorCache.put(userId, pattern);
        
        // Generate predictions
        UserBehaviorPrediction prediction = generateBehaviorPrediction(pattern, predictionDays);
        
        // Cache the result
        analyticsCache.put(cacheKey, prediction);
        
        return prediction;
    }
    
    /**
     * Forecast demand for games, venues, and time slots
     */
    public DemandForecast forecastDemand(String forecastType, int daysAhead) {
        String cacheKey = "demand_forecast_" + forecastType + "_" + daysAhead;
        
        if (demandForecastCache.containsKey(cacheKey)) {
            cacheHits.incrementAndGet();
            return demandForecastCache.get(cacheKey);
        }
        
        cacheMisses.incrementAndGet();
        
        DemandForecast forecast = generateDemandForecast(forecastType, daysAhead);
        demandForecastCache.put(cacheKey, forecast);
        
        return forecast;
    }
    
    /**
     * Analyze trends and patterns in the system
     */
    public TrendAnalysis analyzeTrends(String trendType, int analysisDays) {
        String cacheKey = "trend_analysis_" + trendType + "_" + analysisDays;
        
        if (analyticsCache.containsKey(cacheKey)) {
            cacheHits.incrementAndGet();
            return (TrendAnalysis) analyticsCache.get(cacheKey);
        }
        
        cacheMisses.incrementAndGet();
        
        TrendAnalysis analysis = generateTrendAnalysis(trendType, analysisDays);
        analyticsCache.put(cacheKey, analysis);
        
        return analysis;
    }
    
    /**
     * Predict optimal game scheduling based on demand and user preferences
     */
    public GameSchedulingPrediction predictOptimalGameScheduling(int daysAhead) {
        String cacheKey = "game_scheduling_" + daysAhead;
        
        if (analyticsCache.containsKey(cacheKey)) {
            cacheHits.incrementAndGet();
            return (GameSchedulingPrediction) analyticsCache.get(cacheKey);
        }
        
        cacheMisses.incrementAndGet();
        
        GameSchedulingPrediction prediction = generateGameSchedulingPrediction(daysAhead);
        analyticsCache.put(cacheKey, prediction);
        
        return prediction;
    }
    
    /**
     * Get analytics performance metrics
     */
    public AnalyticsPerformanceMetrics getPerformanceMetrics() {
        return new AnalyticsPerformanceMetrics(
            cacheHits.get(),
            cacheMisses.get(),
            analyticsCache.size(),
            userBehaviorCache.size(),
            demandForecastCache.size()
        );
    }
    
    /**
     * Clear analytics cache
     */
    public void clearCache() {
        analyticsCache.clear();
        userBehaviorCache.clear();
        demandForecastCache.clear();
    }
    
    // Private helper methods
    
    private UserBehaviorPattern analyzeUserBehaviorPattern(User user) {
        // Analyze user's game participation patterns
        List<Game> userGames = gameRepository.findByUserIdWithParticipants(user.getId(), null).getContent();
        
        Map<String, Integer> timeSlotPreferences = new HashMap<>();
        Map<String, Integer> venuePreferences = new HashMap<>();
        Map<String, Integer> sportPreferences = new HashMap<>();
        Map<String, Integer> dayOfWeekPreferences = new HashMap<>();
        
        for (Game game : userGames) {
            // Time slot analysis
            String timeSlot = getTimeSlot(game.getTime());
            timeSlotPreferences.merge(timeSlot, 1, Integer::sum);
            
            // Venue analysis
            if (game.getVenue() != null) {
                venuePreferences.merge(game.getVenue().getName(), 1, Integer::sum);
            }
            
            // Sport analysis
            sportPreferences.merge(game.getSport(), 1, Integer::sum);
            
            // Day of week analysis
            String dayOfWeek = game.getTime().getDayOfWeek().name();
            dayOfWeekPreferences.merge(dayOfWeek, 1, Integer::sum);
        }
        
        return new UserBehaviorPattern(
            user.getId(),
            timeSlotPreferences,
            venuePreferences,
            sportPreferences,
            dayOfWeekPreferences,
            userGames.size(),
            OffsetDateTime.now()
        );
    }
    
    private UserBehaviorPrediction generateBehaviorPrediction(UserBehaviorPattern pattern, int predictionDays) {
        // Simple prediction based on historical patterns
        Map<String, Double> predictedTimeSlots = new HashMap<>();
        Map<String, Double> predictedVenues = new HashMap<>();
        Map<String, Double> predictedSports = new HashMap<>();
        Map<String, Double> predictedDays = new HashMap<>();
        
        // Calculate probabilities based on historical frequency
        int totalGames = pattern.getTotalGames();
        
        pattern.getTimeSlotPreferences().forEach((slot, count) -> 
            predictedTimeSlots.put(slot, (double) count / totalGames));
        
        pattern.getVenuePreferences().forEach((venue, count) -> 
            predictedVenues.put(venue, (double) count / totalGames));
        
        pattern.getSportPreferences().forEach((sport, count) -> 
            predictedSports.put(sport, (double) count / totalGames));
        
        pattern.getDayOfWeekPreferences().forEach((day, count) -> 
            predictedDays.put(day, (double) count / totalGames));
        
        return new UserBehaviorPrediction(
            pattern.getUserId(),
            predictedTimeSlots,
            predictedVenues,
            predictedSports,
            predictedDays,
            predictionDays,
            OffsetDateTime.now()
        );
    }
    
    private DemandForecast generateDemandForecast(String forecastType, int daysAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(daysAhead);
        
        Map<String, Integer> dailyDemand = new HashMap<>();
        Map<String, Double> trendSlope = new HashMap<>();
        
        // Generate sample forecast data
        for (int i = 0; i < daysAhead; i++) {
            LocalDateTime date = now.plusDays(i);
            String dateKey = date.toLocalDate().toString();
            
            // Simulate demand based on day of week and seasonality
            int baseDemand = 50;
            int dayOfWeekBonus = getDayOfWeekDemandBonus(date.getDayOfWeek().getValue());
            int seasonalBonus = getSeasonalDemandBonus(date.getMonthValue());
            
            int dailyTotal = baseDemand + dayOfWeekBonus + seasonalBonus;
            dailyDemand.put(dateKey, dailyTotal);
        }
        
        // Calculate trend slope
        if (daysAhead > 1) {
            double slope = calculateTrendSlope(dailyDemand);
            trendSlope.put("overall", slope);
        }
        
        return new DemandForecast(
            forecastType,
            dailyDemand,
            trendSlope,
            daysAhead,
            OffsetDateTime.now()
        );
    }
    
    private TrendAnalysis generateTrendAnalysis(String trendType, int analysisDays) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusDays(analysisDays);
        
        Map<String, List<Double>> trendData = new HashMap<>();
        Map<String, String> trendDirection = new HashMap<>();
        Map<String, Double> trendStrength = new HashMap<>();
        
        // Generate sample trend data
        List<Double> userGrowth = generateTrendSeries(analysisDays, 0.05, 0.02);
        List<Double> gameActivity = generateTrendSeries(analysisDays, 0.03, 0.01);
        List<Double> venueUtilization = generateTrendSeries(analysisDays, 0.02, 0.005);
        
        trendData.put("user_growth", userGrowth);
        trendData.put("game_activity", gameActivity);
        trendData.put("venue_utilization", venueUtilization);
        
        // Analyze trend direction and strength
        trendDirection.put("user_growth", analyzeTrendDirection(userGrowth));
        trendDirection.put("game_activity", analyzeTrendDirection(gameActivity));
        trendDirection.put("venue_utilization", analyzeTrendDirection(venueUtilization));
        
        trendStrength.put("user_growth", calculateTrendStrength(userGrowth));
        trendStrength.put("game_activity", calculateTrendStrength(gameActivity));
        trendStrength.put("venue_utilization", calculateTrendStrength(venueUtilization));
        
        return new TrendAnalysis(
            trendType,
            trendData,
            trendDirection,
            trendStrength,
            analysisDays,
            OffsetDateTime.now()
        );
    }
    
    private GameSchedulingPrediction generateGameSchedulingPrediction(int daysAhead) {
        LocalDateTime now = LocalDateTime.now();
        
        Map<String, List<String>> optimalTimeSlots = new HashMap<>();
        Map<String, List<String>> optimalVenues = new HashMap<>();
        Map<String, Integer> expectedDemand = new HashMap<>();
        
        // Generate predictions for each day
        for (int i = 0; i < daysAhead; i++) {
            LocalDateTime date = now.plusDays(i);
            String dateKey = date.toLocalDate().toString();
            
            // Predict optimal time slots
            List<String> timeSlots = predictOptimalTimeSlots(date);
            optimalTimeSlots.put(dateKey, timeSlots);
            
            // Predict optimal venues
            List<String> venues = predictOptimalVenues(date);
            optimalVenues.put(dateKey, venues);
            
            // Predict expected demand
            int demand = predictExpectedDemand(date);
            expectedDemand.put(dateKey, demand);
        }
        
        return new GameSchedulingPrediction(
            optimalTimeSlots,
            optimalVenues,
            expectedDemand,
            daysAhead,
            OffsetDateTime.now()
        );
    }
    
    // Utility methods
    
    private String getTimeSlot(OffsetDateTime dateTime) {
        int hour = dateTime.getHour();
        if (hour >= 6 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "afternoon";
        if (hour >= 17 && hour < 21) return "evening";
        return "night";
    }
    
    private int getDayOfWeekDemandBonus(int dayOfWeek) {
        // Weekend bonus
        if (dayOfWeek == 6 || dayOfWeek == 7) return 20;
        // Friday bonus
        if (dayOfWeek == 5) return 15;
        return 0;
    }
    
    private int getSeasonalDemandBonus(int month) {
        // Spring and Fall are peak seasons
        if (month >= 3 && month <= 5) return 15; // Spring
        if (month >= 9 && month <= 11) return 15; // Fall
        if (month >= 6 && month <= 8) return 10; // Summer
        return 5; // Winter
    }
    
    private double calculateTrendSlope(Map<String, Integer> dailyDemand) {
        if (dailyDemand.size() < 2) return 0.0;
        
        List<Integer> values = new ArrayList<>(dailyDemand.values());
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = values.size();
        
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += values.get(i);
            sumXY += i * values.get(i);
            sumX2 += i * i;
        }
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }
    
    private List<Double> generateTrendSeries(int days, double baseGrowth, double volatility) {
        List<Double> series = new ArrayList<>();
        double currentValue = 100.0;
        Random random = new Random();
        
        for (int i = 0; i < days; i++) {
            double growth = baseGrowth + (random.nextDouble() - 0.5) * volatility;
            currentValue *= (1 + growth);
            series.add(currentValue);
        }
        
        return series;
    }
    
    private String analyzeTrendDirection(List<Double> series) {
        if (series.size() < 2) return "stable";
        
        double first = series.get(0);
        double last = series.get(series.size() - 1);
        double change = (last - first) / first;
        
        if (change > 0.05) return "increasing";
        if (change < -0.05) return "decreasing";
        return "stable";
    }
    
    private double calculateTrendStrength(List<Double> series) {
        if (series.size() < 2) return 0.0;
        
        double sum = 0.0;
        for (int i = 1; i < series.size(); i++) {
            sum += Math.abs(series.get(i) - series.get(i - 1));
        }
        
        return sum / (series.size() - 1);
    }
    
    private List<String> predictOptimalTimeSlots(LocalDateTime date) {
        List<String> slots = new ArrayList<>();
        
        // Weekend slots
        if (date.getDayOfWeek().getValue() >= 6) {
            slots.add("morning");
            slots.add("afternoon");
            slots.add("evening");
        } else {
            slots.add("afternoon");
            slots.add("evening");
        }
        
        return slots;
    }
    
    private List<String> predictOptimalVenues(LocalDateTime date) {
        // This would integrate with actual venue availability
        return Arrays.asList("Central Park", "Sports Complex", "Community Center");
    }
    
    private int predictExpectedDemand(LocalDateTime date) {
        int baseDemand = 50;
        int dayBonus = getDayOfWeekDemandBonus(date.getDayOfWeek().getValue());
        int seasonalBonus = getSeasonalDemandBonus(date.getMonthValue());
        
        return baseDemand + dayBonus + seasonalBonus;
    }
    
    // Inner classes for data structures
    
    public static class UserBehaviorPattern {
        private final Long userId;
        private final Map<String, Integer> timeSlotPreferences;
        private final Map<String, Integer> venuePreferences;
        private final Map<String, Integer> sportPreferences;
        private final Map<String, Integer> dayOfWeekPreferences;
        private final int totalGames;
        private final OffsetDateTime analyzedAt;
        
        public UserBehaviorPattern(Long userId, Map<String, Integer> timeSlotPreferences,
                                 Map<String, Integer> venuePreferences, Map<String, Integer> sportPreferences,
                                 Map<String, Integer> dayOfWeekPreferences, int totalGames, OffsetDateTime analyzedAt) {
            this.userId = userId;
            this.timeSlotPreferences = timeSlotPreferences;
            this.venuePreferences = venuePreferences;
            this.sportPreferences = sportPreferences;
            this.dayOfWeekPreferences = dayOfWeekPreferences;
            this.totalGames = totalGames;
            this.analyzedAt = analyzedAt;
        }
        
        // Getters
        public Long getUserId() { return userId; }
        public Map<String, Integer> getTimeSlotPreferences() { return timeSlotPreferences; }
        public Map<String, Integer> getVenuePreferences() { return venuePreferences; }
        public Map<String, Integer> getSportPreferences() { return sportPreferences; }
        public Map<String, Integer> getDayOfWeekPreferences() { return dayOfWeekPreferences; }
        public int getTotalGames() { return totalGames; }
        public OffsetDateTime getAnalyzedAt() { return analyzedAt; }
    }
    
    public static class UserBehaviorPrediction {
        private final Long userId;
        private final Map<String, Double> predictedTimeSlots;
        private final Map<String, Double> predictedVenues;
        private final Map<String, Double> predictedSports;
        private final Map<String, Double> predictedDays;
        private final int predictionDays;
        private final OffsetDateTime predictedAt;
        
        public UserBehaviorPrediction(Long userId, Map<String, Double> predictedTimeSlots,
                                    Map<String, Double> predictedVenues, Map<String, Double> predictedSports,
                                    Map<String, Double> predictedDays, int predictionDays, OffsetDateTime predictedAt) {
            this.userId = userId;
            this.predictedTimeSlots = predictedTimeSlots;
            this.predictedVenues = predictedVenues;
            this.predictedSports = predictedSports;
            this.predictedDays = predictedDays;
            this.predictionDays = predictionDays;
            this.predictedAt = predictedAt;
        }
        
        // Getters
        public Long getUserId() { return userId; }
        public Map<String, Double> getPredictedTimeSlots() { return predictedTimeSlots; }
        public Map<String, Double> getPredictedVenues() { return predictedVenues; }
        public Map<String, Double> getPredictedSports() { return predictedSports; }
        public Map<String, Double> getPredictedDays() { return predictedDays; }
        public int getPredictionDays() { return predictionDays; }
        public OffsetDateTime getPredictedAt() { return predictedAt; }
        
        public static UserBehaviorPrediction defaultPrediction() {
            return new UserBehaviorPrediction(
                null, new HashMap<>(), new HashMap<>(), new HashMap<>(), new HashMap<>(), 0, OffsetDateTime.now()
            );
        }
    }
    
    public static class DemandForecast {
        private final String forecastType;
        private final Map<String, Integer> dailyDemand;
        private final Map<String, Double> trendSlope;
        private final int daysAhead;
        private final OffsetDateTime forecastedAt;
        
        public DemandForecast(String forecastType, Map<String, Integer> dailyDemand,
                             Map<String, Double> trendSlope, int daysAhead, OffsetDateTime forecastedAt) {
            this.forecastType = forecastType;
            this.dailyDemand = dailyDemand;
            this.trendSlope = trendSlope;
            this.daysAhead = daysAhead;
            this.forecastedAt = forecastedAt;
        }
        
        // Getters
        public String getForecastType() { return forecastType; }
        public Map<String, Integer> getDailyDemand() { return dailyDemand; }
        public Map<String, Double> getTrendSlope() { return trendSlope; }
        public int getDaysAhead() { return daysAhead; }
        public OffsetDateTime getForecastedAt() { return forecastedAt; }
    }
    
    public static class TrendAnalysis {
        private final String trendType;
        private final Map<String, List<Double>> trendData;
        private final Map<String, String> trendDirection;
        private final Map<String, Double> trendStrength;
        private final int analysisDays;
        private final OffsetDateTime analyzedAt;
        
        public TrendAnalysis(String trendType, Map<String, List<Double>> trendData,
                            Map<String, String> trendDirection, Map<String, Double> trendStrength,
                            int analysisDays, OffsetDateTime analyzedAt) {
            this.trendType = trendType;
            this.trendData = trendData;
            this.trendDirection = trendDirection;
            this.trendStrength = trendStrength;
            this.analysisDays = analysisDays;
            this.analyzedAt = analyzedAt;
        }
        
        // Getters
        public String getTrendType() { return trendType; }
        public Map<String, List<Double>> getTrendData() { return trendData; }
        public Map<String, String> getTrendDirection() { return trendDirection; }
        public Map<String, Double> getTrendStrength() { return trendStrength; }
        public int getAnalysisDays() { return analysisDays; }
        public OffsetDateTime getAnalyzedAt() { return analyzedAt; }
    }
    
    public static class GameSchedulingPrediction {
        private final Map<String, List<String>> optimalTimeSlots;
        private final Map<String, List<String>> optimalVenues;
        private final Map<String, Integer> expectedDemand;
        private final int daysAhead;
        private final OffsetDateTime predictedAt;
        
        public GameSchedulingPrediction(Map<String, List<String>> optimalTimeSlots,
                                       Map<String, List<String>> optimalVenues,
                                       Map<String, Integer> expectedDemand, int daysAhead, OffsetDateTime predictedAt) {
            this.optimalTimeSlots = optimalTimeSlots;
            this.optimalVenues = optimalVenues;
            this.expectedDemand = expectedDemand;
            this.daysAhead = daysAhead;
            this.predictedAt = predictedAt;
        }
        
        // Getters
        public Map<String, List<String>> getOptimalTimeSlots() { return optimalTimeSlots; }
        public Map<String, List<String>> getOptimalVenues() { return optimalVenues; }
        public Map<String, Integer> getExpectedDemand() { return expectedDemand; }
        public int getDaysAhead() { return daysAhead; }
        public OffsetDateTime getPredictedAt() { return predictedAt; }
    }
    
    public static class AnalyticsPerformanceMetrics {
        private final int cacheHits;
        private final int cacheMisses;
        private final int analyticsCacheSize;
        private final int userBehaviorCacheSize;
        private final int demandForecastCacheSize;
        
        public AnalyticsPerformanceMetrics(int cacheHits, int cacheMisses, int analyticsCacheSize,
                                         int userBehaviorCacheSize, int demandForecastCacheSize) {
            this.cacheHits = cacheHits;
            this.cacheMisses = cacheMisses;
            this.analyticsCacheSize = analyticsCacheSize;
            this.userBehaviorCacheSize = userBehaviorCacheSize;
            this.demandForecastCacheSize = demandForecastCacheSize;
        }
        
        // Getters
        public int getCacheHits() { return cacheHits; }
        public int getCacheMisses() { return cacheMisses; }
        public int getAnalyticsCacheSize() { return analyticsCacheSize; }
        public int getUserBehaviorCacheSize() { return userBehaviorCacheSize; }
        public int getDemandForecastCacheSize() { return demandForecastCacheSize; }
        
        public double getCacheHitRate() {
            int total = cacheHits + cacheMisses;
            return total > 0 ? (double) cacheHits / total : 0.0;
        }
    }
}
