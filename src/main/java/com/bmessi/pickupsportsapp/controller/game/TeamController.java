package com.bmessi.pickupsportsapp.controller.game;

import com.bmessi.pickupsportsapp.entity.game.Team;
import com.bmessi.pickupsportsapp.entity.game.TeamMember;
import com.bmessi.pickupsportsapp.service.game.TeamFormationService;
import com.bmessi.pickupsportsapp.repository.TeamRepository;
import com.bmessi.pickupsportsapp.repository.TeamMemberRepository;
import com.bmessi.pickupsportsapp.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST controller for team management and formation.
 * 
 * <p>This controller provides endpoints for:</p>
 * <ul>
 *   <li><strong>Team Formation:</strong> Automatic and manual team creation</li>
 *   <li><strong>Player Management:</strong> Add, remove, and reassign players</li>
 *   <li><strong>Team Analytics:</strong> Team balance and statistics</li>
 *   <li><strong>Captain Assignment:</strong> Manage team leadership</li>
 * </ul>
 * 
 * <p><strong>Access Control:</strong></p>
 * <ul>
 *   <li>Public: View team information</li>
 *   <li>Authenticated: Join teams via game registration</li>
 *   <li>Game Owner: Manage teams for their games</li>
 *   <li>Admin: Full team management capabilities</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Teams", description = "Team formation and management")
public class TeamController {

    private final TeamFormationService teamFormationService;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    /**
     * Get team details by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get team details")
    public ResponseEntity<TeamDetailsResponse> getTeam(
            @Parameter(description = "Team ID")
            @PathVariable Long id) {
        log.debug("Fetching team details for ID: {}", id);
        
        return teamRepository.findById(id)
                .map(team -> {
                    List<TeamMember> members = teamMemberRepository.findByTeamIdOrderByMemberTypeDescJerseyNumber(id);
                    TeamDetailsResponse response = new TeamDetailsResponse(team, members);
                    return ResponseEntity.ok()
                            .header("Cache-Control", "private, max-age=60") // 1 minute cache
                            .body(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all team members for a team.
     */
    @GetMapping("/{id}/members")
    @Operation(summary = "Get team roster")
    public ResponseEntity<List<TeamMember>> getTeamMembers(
            @Parameter(description = "Team ID")
            @PathVariable Long id) {
        log.debug("Fetching members for team: {}", id);
        
        List<TeamMember> members = teamMemberRepository.findByTeamIdOrderByMemberTypeDescJerseyNumber(id);
        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=30") // 30 seconds cache
                .body(members);
    }

    /**
     * Manually assign a player to a team.
     */
    @PostMapping("/{id}/members")
    @Operation(summary = "Add player to team")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeamMember> addPlayerToTeam(
            @Parameter(description = "Team ID")
            @PathVariable Long id,
            @Valid @RequestBody AddPlayerRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Adding player {} to team {} by user {}", 
                 request.userId, id, userDetails.getUsername());
        
        // Verify user has permission (game owner or admin)
        // TODO: Add authorization check
        
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + id));
        
        TeamMember member = teamFormationService.assignPlayerToTeam(
                team.getGame().getId(), request.userId, team.getTeamNumber());
        
        return ResponseEntity.ok(member);
    }

    /**
     * Remove a player from a team.
     */
    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove player from team")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removePlayerFromTeam(
            @Parameter(description = "Team ID")
            @PathVariable Long id,
            @Parameter(description = "User ID to remove")
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Removing player {} from team {} by user {}", 
                 userId, id, userDetails.getUsername());
        
        // TODO: Add authorization check and implementation
        return ResponseEntity.noContent().build();
    }

    /**
     * Assign captain to a team.
     */
    @PutMapping("/{id}/captain/{userId}")
    @Operation(summary = "Assign team captain")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Team> assignCaptain(
            @Parameter(description = "Team ID")
            @PathVariable Long id,
            @Parameter(description = "User ID to make captain")
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Assigning captain {} to team {} by user {}", 
                 userId, id, userDetails.getUsername());
        
        // TODO: Implement captain assignment logic
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + id));
        
        return ResponseEntity.ok(team);
    }

    /**
     * Shuffle team members.
     */
    @PostMapping("/{id}/shuffle")
    @Operation(summary = "Shuffle team members")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeamDetailsResponse> shuffleTeam(
            @Parameter(description = "Team ID")
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Shuffling team {} by user {}", id, userDetails.getUsername());
        
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + id));
        
        // Shuffle all teams for the game
        teamFormationService.shuffleTeams(team.getGame().getId());
        
        // Return updated team
        Team updatedTeam = teamRepository.findById(id).orElseThrow();
        List<TeamMember> members = teamMemberRepository.findByTeamIdOrderByMemberTypeDescJerseyNumber(id);
        TeamDetailsResponse response = new TeamDetailsResponse(updatedTeam, members);
        
        return ResponseEntity.ok(response);
    }

    // Request/Response DTOs

    public static class AddPlayerRequest {
        public Long userId;
        public String preferredPosition;
        public Boolean isSubstitute = false;
    }

    public static class TeamDetailsResponse {
        public Long id;
        public String teamName;
        public String teamColor;
        public Integer teamNumber;
        public CaptainInfo captain;
        public List<TeamMemberInfo> members;
        public Integer activePlayersCount;
        public Double averageSkillLevel;
        public String status;
        public Boolean isReady;
        
        public TeamDetailsResponse(Team team, List<TeamMember> members) {
            this.id = team.getId();
            this.teamName = team.getTeamName();
            this.teamColor = team.getTeamColor();
            this.teamNumber = team.getTeamNumber();
            this.activePlayersCount = team.getActivePlayersCount();
            this.averageSkillLevel = team.getAverageSkillLevel();
            this.status = team.getStatus().name();
            this.isReady = team.isReadyToPlay();
            
            if (team.getCaptain() != null) {
                this.captain = new CaptainInfo(
                        team.getCaptain().getId(),
                        team.getCaptain().getUsername(),
                        team.getCaptain().getSkillLevel() != null ? team.getCaptain().getSkillLevel().name() : null
                );
            }
            
            this.members = members.stream()
                    .map(TeamMemberInfo::new)
                    .collect(java.util.stream.Collectors.toList());
        }
    }

    public static class CaptainInfo {
        public Long id;
        public String username;
        public String skillLevel;
        
        public CaptainInfo(Long id, String username, String skillLevel) {
            this.id = id;
            this.username = username;
            this.skillLevel = skillLevel;
        }
    }

    public static class TeamMemberInfo {
        public Long id;
        public UserInfo user;
        public String memberType;
        public String preferredPosition;
        public String assignedPosition;
        public Boolean isSubstitute;
        public Integer jerseyNumber;
        public String paymentStatus;
        public Boolean checkedIn;
        public Boolean attended;
        
        public TeamMemberInfo(TeamMember member) {
            this.id = member.getId();
            this.memberType = member.getMemberType().name();
            this.preferredPosition = member.getPreferredPosition();
            this.assignedPosition = member.getAssignedPosition();
            this.isSubstitute = member.isSubstitute();
            this.jerseyNumber = member.getJerseyNumber();
            this.paymentStatus = member.getPaymentStatus().name();
            this.checkedIn = member.isCheckedIn();
            this.attended = member.getAttended();
            
            if (member.getUser() != null) {
                this.user = new UserInfo(
                        member.getUser().getId(),
                        member.getUser().getUsername(),
                        member.getUser().getSkillLevel() != null ? member.getUser().getSkillLevel().name() : null
                );
            }
        }
    }

    public static class UserInfo {
        public Long id;
        public String username;
        public String skillLevel;
        
        public UserInfo(Long id, String username, String skillLevel) {
            this.id = id;
            this.username = username;
            this.skillLevel = skillLevel;
        }
    }
}