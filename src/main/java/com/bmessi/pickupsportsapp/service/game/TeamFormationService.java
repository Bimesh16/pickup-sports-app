package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.game.GameTemplate;
import com.bmessi.pickupsportsapp.entity.game.Team;
import com.bmessi.pickupsportsapp.entity.game.TeamMember;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.model.SkillLevel;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.TeamRepository;
import com.bmessi.pickupsportsapp.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for automatic and manual team formation.
 * 
 * <p>This service handles the complex logic of forming balanced teams for games:</p>
 * <ul>
 *   <li><strong>Automatic Formation:</strong> Skill-balanced algorithm for fair teams</li>
 *   <li><strong>Manual Assignment:</strong> Owner/organizer manual team building</li>
 *   <li><strong>Draft Mode:</strong> Captain-based player selection</li>
 *   <li><strong>Team Balancing:</strong> Ongoing team balance validation and adjustment</li>
 * </ul>
 * 
 * <p><strong>Formation Strategies:</strong></p>
 * <ul>
 *   <li><strong>SKILL_BALANCED:</strong> Snake draft by skill level for fairness</li>
 *   <li><strong>RANDOM:</strong> Random assignment for casual games</li>
 *   <li><strong>MANUAL:</strong> Organizer controls all assignments</li>
 *   <li><strong>DRAFT:</strong> Captains take turns selecting players</li>
 *   <li><strong>FRIEND_GROUPS:</strong> Keep social groups together when possible</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TeamFormationService {

    private final GameRepository gameRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final com.bmessi.pickupsportsapp.repository.UserRepository userRepository;

    // Team color options for visual identification
    private static final List<String> TEAM_COLORS = Arrays.asList(
        "#FF4444", "#4444FF", "#44FF44", "#FFFF44", 
        "#FF44FF", "#44FFFF", "#FF8844", "#8844FF"
    );

    /**
     * Automatically form balanced teams for a game.
     */
    @Transactional
    public List<Team> autoFormTeams(Long gameId, Team.FormationStrategy strategy) {
        log.info("Auto-forming teams for game {} using strategy {}", gameId, strategy);
        
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        
        // Clear existing teams if any
        clearExistingTeams(gameId);
        
        // Get all registered players for this game
        List<User> participants = getGameParticipants(gameId);
        
        if (participants.isEmpty()) {
            log.warn("No participants found for game {}", gameId);
            return Collections.emptyList();
        }
        
        GameTemplate template = game.getGameTemplate();
        int teamCount = template != null ? template.getTotalTeams() : 2;
        
        // Create empty teams
        List<Team> teams = createEmptyTeams(game, teamCount);
        
        // Apply formation strategy
        switch (strategy) {
            case SKILL_BALANCED -> balanceTeamsBySkill(teams, participants, template);
            case RANDOM -> assignPlayersRandomly(teams, participants);
            case FRIEND_GROUPS -> assignKeepingFriendGroups(teams, participants);
            default -> balanceTeamsBySkill(teams, participants, template);
        }
        
        // Assign captains if required
        if (template != null && template.getCaptainAssignmentRequired()) {
            assignCaptains(teams);
        }
        
        // Mark teams as ready if they have minimum players
        updateTeamReadiness(teams, template);
        
        log.info("Formed {} teams for game {} with {} total players", 
                 teams.size(), gameId, participants.size());
        
        return teams;
    }

    /**
     * Balance teams by skill level using snake draft algorithm.
     */
    @Transactional
    public List<Team> balanceTeamsBySkill(Long gameId) {
        return autoFormTeams(gameId, Team.FormationStrategy.SKILL_BALANCED);
    }

    /**
     * Randomly assign players to teams.
     */
    @Transactional
    public List<Team> randomTeamAssignment(Long gameId) {
        return autoFormTeams(gameId, Team.FormationStrategy.RANDOM);
    }

    /**
     * Manually assign a player to a specific team.
     */
    @Transactional
    public TeamMember assignPlayerToTeam(Long gameId, Long userId, Integer teamNumber) {
        log.info("Manually assigning user {} to team {} for game {}", userId, teamNumber, gameId);
        
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        
        Team team = teamRepository.findByGameIdAndTeamNumber(gameId, teamNumber)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamNumber));
        
        // Check if team has space
        GameTemplate template = game.getGameTemplate();
        if (template != null && !team.hasSpaceForPlayer(false)) {
            throw new IllegalStateException("Team is full");
        }
        
        // Create team member
        TeamMember member = TeamMember.builder()
                .team(team)
                .user(getUserById(userId))
                .memberType(TeamMember.MemberType.ACTIVE)
                .isSubstitute(false)
                .manualAssignment(true)
                .assignmentReason("MANUAL_SELECT")
                .paymentStatus(TeamMember.PaymentStatus.PENDING)
                .build();
        
        // Calculate payment amount
        if (game.getPricePerPlayer() != null) {
            member.setAmountOwed(game.getPricePerPlayer());
        }
        
        return teamMemberRepository.save(member);
    }

    /**
     * Assign captains to all teams in a game.
     */
    @Transactional
    public void assignCaptains(Long gameId) {
        log.info("Assigning captains for game {}", gameId);
        
        List<Team> teams = teamRepository.findByGameIdOrderByTeamNumber(gameId);
        assignCaptains(teams);
    }

    /**
     * Shuffle team assignments while maintaining balance.
     */
    @Transactional
    public void shuffleTeams(Long gameId) {
        log.info("Shuffling teams for game {}", gameId);
        
        // Get all current team members
        List<TeamMember> members = teamMemberRepository.findByTeam_GameId(gameId);
        List<User> users = members.stream().map(TeamMember::getUser).collect(Collectors.toList());
        
        // Remove existing assignments
        teamMemberRepository.deleteAll(members);
        
        // Re-form teams with shuffled players
        Game game = gameRepository.findById(gameId).orElseThrow();
        List<Team> teams = teamRepository.findByGameIdOrderByTeamNumber(gameId);
        
        balanceTeamsBySkill(teams, users, game.getGameTemplate());
    }

    /**
     * Validate team formation for a game.
     */
    @Transactional(readOnly = true)
    public boolean validateTeamFormation(Long gameId) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        GameTemplate template = game.getGameTemplate();
        
        if (template == null) {
            return true; // No template constraints
        }
        
        List<Team> teams = teamRepository.findByGameIdOrderByTeamNumber(gameId);
        
        // Check team count
        if (teams.size() != template.getTotalTeams()) {
            log.warn("Game {} has {} teams but template requires {}", 
                     gameId, teams.size(), template.getTotalTeams());
            return false;
        }
        
        // Check team balance
        return areTeamsBalanced(gameId);
    }

    /**
     * Check if teams are balanced in terms of skill and player count.
     */
    @Transactional(readOnly = true)
    public boolean areTeamsBalanced(Long gameId) {
        List<Team> teams = teamRepository.findByGameIdOrderByTeamNumber(gameId);
        
        if (teams.size() < 2) return false;
        
        // Check player count balance (should be within 1 player of each other)
        int minPlayers = teams.stream().mapToInt(Team::getActivePlayersCount).min().orElse(0);
        int maxPlayers = teams.stream().mapToInt(Team::getActivePlayersCount).max().orElse(0);
        
        if (maxPlayers - minPlayers > 1) {
            return false; // Teams differ by more than 1 player
        }
        
        // Check skill balance (should be within 0.5 skill points)
        double minSkill = teams.stream().mapToDouble(t -> t.getAverageSkillLevel() != null ? t.getAverageSkillLevel() : 2.0).min().orElse(2.0);
        double maxSkill = teams.stream().mapToDouble(t -> t.getAverageSkillLevel() != null ? t.getAverageSkillLevel() : 2.0).max().orElse(2.0);
        
        return maxSkill - minSkill <= 0.5;
    }

    // Private helper methods

    private List<User> getGameParticipants(Long gameId) {
        // Get participants who have joined the game but aren't assigned to teams yet
        // This checks for existing participants in the Game entity's participants set
        Game game = gameRepository.findById(gameId).orElse(null);
        if (game == null || game.getParticipants() == null) {
            return Collections.emptyList();
        }
        
        // Filter out users who are already assigned to teams
        Set<Long> assignedUserIds = teamMemberRepository.findByTeam_GameId(gameId)
                .stream()
                .map(tm -> tm.getUser().getId())
                .collect(java.util.stream.Collectors.toSet());
        
        return game.getParticipants().stream()
                .filter(user -> !assignedUserIds.contains(user.getId()))
                .collect(java.util.stream.Collectors.toList());
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    private void clearExistingTeams(Long gameId) {
        List<Team> existingTeams = teamRepository.findByGameIdOrderByTeamNumber(gameId);
        if (!existingTeams.isEmpty()) {
            log.info("Clearing {} existing teams for game {}", existingTeams.size(), gameId);
            teamRepository.deleteAll(existingTeams);
        }
    }

    private List<Team> createEmptyTeams(Game game, int teamCount) {
        List<Team> teams = new ArrayList<>();
        
        for (int i = 1; i <= teamCount; i++) {
            Team team = Team.builder()
                    .game(game)
                    .teamName("Team " + i)
                    .teamColor(TEAM_COLORS.get((i - 1) % TEAM_COLORS.size()))
                    .teamNumber(i)
                    .formationStrategy(Team.FormationStrategy.SKILL_BALANCED)
                    .status(Team.TeamStatus.FORMING)
                    .build();
            
            teams.add(teamRepository.save(team));
        }
        
        return teams;
    }

    private void balanceTeamsBySkill(List<Team> teams, List<User> participants, GameTemplate template) {
        // Sort participants by skill level (highest first)
        List<User> sortedParticipants = participants.stream()
                .sorted((a, b) -> compareSkillLevels(b.getSkillLevel(), a.getSkillLevel()))
                .collect(Collectors.toList());
        
        // Snake draft allocation
        int teamIndex = 0;
        int direction = 1;
        
        for (User participant : sortedParticipants) {
            Team team = teams.get(teamIndex);
            
            // Create team member
            TeamMember member = TeamMember.builder()
                    .team(team)
                    .user(participant)
                    .memberType(TeamMember.MemberType.ACTIVE)
                    .isSubstitute(false)
                    .assignmentReason("SKILL_BALANCE")
                    .paymentStatus(TeamMember.PaymentStatus.PENDING)
                    .build();
            
            teamMemberRepository.save(member);
            team.addMember(member);
            
            // Move to next team with snake pattern
            teamIndex += direction;
            if (teamIndex >= teams.size() || teamIndex < 0) {
                direction *= -1;
                teamIndex = Math.max(0, Math.min(teams.size() - 1, teamIndex));
            }
        }
        
        // Update team statistics
        teams.forEach(this::updateTeamStatistics);
    }

    private void assignPlayersRandomly(List<Team> teams, List<User> participants) {
        Collections.shuffle(participants);
        
        int teamIndex = 0;
        for (User participant : participants) {
            Team team = teams.get(teamIndex % teams.size());
            
            TeamMember member = TeamMember.builder()
                    .team(team)
                    .user(participant)
                    .memberType(TeamMember.MemberType.ACTIVE)
                    .isSubstitute(false)
                    .assignmentReason("RANDOM")
                    .paymentStatus(TeamMember.PaymentStatus.PENDING)
                    .build();
            
            teamMemberRepository.save(member);
            team.addMember(member);
            teamIndex++;
        }
        
        teams.forEach(this::updateTeamStatistics);
    }

    private void assignKeepingFriendGroups(List<Team> teams, List<User> participants) {
        // TODO: Implement friend group logic when social features are added
        // For now, fall back to skill balancing
        balanceTeamsBySkill(teams, participants, null);
    }

    private void assignCaptains(List<Team> teams) {
        for (Team team : teams) {
            // Find highest skill player on team
            Optional<TeamMember> captain = team.getMembers().stream()
                    .max(Comparator.comparing(m -> getSkillLevelNumeric(m.getUser().getSkillLevel())));
            
            if (captain.isPresent()) {
                team.setCaptain(captain.get().getUser());
                captain.get().setMemberType(TeamMember.MemberType.CAPTAIN);
                teamMemberRepository.save(captain.get());
                log.info("Assigned captain {} to team {}", 
                         captain.get().getUser().getUsername(), team.getTeamName());
            }
        }
        
        teamRepository.saveAll(teams);
    }

    private void updateTeamReadiness(List<Team> teams, GameTemplate template) {
        for (Team team : teams) {
            if (team.isReadyToPlay()) {
                team.setStatus(Team.TeamStatus.READY);
            }
        }
        teamRepository.saveAll(teams);
    }

    private void updateTeamStatistics(Team team) {
        // This would be handled by the database trigger, but we can also do it in code
        List<TeamMember> activeMembers = team.getMembers().stream()
                .filter(m -> !m.isSubstitute())
                .collect(Collectors.toList());
        
        if (!activeMembers.isEmpty()) {
            double avgSkill = activeMembers.stream()
                    .mapToDouble(m -> getSkillLevelNumeric(m.getUser().getSkillLevel()))
                    .average()
                    .orElse(2.0);
            
            team.setAverageSkillLevel(Math.round(avgSkill * 100.0) / 100.0);
            team.setActivePlayersCount(activeMembers.size());
            team.setSubstitutePlayersCount((int) team.getMembers().stream()
                    .filter(TeamMember::isSubstitute).count());
        }
        
        teamRepository.save(team);
    }

    private int compareSkillLevels(SkillLevel a, SkillLevel b) {
        return Integer.compare(getSkillLevelNumeric(a), getSkillLevelNumeric(b));
    }

    private int getSkillLevelNumeric(SkillLevel skillLevel) {
        if (skillLevel == null) return 2;
        
        return switch (skillLevel) {
            case BEGINNER -> 1;
            case INTERMEDIATE -> 2;
            case ADVANCED -> 3;
            case PRO -> 4;
        };
    }

    // Data classes for team formation results
    
    public static class TeamBalance {
        private final boolean isBalanced;
        private final double skillVariance;
        private final int playerCountVariance;
        private final List<String> issues;
        
        public TeamBalance(boolean isBalanced, double skillVariance, 
                          int playerCountVariance, List<String> issues) {
            this.isBalanced = isBalanced;
            this.skillVariance = skillVariance;
            this.playerCountVariance = playerCountVariance;
            this.issues = issues;
        }
        
        // Getters
        public boolean isBalanced() { return isBalanced; }
        public double getSkillVariance() { return skillVariance; }
        public int getPlayerCountVariance() { return playerCountVariance; }
        public List<String> getIssues() { return issues; }
    }

    public static class TeamStats {
        private final Long teamId;
        private final String teamName;
        private final int playerCount;
        private final double averageSkillLevel;
        private final String captainName;
        private final boolean isReady;
        
        public TeamStats(Long teamId, String teamName, int playerCount, 
                        double averageSkillLevel, String captainName, boolean isReady) {
            this.teamId = teamId;
            this.teamName = teamName;
            this.playerCount = playerCount;
            this.averageSkillLevel = averageSkillLevel;
            this.captainName = captainName;
            this.isReady = isReady;
        }
        
        // Getters
        public Long getTeamId() { return teamId; }
        public String getTeamName() { return teamName; }
        public int getPlayerCount() { return playerCount; }
        public double getAverageSkillLevel() { return averageSkillLevel; }
        public String getCaptainName() { return captainName; }
        public boolean isReady() { return isReady; }
    }
}