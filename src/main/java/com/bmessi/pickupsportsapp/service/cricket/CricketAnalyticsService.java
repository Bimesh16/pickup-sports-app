package com.bmessi.pickupsportsapp.service.cricket;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.cricket.*;
import com.bmessi.pickupsportsapp.repository.cricket.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for cricket-specific analytics and performance tracking.
 * 
 * <p>This service provides comprehensive cricket analytics including player statistics,
 * match analysis, performance trends, and career tracking across different formats.</p>
 * 
 * <p><strong>Analytics Features:</strong></p>
 * <ul>
 *   <li><strong>Player Analytics:</strong> Career stats, recent form, performance trends</li>
 *   <li><strong>Match Analytics:</strong> Match insights, key moments, performance analysis</li>
 *   <li><strong>Team Analytics:</strong> Team balance, partnership analysis, fielding stats</li>
 *   <li><strong>Format Analytics:</strong> Performance comparison across T20, ODI, etc.</li>
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
public class CricketAnalyticsService {

    private final CricketMatchRepository cricketMatchRepository;
    private final CricketPlayerPerformanceRepository playerPerformanceRepository;
    private final CricketInningsRepository cricketInningsRepository;
    private final CricketBallRepository cricketBallRepository;

    /**
     * Get comprehensive player cricket statistics.
     */
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "cricket-player-stats", key = "#userId + ':' + #format")
    public CricketPlayerStats getPlayerStatistics(Long userId, CricketMatch.CricketFormat format) {
        log.debug("Calculating cricket stats for user {} in format {}", userId, format);

        List<CricketPlayerPerformance> performances = format != null 
            ? playerPerformanceRepository.findByPlayerIdAndFormat(userId, format)
            : playerPerformanceRepository.findByPlayerId(userId);

        if (performances.isEmpty()) {
            return createEmptyPlayerStats(userId, format);
        }

        return CricketPlayerStats.builder()
            .playerId(userId)
            .format(format)
            .battingStats(calculateBattingStats(performances))
            .bowlingStats(calculateBowlingStats(performances))
            .fieldingStats(calculateFieldingStats(performances))
            .careerSummary(calculateCareerSummary(performances))
            .recentForm(calculateRecentForm(performances))
            .milestones(calculateMilestones(performances))
            .performanceRating(calculateOverallRating(performances))
            .build();
    }

    /**
     * Get detailed match analytics and insights.
     */
    @Transactional(readOnly = true)
    public CricketMatchAnalytics getMatchAnalytics(Long matchId) {
        CricketMatch match = cricketMatchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Cricket match not found"));

        List<CricketInnings> innings = cricketInningsRepository.findByMatchIdOrderByInningsNumber(matchId);
        List<CricketPlayerPerformance> performances = playerPerformanceRepository.findByMatchId(matchId);

        return CricketMatchAnalytics.builder()
            .matchId(matchId)
            .format(match.getMatchFormat())
            .matchSummary(createMatchSummary(match, innings))
            .inningsAnalytics(analyzeInnings(innings))
            .playerPerformances(performances)
            .keyMoments(findKeyMoments(matchId))
            .partnerships(analyzePartnerships(matchId))
            .bowlingAnalysis(analyzeBowlingPerformance(matchId))
            .fieldingAnalysis(analyzeFieldingPerformance(matchId))
            .matchInsights(generateMatchInsights(match, performances))
            .build();
    }

    /**
     * Get cricket performance comparison between players.
     */
    @Transactional(readOnly = true)
    public PlayerComparisonResult comparePlayerPerformances(List<Long> playerIds, 
                                                          CricketMatch.CricketFormat format,
                                                          int recentMatches) {
        Map<Long, CricketPlayerStats> playerStats = playerIds.stream()
            .collect(Collectors.toMap(
                playerId -> playerId,
                playerId -> getPlayerStatistics(playerId, format)
            ));

        return PlayerComparisonResult.builder()
            .comparedPlayers(playerStats)
            .comparisonMetrics(calculateComparisonMetrics(playerStats))
            .recommendations(generatePlayerRecommendations(playerStats))
            .build();
    }

    /**
     * Get cricket format popularity and trends.
     */
    @Cacheable(cacheNames = "cricket-format-trends", key = "#countryCode")
    public CricketFormatTrends getFormatTrends(String countryCode, int days) {
        List<CricketMatch> recentMatches = cricketMatchRepository.findRecentMatchesByCountry(countryCode, days);
        
        Map<CricketMatch.CricketFormat, Long> formatCounts = recentMatches.stream()
            .collect(Collectors.groupingBy(CricketMatch::getMatchFormat, Collectors.counting()));

        Map<CricketMatch.CricketFormat, Double> averageRatings = recentMatches.stream()
            .collect(Collectors.groupingBy(
                CricketMatch::getMatchFormat,
                Collectors.averagingDouble(this::calculateMatchRating)
            ));

        return CricketFormatTrends.builder()
            .countryCode(countryCode)
            .periodDays(days)
            .formatPopularity(formatCounts)
            .formatRatings(averageRatings)
            .trendingFormat(findTrendingFormat(recentMatches))
            .recommendations(generateFormatRecommendations(formatCounts, averageRatings))
            .build();
    }

    /**
     * Generate cricket performance insights for a player.
     */
    public CricketInsights generatePlayerInsights(Long userId, int recentMatches) {
        List<CricketPlayerPerformance> recent = playerPerformanceRepository
            .findRecentPerformancesByPlayer(userId, recentMatches);

        return CricketInsights.builder()
            .playerId(userId)
            .strengths(identifyPlayerStrengths(recent))
            .weaknesses(identifyPlayerWeaknesses(recent))
            .improvements(suggestImprovements(recent))
            .nextGoals(setPerformanceGoals(recent))
            .roleRecommendation(recommendOptimalRole(recent))
            .formatSuitability(analyzeFormatSuitability(recent))
            .build();
    }

    // ===== PRIVATE CALCULATION METHODS =====

    private BattingStats calculateBattingStats(List<CricketPlayerPerformance> performances) {
        int totalRuns = performances.stream().mapToInt(CricketPlayerPerformance::getRunsScored).sum();
        int totalBalls = performances.stream().mapToInt(CricketPlayerPerformance::getBallsFaced).sum();
        int totalInnings = (int) performances.stream().filter(p -> p.getBallsFaced() > 0).count();
        int notOuts = (int) performances.stream().filter(CricketPlayerPerformance::getIsNotOut).count();
        int dismissals = totalInnings - notOuts;

        double battingAverage = dismissals > 0 ? (double) totalRuns / dismissals : totalRuns;
        double strikeRate = totalBalls > 0 ? ((double) totalRuns / totalBalls) * 100 : 0;

        int centuries = (int) performances.stream().filter(p -> p.getRunsScored() >= 100).count();
        int halfCenturies = (int) performances.stream().filter(p -> p.getRunsScored() >= 50 && p.getRunsScored() < 100).count();
        int highestScore = performances.stream().mapToInt(CricketPlayerPerformance::getRunsScored).max().orElse(0);

        return BattingStats.builder()
            .totalRuns(totalRuns)
            .totalInnings(totalInnings) 
            .battingAverage(BigDecimal.valueOf(battingAverage).setScale(2, RoundingMode.HALF_UP))
            .strikeRate(BigDecimal.valueOf(strikeRate).setScale(2, RoundingMode.HALF_UP))
            .highestScore(highestScore)
            .centuries(centuries)
            .halfCenturies(halfCenturies)
            .notOuts(notOuts)
            .totalFours(performances.stream().mapToInt(CricketPlayerPerformance::getFoursHit).sum())
            .totalSixes(performances.stream().mapToInt(CricketPlayerPerformance::getSixesHit).sum())
            .build();
    }

    private BowlingStats calculateBowlingStats(List<CricketPlayerPerformance> performances) {
        double totalOvers = performances.stream().mapToDouble(CricketPlayerPerformance::getOversBowled).sum();
        int totalWickets = performances.stream().mapToInt(CricketPlayerPerformance::getWicketsTaken).sum();
        int totalRuns = performances.stream().mapToInt(CricketPlayerPerformance::getRunsConceded).sum();

        double bowlingAverage = totalWickets > 0 ? (double) totalRuns / totalWickets : 0;
        double economyRate = totalOvers > 0 ? (double) totalRuns / totalOvers : 0;

        int fiveWicketHauls = (int) performances.stream().filter(p -> p.getWicketsTaken() >= 5).count();
        String bestFigures = performances.stream()
            .max(Comparator.comparing(p -> p.getWicketsTaken() * 100 - p.getRunsConceded()))
            .map(p -> p.getWicketsTaken() + "/" + p.getRunsConceded())
            .orElse("0/0");

        return BowlingStats.builder()
            .totalWickets(totalWickets)
            .totalOvers(BigDecimal.valueOf(totalOvers).setScale(1, RoundingMode.HALF_UP))
            .bowlingAverage(BigDecimal.valueOf(bowlingAverage).setScale(2, RoundingMode.HALF_UP))
            .economyRate(BigDecimal.valueOf(economyRate).setScale(2, RoundingMode.HALF_UP))
            .bestBowlingFigures(bestFigures)
            .fiveWicketHauls(fiveWicketHauls)
            .totalMaidens(performances.stream().mapToInt(CricketPlayerPerformance::getMaidenOvers).sum())
            .dotBallPercentage(calculateDotBallPercentage(performances))
            .build();
    }

    private FieldingStats calculateFieldingStats(List<CricketPlayerPerformance> performances) {
        return FieldingStats.builder()
            .totalCatches(performances.stream().mapToInt(CricketPlayerPerformance::getCatchesTaken).sum())
            .totalRunOuts(performances.stream().mapToInt(CricketPlayerPerformance::getRunOuts).sum())
            .totalStumpings(performances.stream().mapToInt(CricketPlayerPerformance::getStumpings).sum())
            .droppedCatches(performances.stream().mapToInt(CricketPlayerPerformance::getDroppedCatches).sum())
            .catchingEfficiency(calculateCatchingEfficiency(performances))
            .build();
    }

    private CareerSummary calculateCareerSummary(List<CricketPlayerPerformance> performances) {
        Set<Long> uniqueMatches = performances.stream()
            .map(p -> p.getInnings().getCricketMatch().getId())
            .collect(Collectors.toSet());

        long wonMatches = performances.stream()
            .map(p -> p.getInnings().getCricketMatch())
            .filter(match -> match.getMatchStatus() == CricketMatch.MatchStatus.COMPLETED)
            .map(CricketMatch::getWinningTeam)
            .filter(Objects::nonNull)
            .count();

        return CareerSummary.builder()
            .totalMatches(uniqueMatches.size())
            .matchesWon((int) wonMatches)
            .winPercentage(uniqueMatches.size() > 0 ? ((double) wonMatches / uniqueMatches.size()) * 100 : 0)
            .debutDate(performances.stream()
                .min(Comparator.comparing(CricketPlayerPerformance::getCreatedAt))
                .map(CricketPlayerPerformance::getCreatedAt)
                .orElse(null))
            .lastMatchDate(performances.stream()
                .max(Comparator.comparing(CricketPlayerPerformance::getCreatedAt))
                .map(CricketPlayerPerformance::getCreatedAt)
                .orElse(null))
            .build();
    }

    private RecentForm calculateRecentForm(List<CricketPlayerPerformance> performances) {
        List<CricketPlayerPerformance> recent = performances.stream()
            .sorted(Comparator.comparing(CricketPlayerPerformance::getCreatedAt).reversed())
            .limit(5)
            .toList();

        if (recent.isEmpty()) {
            return RecentForm.builder().matchesAnalyzed(0).trend("NO_DATA").build();
        }

        double avgRating = recent.stream()
            .filter(p -> p.getPerformanceRating() != null)
            .mapToDouble(CricketPlayerPerformance::getPerformanceRating)
            .average()
            .orElse(0.0);

        double avgImpact = recent.stream()
            .filter(p -> p.getImpactScore() != null)
            .mapToDouble(CricketPlayerPerformance::getImpactScore)
            .average()
            .orElse(0.0);

        String trend = analyzeTrend(recent);

        return RecentForm.builder()
            .matchesAnalyzed(recent.size())
            .averageRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP))
            .averageImpact(BigDecimal.valueOf(avgImpact).setScale(2, RoundingMode.HALF_UP))
            .trend(trend)
            .recentHighlights(findRecentHighlights(recent))
            .build();
    }

    private List<Milestone> calculateMilestones(List<CricketPlayerPerformance> performances) {
        List<Milestone> milestones = new ArrayList<>();

        // Batting milestones
        long centuries = performances.stream().filter(p -> p.getRunsScored() >= 100).count();
        if (centuries > 0) {
            milestones.add(new Milestone("CENTURIES", "Centuries Scored", (int) centuries, "🏏"));
        }

        long halfCenturies = performances.stream().filter(p -> p.getRunsScored() >= 50).count();
        if (halfCenturies > 0) {
            milestones.add(new Milestone("HALF_CENTURIES", "Half-Centuries", (int) halfCenturies, "⭐"));
        }

        // Bowling milestones
        long fiveWickets = performances.stream().filter(p -> p.getWicketsTaken() >= 5).count();
        if (fiveWickets > 0) {
            milestones.add(new Milestone("FIVE_WICKETS", "Five-Wicket Hauls", (int) fiveWickets, "🎳"));
        }

        // Fielding milestones
        long hatTricks = performances.stream().filter(p -> p.getCatchesTaken() >= 3).count();
        if (hatTricks > 0) {
            milestones.add(new Milestone("FIELDING_EXCELLENCE", "Outstanding Fielding", (int) hatTricks, "🥇"));
        }

        return milestones;
    }

    private MatchSummary createMatchSummary(CricketMatch match, List<CricketInnings> innings) {
        return MatchSummary.builder()
            .matchId(match.getId())
            .format(match.getMatchFormat())
            .status(match.getMatchStatus())
            .startTime(match.getMatchStartTime())
            .endTime(match.getMatchEndTime())
            .venue(match.getGame().getLocation())
            .weather(match.getWeatherConditions())
            .tossWinner(match.getTossWinningTeam()?.getTeamName())
            .tossDecision(match.getTossDecision()?.getDescription())
            .result(match.getMatchResult())
            .winningTeam(match.getWinningTeam()?.getTeamName())
            .manOfTheMatch(match.getManOfTheMatch()?.getUsername())
            .totalOvers(innings.stream().mapToInt(CricketInnings::getOversCompleted).sum())
            .totalWickets(innings.stream().mapToInt(CricketInnings::getTotalWickets).sum())
            .totalRuns(innings.stream().mapToInt(CricketInnings::getTotalRuns).sum())
            .build();
    }

    private List<InningsAnalysis> analyzeInnings(List<CricketInnings> innings) {
        return innings.stream().map(this::analyzeInnings).toList();
    }

    private InningsAnalysis analyzeInnings(CricketInnings innings) {
        double runRate = innings.getCurrentRunRate() != null ? innings.getCurrentRunRate() : 0.0;
        
        return InningsAnalysis.builder()
            .inningsNumber(innings.getInningsNumber())
            .battingTeam(innings.getBattingTeam().getTeamName())
            .totalRuns(innings.getTotalRuns())
            .totalWickets(innings.getTotalWickets())
            .overs(innings.getOversCompleted() + "." + innings.getBallsInCurrentOver())
            .runRate(BigDecimal.valueOf(runRate).setScale(2, RoundingMode.HALF_UP))
            .extras(innings.getTotalExtras())
            .conclusion(innings.getInningsConclusion()?.getDescription())
            .keyPartnerships(findKeyPartnerships(innings))
            .topPerformers(findTopPerformers(innings))
            .build();
    }

    private List<KeyMoment> findKeyMoments(Long matchId) {
        List<CricketBall> allBalls = cricketBallRepository.findByMatchIdOrderByBallTime(matchId);
        List<KeyMoment> moments = new ArrayList<>();

        for (CricketBall ball : allBalls) {
            // Wickets are key moments
            if (ball.getIsWicket()) {
                moments.add(KeyMoment.builder()
                    .type("WICKET")
                    .description(ball.getBatsmanOnStrike().getUsername() + " " + 
                               ball.getWicketType().getDisplayName())
                    .time(ball.getBallTime())
                    .over(ball.getOverBallDisplay())
                    .impact(8.0) // High impact for wickets
                    .build());
            }
            
            // Boundaries are key moments
            if (ball.getRunsOffBall() >= 4) {
                String boundaryType = ball.getRunsOffBall() == 6 ? "SIX" : "FOUR";
                moments.add(KeyMoment.builder()
                    .type(boundaryType)
                    .description(ball.getBatsmanOnStrike().getUsername() + " hits " + boundaryType)
                    .time(ball.getBallTime())
                    .over(ball.getOverBallDisplay())
                    .impact(ball.getRunsOffBall() == 6 ? 6.0 : 4.0)
                    .build());
            }
        }

        // Sort by impact and return top moments
        return moments.stream()
            .sorted(Comparator.comparing(KeyMoment::getImpact).reversed())
            .limit(20)
            .toList();
    }

    private String analyzeTrend(List<CricketPlayerPerformance> recent) {
        if (recent.size() < 3) return "INSUFFICIENT_DATA";

        List<Double> ratings = recent.stream()
            .filter(p -> p.getPerformanceRating() != null)
            .map(p -> p.getPerformanceRating().doubleValue())
            .toList();

        if (ratings.size() < 3) return "INSUFFICIENT_DATA";

        double firstHalf = ratings.subList(0, ratings.size()/2).stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double secondHalf = ratings.subList(ratings.size()/2, ratings.size()).stream().mapToDouble(Double::doubleValue).average().orElse(0);

        if (secondHalf > firstHalf + 0.5) return "IMPROVING";
        if (secondHalf < firstHalf - 0.5) return "DECLINING";
        return "STABLE";
    }

    private double calculateMatchRating(CricketMatch match) {
        List<CricketPlayerPerformance> performances = playerPerformanceRepository.findByMatchId(match.getId());
        return performances.stream()
            .filter(p -> p.getPerformanceRating() != null)
            .mapToDouble(CricketPlayerPerformance::getPerformanceRating)
            .average()
            .orElse(0.0);
    }

    private CricketMatch.CricketFormat findTrendingFormat(List<CricketMatch> matches) {
        Map<CricketMatch.CricketFormat, Long> counts = matches.stream()
            .filter(m -> m.getMatchStartTime() != null && 
                        m.getMatchStartTime().isAfter(OffsetDateTime.now().minusDays(7)))
            .collect(Collectors.groupingBy(CricketMatch::getMatchFormat, Collectors.counting()));

        return counts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(CricketMatch.CricketFormat.T20);
    }

    private BigDecimal calculateDotBallPercentage(List<CricketPlayerPerformance> performances) {
        // This would require ball-by-ball analysis - simplified for now
        return BigDecimal.valueOf(35.0); // Sample percentage
    }

    private BigDecimal calculateCatchingEfficiency(List<CricketPlayerPerformance> performances) {
        int totalCatches = performances.stream().mapToInt(CricketPlayerPerformance::getCatchesTaken).sum();
        int droppedCatches = performances.stream().mapToInt(CricketPlayerPerformance::getDroppedCatches).sum();
        int totalChances = totalCatches + droppedCatches;
        
        if (totalChances == 0) return BigDecimal.ZERO;
        
        double efficiency = ((double) totalCatches / totalChances) * 100;
        return BigDecimal.valueOf(efficiency).setScale(1, RoundingMode.HALF_UP);
    }

    private CricketPlayerStats createEmptyPlayerStats(Long userId, CricketMatch.CricketFormat format) {
        return CricketPlayerStats.builder()
            .playerId(userId)
            .format(format)
            .battingStats(BattingStats.builder().build())
            .bowlingStats(BowlingStats.builder().build())
            .fieldingStats(FieldingStats.builder().build())
            .careerSummary(CareerSummary.builder().totalMatches(0).build())
            .performanceRating(BigDecimal.ZERO)
            .build();
    }

    // Additional helper methods would be implemented for:
    // - findKeyPartnerships()
    // - findTopPerformers()  
    // - identifyPlayerStrengths()
    // - suggestImprovements()
    // - recommendOptimalRole()

    // ===== SUPPORTING DATA CLASSES =====

    @lombok.Data
    @lombok.Builder
    public static class CricketPlayerStats {
        private Long playerId;
        private CricketMatch.CricketFormat format;
        private BattingStats battingStats;
        private BowlingStats bowlingStats;
        private FieldingStats fieldingStats;
        private CareerSummary careerSummary;
        private RecentForm recentForm;
        private List<Milestone> milestones;
        private BigDecimal performanceRating;
    }

    @lombok.Data
    @lombok.Builder
    public static class BattingStats {
        private Integer totalRuns;
        private Integer totalInnings;
        private BigDecimal battingAverage;
        private BigDecimal strikeRate;
        private Integer highestScore;
        private Integer centuries;
        private Integer halfCenturies;
        private Integer notOuts;
        private Integer totalFours;
        private Integer totalSixes;
    }

    @lombok.Data
    @lombok.Builder
    public static class BowlingStats {
        private Integer totalWickets;
        private BigDecimal totalOvers;
        private BigDecimal bowlingAverage;
        private BigDecimal economyRate;
        private String bestBowlingFigures;
        private Integer fiveWicketHauls;
        private Integer totalMaidens;
        private BigDecimal dotBallPercentage;
    }

    @lombok.Data
    @lombok.Builder
    public static class FieldingStats {
        private Integer totalCatches;
        private Integer totalRunOuts;
        private Integer totalStumpings;
        private Integer droppedCatches;
        private BigDecimal catchingEfficiency;
    }

    public record Milestone(String type, String description, Integer count, String emoji) {}

    @lombok.Data
    @lombok.Builder
    public static class RecentForm {
        private Integer matchesAnalyzed;
        private BigDecimal averageRating;
        private BigDecimal averageImpact;
        private String trend;
        private List<String> recentHighlights;
    }

    @lombok.Data
    @lombok.Builder
    public static class CareerSummary {
        private Integer totalMatches;
        private Integer matchesWon;
        private Double winPercentage;
        private OffsetDateTime debutDate;
        private OffsetDateTime lastMatchDate;
    }

    // Additional supporting classes for comprehensive cricket analytics...
}