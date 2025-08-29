package com.bmessi.pickupsportsapp.service.dashboard;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.GameParticipation;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameParticipationRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for analyzing user's game history and participation patterns.
 * 
 * Provides detailed insights into:
 * - Game participation patterns
 * - Performance evolution over time
 * - Sport-specific analytics
 * - Social interaction patterns
 * - Attendance and reliability metrics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameHistoryAnalyticsService {

    private final UserRepository userRepository;
    private final GameParticipationRepository participationRepository;
    private final GameRepository gameRepository;

    /**
     * Get comprehensive game history analytics for a user.
     */
    @Transactional(readOnly = true)
    public GameHistoryAnalytics getGameHistoryAnalytics(String username, int days) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<GameParticipation> participations = participationRepository
                .findByUserIdAndCreatedAtAfter(user.getId(), since);

        return GameHistoryAnalytics.builder()
                .userId(user.getId())
                .username(username)
                .analysisPeriodDays(days)
                .totalParticipations(participations.size())
                .participationPatterns(analyzeParticipationPatterns(participations))
                .sportAnalytics(analyzeSportPerformance(participations))
                .performanceEvolution(analyzePerformanceEvolution(participations))
                .socialAnalytics(analyzeSocialPatterns(participations))
                .reliabilityMetrics(calculateReliabilityMetrics(participations))
                .timePatterns(analyzeTimePatterns(participations))
                .locationPreferences(analyzeLocationPreferences(participations))
                .streaksAndTrends(calculateStreaksAndTrends(participations))
                .build();
    }

    /**
     * Get detailed participation timeline for a user.
     */
    @Transactional(readOnly = true)
    public ParticipationTimeline getParticipationTimeline(String username, int months) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        LocalDateTime since = LocalDateTime.now().minusMonths(months);
        List<GameParticipation> participations = participationRepository
                .findByUserIdAndCreatedAtAfter(user.getId(), since);

        // Group by month for timeline
        Map<String, List<GameParticipation>> monthlyGroups = participations.stream()
                .collect(Collectors.groupingBy(p -> 
                    p.getCreatedAt().getYear() + "-" + String.format("%02d", p.getCreatedAt().getMonthValue())));

        List<TimelineEntry> timeline = monthlyGroups.entrySet().stream()
                .map(entry -> createTimelineEntry(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(TimelineEntry::getPeriod))
                .collect(Collectors.toList());

        return ParticipationTimeline.builder()
                .userId(user.getId())
                .username(username)
                .timelinePeriodMonths(months)
                .timeline(timeline)
                .totalPeriods(timeline.size())
                .averageGamesPerMonth(timeline.stream()
                        .mapToInt(TimelineEntry::getGamesPlayed)
                        .average()
                        .orElse(0.0))
                .build();
    }

    /**
     * Get sport-specific performance breakdown.
     */
    @Transactional(readOnly = true)
    public List<SportPerformanceBreakdown> getSportPerformanceBreakdown(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        List<Object[]> sportStats = participationRepository.getParticipationStatsBySport(user.getId());
        
        return sportStats.stream()
                .map(this::convertToSportBreakdown)
                .sorted((a, b) -> Integer.compare(b.getTotalGames(), a.getTotalGames()))
                .collect(Collectors.toList());
    }

    /**
     * Get performance comparison with peers.
     */
    @Transactional(readOnly = true)
    public PerformanceComparison getPerformanceComparison(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        // Get user's performance metrics
        Optional<Double> userAvgPerformance = participationRepository
                .getAveragePerformanceRatingByUserId(user.getId());
        Optional<Double> userAvgSportsmanship = participationRepository
                .getAverageSportsmanshipRatingByUserId(user.getId());
        
        long userTotalGames = participationRepository.countByUserId(user.getId());
        long userWins = participationRepository.countWinsByUserId(user.getId());
        double userWinRate = userTotalGames > 0 ? (double) userWins / userTotalGames * 100 : 0.0;

        // Calculate percentiles (simplified - in production you'd use more sophisticated stats)
        List<Double> allPerformanceRatings = getAllPerformanceRatings();
        List<Double> allSportsmanshipRatings = getAllSportsmanshipRatings();
        List<Double> allWinRates = getAllWinRates();

        return PerformanceComparison.builder()
                .userId(user.getId())
                .username(username)
                .performanceRating(userAvgPerformance.orElse(0.0))
                .performancePercentile(calculatePercentile(userAvgPerformance.orElse(0.0), allPerformanceRatings))
                .sportsmanshipRating(userAvgSportsmanship.orElse(0.0))
                .sportsmanshipPercentile(calculatePercentile(userAvgSportsmanship.orElse(0.0), allSportsmanshipRatings))
                .winRate(userWinRate)
                .winRatePercentile(calculatePercentile(userWinRate, allWinRates))
                .totalGames((int) userTotalGames)
                .rank(calculateOverallRank(user.getId()))
                .build();
    }

    /**
     * Get game attendance and reliability analysis.
     */
    @Transactional(readOnly = true)
    public AttendanceAnalysis getAttendanceAnalysis(String username, int days) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<GameParticipation> participations = participationRepository
                .findByUserIdAndCreatedAtAfter(user.getId(), since);

        long totalGames = participations.size();
        long attendedGames = participations.stream()
                .filter(p -> p.getWasPresent())
                .count();
        
        double attendanceRate = totalGames > 0 ? (double) attendedGames / totalGames * 100 : 0.0;

        // Analyze attendance patterns
        Map<String, Long> attendanceByDayOfWeek = participations.stream()
                .filter(p -> p.getWasPresent())
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getTime().getDayOfWeek().toString(),
                    Collectors.counting()
                ));

        List<AttendanceStreak> streaks = calculateAttendanceStreaks(participations);

        return AttendanceAnalysis.builder()
                .userId(user.getId())
                .username(username)
                .analysisPeriodDays(days)
                .totalGamesJoined((int) totalGames)
                .gamesAttended((int) attendedGames)
                .attendanceRate(attendanceRate)
                .attendanceByDayOfWeek(attendanceByDayOfWeek)
                .currentStreak(getCurrentAttendanceStreak(participations))
                .longestStreak(getLongestAttendanceStreak(streaks))
                .attendanceStreaks(streaks)
                .reliabilityScore(calculateReliabilityScore(participations))
                .build();
    }

    // Private helper methods

    private ParticipationPatterns analyzeParticipationPatterns(List<GameParticipation> participations) {
        Map<GameParticipation.ParticipationType, Long> typeBreakdown = participations.stream()
                .collect(Collectors.groupingBy(
                    GameParticipation::getParticipationType,
                    Collectors.counting()
                ));

        Map<String, Long> dayOfWeekPattern = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getTime().getDayOfWeek().toString(),
                    Collectors.counting()
                ));

        Map<String, Long> timeOfDayPattern = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> getTimeOfDayCategory(p.getGame().getTime().getHour()),
                    Collectors.counting()
                ));

        return ParticipationPatterns.builder()
                .participationTypeBreakdown(typeBreakdown)
                .dayOfWeekPattern(dayOfWeekPattern)
                .timeOfDayPattern(timeOfDayPattern)
                .averageGamesPerWeek(calculateAverageGamesPerWeek(participations))
                .mostActiveDay(getMostActiveDay(dayOfWeekPattern))
                .preferredTimeSlot(getMostActiveTimeSlot(timeOfDayPattern))
                .build();
    }

    private Map<String, SportAnalytics> analyzeSportPerformance(List<GameParticipation> participations) {
        Map<String, List<GameParticipation>> sportGroups = participations.stream()
                .filter(p -> p.getGame().getSport() != null)
                .collect(Collectors.groupingBy(p -> p.getGame().getSport()));

        return sportGroups.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> analyzeSportSpecificPerformance(entry.getKey(), entry.getValue())
                ));
    }

    private SportAnalytics analyzeSportSpecificPerformance(String sport, List<GameParticipation> participations) {
        long totalGames = participations.size();
        long wins = participations.stream()
                .filter(p -> p.getGameResult() == GameParticipation.GameResult.WIN)
                .count();
        
        double winRate = totalGames > 0 ? (double) wins / totalGames * 100 : 0.0;
        
        double avgPerformance = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        double avgSportsmanship = participations.stream()
                .filter(p -> p.getSportsmanshipRating() != null)
                .mapToDouble(GameParticipation::getSportsmanshipRating)
                .average()
                .orElse(0.0);

        // Calculate improvement over time
        List<GameParticipation> chronological = participations.stream()
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        double improvement = calculateImprovement(chronological);

        return SportAnalytics.builder()
                .sport(sport)
                .totalGames((int) totalGames)
                .winRate(winRate)
                .averagePerformanceRating(avgPerformance)
                .averageSportsmanshipRating(avgSportsmanship)
                .improvement(improvement)
                .currentStreak(calculateCurrentStreak(participations))
                .bestPerformance(participations.stream()
                        .filter(p -> p.getPerformanceRating() != null)
                        .mapToDouble(GameParticipation::getPerformanceRating)
                        .max()
                        .orElse(0.0))
                .build();
    }

    private PerformanceEvolution analyzePerformanceEvolution(List<GameParticipation> participations) {
        List<GameParticipation> withRatings = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        if (withRatings.isEmpty()) {
            return PerformanceEvolution.builder()
                    .dataPoints(List.of())
                    .overallTrend("INSUFFICIENT_DATA")
                    .improvement(0.0)
                    .build();
        }

        List<PerformanceDataPoint> dataPoints = withRatings.stream()
                .map(p -> PerformanceDataPoint.builder()
                        .timestamp(p.getCreatedAt())
                        .performanceRating(p.getPerformanceRating())
                        .sportsmanshipRating(p.getSportsmanshipRating())
                        .sport(p.getGame().getSport())
                        .gameResult(p.getGameResult())
                        .build())
                .collect(Collectors.toList());

        double firstRating = withRatings.get(0).getPerformanceRating();
        double lastRating = withRatings.get(withRatings.size() - 1).getPerformanceRating();
        double improvement = lastRating - firstRating;

        String trend = improvement > 0.2 ? "IMPROVING" : 
                      improvement < -0.2 ? "DECLINING" : "STABLE";

        return PerformanceEvolution.builder()
                .dataPoints(dataPoints)
                .overallTrend(trend)
                .improvement(improvement)
                .averageRating(withRatings.stream()
                        .mapToDouble(GameParticipation::getPerformanceRating)
                        .average()
                        .orElse(0.0))
                .ratingVolatility(calculateRatingVolatility(withRatings))
                .build();
    }

    private SocialPatterns analyzeSocialPatterns(List<GameParticipation> participations) {
        // Analyze co-participation patterns
        Map<String, Integer> coParticipants = new HashMap<>();
        Set<String> uniqueLocations = new HashSet<>();
        int totalConnections = 0;
        double avgTeamChemistry = 0.0;

        for (GameParticipation participation : participations) {
            if (participation.getNewConnectionsMade() != null) {
                totalConnections += participation.getNewConnectionsMade();
            }
            
            if (participation.getGame().getLocation() != null) {
                uniqueLocations.add(participation.getGame().getLocation());
            }
        }

        avgTeamChemistry = participations.stream()
                .filter(p -> p.getTeamChemistryRating() != null)
                .mapToDouble(GameParticipation::getTeamChemistryRating)
                .average()
                .orElse(0.0);

        return SocialPatterns.builder()
                .totalNewConnections(totalConnections)
                .averageTeamChemistry(avgTeamChemistry)
                .uniqueLocationsVisited(uniqueLocations.size())
                .networkGrowthRate(calculateNetworkGrowthRate(participations))
                .socialEngagementScore(calculateSocialEngagementScore(participations))
                .build();
    }

    private ReliabilityMetrics calculateReliabilityMetrics(List<GameParticipation> participations) {
        long totalCommitments = participations.size();
        long attendedGames = participations.stream()
                .filter(p -> p.getWasPresent())
                .count();
        
        long earlyLeaves = participations.stream()
                .filter(p -> p.getLeftAt() != null)
                .count();

        double reliabilityScore = totalCommitments > 0 ? 
                                 (double) attendedGames / totalCommitments * 100 : 0.0;

        return ReliabilityMetrics.builder()
                .totalCommitments((int) totalCommitments)
                .gamesAttended((int) attendedGames)
                .earlyLeaves((int) earlyLeaves)
                .attendanceRate(reliabilityScore)
                .reliabilityScore(calculateOverallReliabilityScore(participations))
                .punctualityScore(calculatePunctualityScore(participations))
                .commitmentConsistency(calculateCommitmentConsistency(participations))
                .build();
    }

    private TimePatterns analyzeTimePatterns(List<GameParticipation> participations) {
        Map<String, Long> hourlyDistribution = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> String.valueOf(p.getGame().getTime().getHour()),
                    Collectors.counting()
                ));

        Map<String, Long> dayOfWeekDistribution = participations.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getTime().getDayOfWeek().toString(),
                    Collectors.counting()
                ));

        String peakHour = hourlyDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");

        String peakDay = dayOfWeekDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");

        return TimePatterns.builder()
                .hourlyDistribution(hourlyDistribution)
                .dayOfWeekDistribution(dayOfWeekDistribution)
                .peakPlayingHour(peakHour)
                .peakPlayingDay(peakDay)
                .weekendVsWeekdayRatio(calculateWeekendRatio(participations))
                .averageGameDuration(calculateAverageGameDuration(participations))
                .build();
    }

    private LocationPreferences analyzeLocationPreferences(List<GameParticipation> participations) {
        Map<String, Long> locationFrequency = participations.stream()
                .filter(p -> p.getGame().getLocation() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getGame().getLocation(),
                    Collectors.counting()
                ));

        String favoriteLocation = locationFrequency.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");

        return LocationPreferences.builder()
                .locationFrequency(locationFrequency)
                .favoriteLocation(favoriteLocation)
                .uniqueLocationsVisited(locationFrequency.size())
                .locationDiversity(calculateLocationDiversity(locationFrequency))
                .build();
    }

    private StreaksAndTrends calculateStreaksAndTrends(List<GameParticipation> participations) {
        List<GameParticipation> chronological = participations.stream()
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt))
                .collect(Collectors.toList());

        return StreaksAndTrends.builder()
                .currentWinStreak(calculateCurrentWinStreak(chronological))
                .longestWinStreak(calculateLongestWinStreak(chronological))
                .currentPlayStreak(calculateCurrentPlayStreak(chronological))
                .longestPlayStreak(calculateLongestPlayStreak(chronological))
                .activityTrend(calculateActivityTrend(chronological))
                .performanceTrend(calculatePerformanceTrendDirection(chronological))
                .build();
    }

    // Utility methods

    private TimelineEntry createTimelineEntry(String period, List<GameParticipation> participations) {
        long wins = participations.stream()
                .filter(p -> p.getGameResult() == GameParticipation.GameResult.WIN)
                .count();
        
        double avgRating = participations.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .mapToDouble(GameParticipation::getPerformanceRating)
                .average()
                .orElse(0.0);

        return TimelineEntry.builder()
                .period(period)
                .gamesPlayed(participations.size())
                .gamesWon((int) wins)
                .winRate(participations.size() > 0 ? (double) wins / participations.size() * 100 : 0.0)
                .averageRating(avgRating)
                .build();
    }

    private SportPerformanceBreakdown convertToSportBreakdown(Object[] row) {
        String sport = (String) row[0];
        int totalGames = ((Number) row[1]).intValue();
        int wins = ((Number) row[2]).intValue();
        Double avgPerformance = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
        Double avgSportsmanship = row[4] != null ? ((Number) row[4]).doubleValue() : 0.0;
        
        double winRate = totalGames > 0 ? (double) wins / totalGames * 100 : 0.0;

        return SportPerformanceBreakdown.builder()
                .sport(sport)
                .totalGames(totalGames)
                .wins(wins)
                .winRate(winRate)
                .averagePerformanceRating(avgPerformance)
                .averageSportsmanshipRating(avgSportsmanship)
                .build();
    }

    private String getTimeOfDayCategory(int hour) {
        if (hour >= 6 && hour < 12) return "MORNING";
        if (hour >= 12 && hour < 17) return "AFTERNOON";
        if (hour >= 17 && hour < 21) return "EVENING";
        return "NIGHT";
    }

    private double calculateAverageGamesPerWeek(List<GameParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        
        LocalDateTime earliest = participations.stream()
                .map(GameParticipation::getCreatedAt)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
        
        long weeks = ChronoUnit.WEEKS.between(earliest, LocalDateTime.now());
        return weeks > 0 ? (double) participations.size() / weeks : participations.size();
    }

    private String getMostActiveDay(Map<String, Long> dayPattern) {
        return dayPattern.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");
    }

    private String getMostActiveTimeSlot(Map<String, Long> timePattern) {
        return timePattern.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");
    }

    private double calculateImprovement(List<GameParticipation> chronological) {
        List<GameParticipation> withRatings = chronological.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .collect(Collectors.toList());
        
        if (withRatings.size() < 2) return 0.0;
        
        double firstRating = withRatings.get(0).getPerformanceRating();
        double lastRating = withRatings.get(withRatings.size() - 1).getPerformanceRating();
        
        return lastRating - firstRating;
    }

    private int calculateCurrentStreak(List<GameParticipation> participations) {
        List<GameParticipation> chronological = participations.stream()
                .sorted(Comparator.comparing(GameParticipation::getCreatedAt).reversed())
                .collect(Collectors.toList());

        int streak = 0;
        for (GameParticipation participation : chronological) {
            if (participation.getGameResult() == GameParticipation.GameResult.WIN) {
                streak++;
            } else if (participation.getGameResult() != null) {
                break;
            }
        }
        return streak;
    }

    // Additional utility methods for calculations
    private List<Double> getAllPerformanceRatings() {
        // This would get all performance ratings from the database for percentile calculation
        return List.of(); // Placeholder
    }

    private List<Double> getAllSportsmanshipRatings() {
        return List.of(); // Placeholder
    }

    private List<Double> getAllWinRates() {
        return List.of(); // Placeholder
    }

    private double calculatePercentile(double value, List<Double> allValues) {
        if (allValues.isEmpty()) return 0.0;
        
        long belowCount = allValues.stream()
                .filter(v -> v < value)
                .count();
        
        return (double) belowCount / allValues.size() * 100;
    }

    private int calculateOverallRank(Long userId) {
        // This would calculate user's overall rank across all metrics
        return 0; // Placeholder
    }

    private List<AttendanceStreak> calculateAttendanceStreaks(List<GameParticipation> participations) {
        return List.of(); // Placeholder - would calculate actual streaks
    }

    private int getCurrentAttendanceStreak(List<GameParticipation> participations) {
        return 0; // Placeholder
    }

    private int getLongestAttendanceStreak(List<AttendanceStreak> streaks) {
        return streaks.stream()
                .mapToInt(AttendanceStreak::getLength)
                .max()
                .orElse(0);
    }

    private double calculateReliabilityScore(List<GameParticipation> participations) {
        if (participations.isEmpty()) return 0.0;
        
        long attended = participations.stream()
                .filter(p -> p.getWasPresent())
                .count();
        
        return (double) attended / participations.size() * 100;
    }

    private double calculateNetworkGrowthRate(List<GameParticipation> participations) {
        return participations.stream()
                .mapToInt(p -> p.getNewConnectionsMade() != null ? p.getNewConnectionsMade() : 0)
                .average()
                .orElse(0.0);
    }

    private double calculateSocialEngagementScore(List<GameParticipation> participations) {
        // Complex calculation based on feedback given/received, team chemistry, etc.
        return 0.0; // Placeholder
    }

    private double calculateOverallReliabilityScore(List<GameParticipation> participations) {
        return calculateReliabilityScore(participations);
    }

    private double calculatePunctualityScore(List<GameParticipation> participations) {
        // Would analyze arrival times vs game start times
        return 85.0; // Placeholder
    }

    private double calculateCommitmentConsistency(List<GameParticipation> participations) {
        // Would analyze pattern of commitments vs actual attendance
        return 90.0; // Placeholder
    }

    private double calculateWeekendRatio(List<GameParticipation> participations) {
        long weekendGames = participations.stream()
                .filter(p -> {
                    var dayOfWeek = p.getGame().getTime().getDayOfWeek();
                    return dayOfWeek == java.time.DayOfWeek.SATURDAY || 
                           dayOfWeek == java.time.DayOfWeek.SUNDAY;
                })
                .count();
        
        return participations.size() > 0 ? (double) weekendGames / participations.size() : 0.0;
    }

    private double calculateAverageGameDuration(List<GameParticipation> participations) {
        return participations.stream()
                .mapToLong(GameParticipation::getParticipationDurationMinutes)
                .average()
                .orElse(0.0);
    }

    private double calculateLocationDiversity(Map<String, Long> locationFrequency) {
        if (locationFrequency.size() <= 1) return 0.0;
        
        // Shannon diversity index
        long total = locationFrequency.values().stream().mapToLong(Long::longValue).sum();
        return locationFrequency.values().stream()
                .mapToDouble(count -> {
                    double proportion = (double) count / total;
                    return -proportion * Math.log(proportion);
                })
                .sum();
    }

    private int calculateCurrentWinStreak(List<GameParticipation> chronological) {
        int streak = 0;
        for (int i = chronological.size() - 1; i >= 0; i--) {
            GameParticipation p = chronological.get(i);
            if (p.getGameResult() == GameParticipation.GameResult.WIN) {
                streak++;
            } else if (p.getGameResult() != null) {
                break;
            }
        }
        return streak;
    }

    private int calculateLongestWinStreak(List<GameParticipation> chronological) {
        int longest = 0;
        int current = 0;
        
        for (GameParticipation p : chronological) {
            if (p.getGameResult() == GameParticipation.GameResult.WIN) {
                current++;
                longest = Math.max(longest, current);
            } else if (p.getGameResult() != null) {
                current = 0;
            }
        }
        
        return longest;
    }

    private int calculateCurrentPlayStreak(List<GameParticipation> chronological) {
        // Days in a row with at least one game
        return 0; // Placeholder - would calculate actual play streaks
    }

    private int calculateLongestPlayStreak(List<GameParticipation> chronological) {
        return 0; // Placeholder
    }

    private String calculateActivityTrend(List<GameParticipation> chronological) {
        if (chronological.size() < 4) return "INSUFFICIENT_DATA";
        
        // Compare first half vs second half
        int midPoint = chronological.size() / 2;
        int firstHalfCount = midPoint;
        int secondHalfCount = chronological.size() - midPoint;
        
        if (secondHalfCount > firstHalfCount * 1.2) {
            return "INCREASING";
        } else if (secondHalfCount < firstHalfCount * 0.8) {
            return "DECREASING";
        } else {
            return "STABLE";
        }
    }

    private String calculatePerformanceTrendDirection(List<GameParticipation> chronological) {
        List<GameParticipation> withRatings = chronological.stream()
                .filter(p -> p.getPerformanceRating() != null)
                .collect(Collectors.toList());
        
        if (withRatings.size() < 3) return "INSUFFICIENT_DATA";
        
        double improvement = calculateImprovement(withRatings);
        
        if (improvement > 0.3) return "IMPROVING";
        if (improvement < -0.3) return "DECLINING";
        return "STABLE";
    }

    private double calculateRatingVolatility(List<GameParticipation> participations) {
        List<Double> ratings = participations.stream()
                .map(GameParticipation::getPerformanceRating)
                .collect(Collectors.toList());
        
        if (ratings.size() < 2) return 0.0;
        
        double mean = ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = ratings.stream()
                .mapToDouble(rating -> Math.pow(rating - mean, 2))
                .average()
                .orElse(0.0);
        
        return Math.sqrt(variance);
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class GameHistoryAnalytics {
        private Long userId;
        private String username;
        private int analysisPeriodDays;
        private int totalParticipations;
        private ParticipationPatterns participationPatterns;
        private Map<String, SportAnalytics> sportAnalytics;
        private PerformanceEvolution performanceEvolution;
        private SocialPatterns socialAnalytics;
        private ReliabilityMetrics reliabilityMetrics;
        private TimePatterns timePatterns;
        private LocationPreferences locationPreferences;
        private StreaksAndTrends streaksAndTrends;
    }

    @lombok.Data
    @lombok.Builder
    public static class ParticipationTimeline {
        private Long userId;
        private String username;
        private int timelinePeriodMonths;
        private List<TimelineEntry> timeline;
        private int totalPeriods;
        private double averageGamesPerMonth;
    }

    @lombok.Data
    @lombok.Builder
    public static class TimelineEntry {
        private String period;
        private int gamesPlayed;
        private int gamesWon;
        private double winRate;
        private double averageRating;
    }

    @lombok.Data
    @lombok.Builder
    public static class ParticipationPatterns {
        private Map<GameParticipation.ParticipationType, Long> participationTypeBreakdown;
        private Map<String, Long> dayOfWeekPattern;
        private Map<String, Long> timeOfDayPattern;
        private double averageGamesPerWeek;
        private String mostActiveDay;
        private String preferredTimeSlot;
    }

    @lombok.Data
    @lombok.Builder
    public static class SportAnalytics {
        private String sport;
        private int totalGames;
        private double winRate;
        private double averagePerformanceRating;
        private double averageSportsmanshipRating;
        private double improvement;
        private int currentStreak;
        private double bestPerformance;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceEvolution {
        private List<PerformanceDataPoint> dataPoints;
        private String overallTrend;
        private double improvement;
        private double averageRating;
        private double ratingVolatility;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceDataPoint {
        private LocalDateTime timestamp;
        private double performanceRating;
        private Double sportsmanshipRating;
        private String sport;
        private GameParticipation.GameResult gameResult;
    }

    @lombok.Data
    @lombok.Builder
    public static class SocialPatterns {
        private int totalNewConnections;
        private double averageTeamChemistry;
        private int uniqueLocationsVisited;
        private double networkGrowthRate;
        private double socialEngagementScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class ReliabilityMetrics {
        private int totalCommitments;
        private int gamesAttended;
        private int earlyLeaves;
        private double attendanceRate;
        private double reliabilityScore;
        private double punctualityScore;
        private double commitmentConsistency;
    }

    @lombok.Data
    @lombok.Builder
    public static class TimePatterns {
        private Map<String, Long> hourlyDistribution;
        private Map<String, Long> dayOfWeekDistribution;
        private String peakPlayingHour;
        private String peakPlayingDay;
        private double weekendVsWeekdayRatio;
        private double averageGameDuration;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationPreferences {
        private Map<String, Long> locationFrequency;
        private String favoriteLocation;
        private int uniqueLocationsVisited;
        private double locationDiversity;
    }

    @lombok.Data
    @lombok.Builder
    public static class StreaksAndTrends {
        private int currentWinStreak;
        private int longestWinStreak;
        private int currentPlayStreak;
        private int longestPlayStreak;
        private String activityTrend;
        private String performanceTrend;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceComparison {
        private Long userId;
        private String username;
        private double performanceRating;
        private double performancePercentile;
        private double sportsmanshipRating;
        private double sportsmanshipPercentile;
        private double winRate;
        private double winRatePercentile;
        private int totalGames;
        private int rank;
    }

    @lombok.Data
    @lombok.Builder
    public static class AttendanceAnalysis {
        private Long userId;
        private String username;
        private int analysisPeriodDays;
        private int totalGamesJoined;
        private int gamesAttended;
        private double attendanceRate;
        private Map<String, Long> attendanceByDayOfWeek;
        private int currentStreak;
        private int longestStreak;
        private List<AttendanceStreak> attendanceStreaks;
        private double reliabilityScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class AttendanceStreak {
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private int length;
        private boolean isActive;
    }

    @lombok.Data
    @lombok.Builder
    public static class SportPerformanceBreakdown {
        private String sport;
        private int totalGames;
        private int wins;
        private double winRate;
        private double averagePerformanceRating;
        private double averageSportsmanshipRating;
    }
}
