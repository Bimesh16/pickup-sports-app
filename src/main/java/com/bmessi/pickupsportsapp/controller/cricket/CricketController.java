package com.bmessi.pickupsportsapp.controller.cricket;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.cricket.CricketMatch;
import com.bmessi.pickupsportsapp.entity.game.Team;
import com.bmessi.pickupsportsapp.service.cricket.CricketScoringService;
import com.bmessi.pickupsportsapp.service.cricket.CricketScoringService.*;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.TeamRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.List;

/**
 * REST Controller for cricket-specific match management and scoring.
 * 
 * <p>This controller provides endpoints for comprehensive cricket functionality
 * including live scoring, match management, player statistics, and scorecard access.</p>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Match Management:</strong> Initialize matches, conduct toss, start games</li>
 *   <li><strong>Live Scoring:</strong> Ball-by-ball scoring with real-time updates</li>
 *   <li><strong>Statistics:</strong> Player and team performance tracking</li>
 *   <li><strong>Scorecards:</strong> Live and historical match scorecards</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@RestController
@RequestMapping("/cricket")
@RequiredArgsConstructor
@Tag(name = "Cricket Management", description = "Cricket match scoring and statistics")
public class CricketController {

    private final CricketScoringService cricketScoringService;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    /**
     * Initialize a cricket match from an existing game.
     */
    @Operation(summary = "Initialize cricket match", 
               description = "Convert a regular game into a cricket match with specified format")
    @PostMapping("/matches/{gameId}/initialize")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<CricketMatchInfo> initializeCricketMatch(
            @Parameter(description = "Game identifier") @PathVariable Long gameId,
            @Parameter(description = "Cricket match format") @RequestParam CricketMatch.CricketFormat format,
            @Parameter(hidden = true) Principal principal
    ) {
        // Validate user has permission to initialize match (game owner or admin)
        validateMatchAccess(gameId, principal);

        Game game = gameRepository.findById(gameId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));

        if (!game.getSport().equalsIgnoreCase("Cricket")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Game must be cricket to initialize cricket match");
        }

        CricketMatch cricketMatch = cricketScoringService.initializeCricketMatch(game, format);

        CricketMatchInfo response = CricketMatchInfo.builder()
            .matchId(cricketMatch.getId())
            .gameId(gameId)
            .format(format)
            .status(cricketMatch.getMatchStatus())
            .maxOvers(cricketMatch.getMaxOversPerInnings())
            .inningsPerTeam(cricketMatch.getInningsPerTeam())
            .teams(getTeamInfo(gameId))
            .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Conduct toss for cricket match.
     */
    @Operation(summary = "Conduct toss", 
               description = "Conduct toss and set batting/bowling order")
    @PostMapping("/matches/{matchId}/toss")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TossResult> conductToss(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId,
            @Valid @RequestBody TossRequest request,
            @Parameter(hidden = true) Principal principal
    ) {
        validateMatchAccess(matchId, principal);

        Team tossWinningTeam = teamRepository.findById(request.tossWinningTeamId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        TossResult result = cricketScoringService.conductToss(matchId, tossWinningTeam, request.decision());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Start the cricket match.
     */
    @Operation(summary = "Start cricket match", 
               description = "Begin the cricket match after toss completion")
    @PostMapping("/matches/{matchId}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> startMatch(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId,
            @Parameter(hidden = true) Principal principal
    ) {
        validateMatchAccess(matchId, principal);
        cricketScoringService.startMatch(matchId);
        return ResponseEntity.ok().build();
    }

    /**
     * Record a ball delivery.
     */
    @Operation(summary = "Record ball delivery", 
               description = "Record a single ball delivery with runs, outcome, and statistics")
    @PostMapping("/matches/{matchId}/balls")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BallResult> recordBall(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId,
            @Valid @RequestBody BallDeliveryDTO ballData,
            @Parameter(hidden = true) Principal principal
    ) {
        validateScoringAccess(matchId, principal);

        BallDeliveryRequest request = BallDeliveryRequest.builder()
            .bowler(getUser(ballData.bowlerId()))
            .batsmanOnStrike(getUser(ballData.batsmanOnStrikeId()))
            .batsmanNonStrike(getUser(ballData.batsmanNonStrikeId()))
            .runs(ballData.runs())
            .outcome(ballData.outcome())
            .isWicket(ballData.isWicket())
            .wicketType(ballData.wicketType())
            .fielder(ballData.fielderId() != null ? getUser(ballData.fielderId()) : null)
            .isExtra(ballData.isExtra())
            .extraType(ballData.extraType())
            .shotType(ballData.shotType())
            .commentary(ballData.commentary())
            .build();

        BallResult result = cricketScoringService.recordBall(matchId, request);
        return ResponseEntity.ok(result);
    }

    /**
     * Get current live scorecard.
     */
    @Operation(summary = "Get live scorecard", 
               description = "Get current match scorecard with live statistics")
    @GetMapping("/matches/{matchId}/scorecard")
    public ResponseEntity<CricketScorecard> getLiveScorecard(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId
    ) {
        CricketScorecard scorecard = cricketScoringService.getCurrentScorecard(matchId);
        return ResponseEntity.ok(scorecard);
    }

    /**
     * Complete current innings.
     */
    @Operation(summary = "Complete innings", 
               description = "End current innings and transition to next or complete match")
    @PostMapping("/matches/{matchId}/innings/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InningsTransitionResult> completeInnings(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId,
            @Parameter(description = "How the innings concluded") @RequestParam CricketInnings.InningsConclusion conclusion,
            @Parameter(hidden = true) Principal principal
    ) {
        validateScoringAccess(matchId, principal);
        
        InningsTransitionResult result = cricketScoringService.completeCurrentInnings(matchId, conclusion);
        return ResponseEntity.ok(result);
    }

    /**
     * Get available cricket formats.
     */
    @Operation(summary = "Get cricket formats", 
               description = "List all available cricket match formats")
    @GetMapping("/formats")
    public ResponseEntity<List<CricketFormatInfo>> getCricketFormats() {
        List<CricketFormatInfo> formats = List.of(
            new CricketFormatInfo(CricketMatch.CricketFormat.T20, "T20", "20 overs per side", 90, "🏏"),
            new CricketFormatInfo(CricketMatch.CricketFormat.T10, "T10", "10 overs per side", 60, "⚡"),
            new CricketFormatInfo(CricketMatch.CricketFormat.ODI, "ODI", "50 overs per side", 480, "🏆"),
            new CricketFormatInfo(CricketMatch.CricketFormat.STREET, "Street", "Flexible format", 45, "🎯"),
            new CricketFormatInfo(CricketMatch.CricketFormat.HUNDRED, "Hundred", "100 balls per side", 150, "💯")
        );
        return ResponseEntity.ok(formats);
    }

    /**
     * Get cricket-specific game templates.
     */
    @Operation(summary = "Get cricket game templates", 
               description = "Get pre-configured cricket game templates for different formats")
    @GetMapping("/templates")
    public ResponseEntity<List<CricketGameTemplate>> getCricketTemplates() {
        List<CricketGameTemplate> templates = List.of(
            CricketGameTemplate.builder()
                .name("T20 Cricket")
                .format(CricketMatch.CricketFormat.T20)
                .playersPerTeam(11)
                .minPlayers(16) // 8 per side minimum
                .maxPlayers(22) // 11 per side
                .duration(90)
                .description("Standard T20 format - 20 overs per side")
                .equipment("Cricket bat, ball, stumps, pads, gloves")
                .rules("T20 cricket rules apply, powerplay overs, strategic timeouts")
                .build(),
                
            CricketGameTemplate.builder()
                .name("Street Cricket")
                .format(CricketMatch.CricketFormat.STREET)
                .playersPerTeam(6)
                .minPlayers(8) // 4 per side minimum
                .maxPlayers(16) // 8 per side maximum
                .duration(45)
                .description("Casual street cricket - flexible rules")
                .equipment("Tennis ball, bat, makeshift stumps")
                .rules("Street cricket rules - all play, limited space adaptations")
                .build(),
                
            CricketGameTemplate.builder()
                .name("T10 Blast")
                .format(CricketMatch.CricketFormat.T10)
                .playersPerTeam(11)
                .minPlayers(14)
                .maxPlayers(22)
                .duration(60)
                .description("Fast-paced T10 format - 10 overs per side")
                .equipment("Cricket bat, ball, stumps, basic protective gear")
                .rules("T10 rules - fast-paced, entertainment focused")
                .build()
        );

        return ResponseEntity.ok(templates);
    }

    /**
     * Get player statistics for a cricket match.
     */
    @Operation(summary = "Get player statistics", 
               description = "Get detailed cricket statistics for all players in a match")
    @GetMapping("/matches/{matchId}/stats")
    public ResponseEntity<CricketMatchStats> getMatchStatistics(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId
    ) {
        CricketMatchStats stats = cricketScoringService.getMatchStatistics(matchId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Update match conditions (weather, pitch).
     */
    @Operation(summary = "Update match conditions", 
               description = "Update weather and pitch conditions during the match")
    @PutMapping("/matches/{matchId}/conditions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateMatchConditions(
            @Parameter(description = "Cricket match identifier") @PathVariable Long matchId,
            @Valid @RequestBody MatchConditionsUpdate conditions,
            @Parameter(hidden = true) Principal principal
    ) {
        validateScoringAccess(matchId, principal);
        cricketScoringService.updateMatchConditions(matchId, conditions);
        return ResponseEntity.ok().build();
    }

    // ===== PRIVATE HELPER METHODS =====

    private void validateMatchAccess(Long gameId, Principal principal) {
        // Implementation to check if user can manage this cricket match
        // Could be game owner, appointed scorer, or admin
    }

    private void validateScoringAccess(Long matchId, Principal principal) {
        // Implementation to check if user can record scores for this match
        // Could be designated scorer, match official, or team captain
    }

    private User getUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private List<TeamInfo> getTeamInfo(Long gameId) {
        return teamRepository.findByGameId(gameId).stream()
            .map(team -> TeamInfo.builder()
                .teamId(team.getId())
                .teamName(team.getTeamName())
                .teamColor(team.getTeamColor())
                .captain(team.getCaptain()?.getUsername())
                .playerCount(team.getCurrentPlayerCount())
                .build())
            .toList();
    }

    // ===== REQUEST/RESPONSE DTOs =====

    public record TossRequest(
        @Parameter(description = "ID of team that won the toss") Long tossWinningTeamId,
        @Parameter(description = "Toss decision - bat or bowl first") CricketMatch.TossDecision decision
    ) {}

    @lombok.Data
    @lombok.Builder
    public static class BallDeliveryDTO {
        @Parameter(description = "Bowler user ID") private Long bowlerId;
        @Parameter(description = "Batsman on strike user ID") private Long batsmanOnStrikeId;
        @Parameter(description = "Batsman at non-striker end user ID") private Long batsmanNonStrikeId;
        @Parameter(description = "Runs scored off this ball") private Integer runs;
        @Parameter(description = "Ball outcome") private CricketBall.BallOutcome outcome;
        @Parameter(description = "Whether this ball resulted in wicket") private Boolean isWicket;
        @Parameter(description = "Type of dismissal") private CricketPlayerPerformance.DismissalType wicketType;
        @Parameter(description = "Fielder involved in dismissal") private Long fielderId;
        @Parameter(description = "Whether this is an extra") private Boolean isExtra;
        @Parameter(description = "Type of extra") private CricketBall.ExtraType extraType;
        @Parameter(description = "Shot played by batsman") private String shotType;
        @Parameter(description = "Commentary for this ball") private String commentary;
    }

    @lombok.Data
    @lombok.Builder
    public static class MatchConditionsUpdate {
        @Parameter(description = "Weather conditions") private String weatherConditions;
        @Parameter(description = "Pitch conditions") private String pitchConditions;
    }

    @lombok.Data
    @lombok.Builder
    public static class CricketMatchInfo {
        private Long matchId;
        private Long gameId;
        private CricketMatch.CricketFormat format;
        private CricketMatch.MatchStatus status;
        private Integer maxOvers;
        private Integer inningsPerTeam;
        private List<TeamInfo> teams;
    }

    @lombok.Data
    @lombok.Builder
    public static class TeamInfo {
        private Long teamId;
        private String teamName;
        private String teamColor;
        private String captain;
        private Integer playerCount;
    }

    public record CricketFormatInfo(
        CricketMatch.CricketFormat format,
        String name,
        String description,
        Integer durationMinutes,
        String emoji
    ) {}

    @lombok.Data
    @lombok.Builder
    public static class CricketGameTemplate {
        private String name;
        private CricketMatch.CricketFormat format;
        private Integer playersPerTeam;
        private Integer minPlayers;
        private Integer maxPlayers;
        private Integer duration;
        private String description;
        private String equipment;
        private String rules;
    }

    @lombok.Data
    @lombok.Builder
    public static class CricketMatchStats {
        private Long matchId;
        private String matchFormat;
        private String status;
        private List<InningsStats> inningsStats;
        private List<PlayerStats> battingStats;
        private List<PlayerStats> bowlingStats;
        private List<PlayerStats> fieldingStats;
        private String matchSummary;
    }

    @lombok.Data
    @lombok.Builder
    public static class InningsStats {
        private Integer inningsNumber;
        private String battingTeam;
        private Integer totalRuns;
        private Integer totalWickets;
        private String overs;
        private Double runRate;
        private Integer extras;
        private String status;
    }

    @lombok.Data
    @lombok.Builder
    public static class PlayerStats {
        private String playerName;
        private String team;
        
        // Batting stats
        private Integer runs;
        private Integer ballsFaced;
        private Integer fours;
        private Integer sixes;
        private Double strikeRate;
        private String dismissal;
        
        // Bowling stats
        private Double oversBowled;
        private Integer wickets;
        private Integer runsConceded;
        private Double economyRate;
        private Integer maidens;
        
        // Fielding stats
        private Integer catches;
        private Integer runOuts;
        private Integer stumpings;
        
        // Overall
        private Double impactScore;
        private Integer performanceRating;
    }
}