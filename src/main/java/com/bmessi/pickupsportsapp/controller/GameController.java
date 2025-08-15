package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.NotificationService;
import com.bmessi.pickupsportsapp.service.XaiRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class GameController {

    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private XaiRecommendationService xaiRecommendationService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/games")
    public Page<Game> getGames(@RequestParam(required = false) String sport,
                               @PageableDefault(size = 10, sort = "time") Pageable pageable) {
        if (sport != null) {
            return gameRepository.findBySport(sport, pageable);
        }
        return gameRepository.findAll(pageable);
    }

    @PostMapping("/games")
    @PreAuthorize("isAuthenticated()")
    public Game createGame(@RequestBody Game game) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        game.setUser(user);
        return gameRepository.save(game);
    }

    @GetMapping("/recommend-games")
    @PreAuthorize("isAuthenticated()")
    public Page<Game> recommendGames(@RequestParam(required = false) String preferredSport,
                                     @RequestParam(required = false) String location,
                                     @PageableDefault(size = 10, sort = "time") Pageable pageable) {
        String userPreferredSport = preferredSport != null && !preferredSport.isBlank() ? preferredSport : "Soccer";
        String userLocation = location != null && !location.isBlank() ? location : "Park A";
        return xaiRecommendationService.getRecommendations(userPreferredSport, userLocation, pageable);
    }

    @GetMapping("/games/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<GameResponse>> getMyGames(@PageableDefault(size = 5, sort = "time") Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        Page<Game> gamePage = gameRepository.findByUserId(user.getId(), pageable);
        Page<GameResponse> responsePage = gamePage.map(game -> new GameResponse(
                game.getId(),
                game.getSport(),
                game.getLocation(),
                game.getTime(),
                mapParticipants(game.getParticipants())
        ));
        return ResponseEntity.ok(responsePage);
    }

    @PostMapping("/games/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameResponse> rsvpToGame(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Optional<Game> gameOpt = gameRepository.findById(id);
        if (gameOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Game game = gameOpt.get();
        System.out.println("RSVP attempt for game " + id + ", user: " + username + ", participants: " + game.getParticipants());
        if (!game.getParticipants().contains(user)) {
            game.getParticipants().add(user);
            gameRepository.save(game);
            System.out.println("User added to participants, notifying others for game " + id);
            // Notify creator
            User creator = game.getUser();
            if (creator != null && !creator.getUsername().equals(username)) {
                notificationService.createGameNotification(creator.getUsername(), username, game.getSport(), game.getLocation(), "joined");
            }
            // Notify existing participants
            game.getParticipants().forEach(participant -> {
                if (participant != null && !participant.getUsername().equals(username) && !participant.equals(creator)) {
                    notificationService.createGameNotification(participant.getUsername(), username, game.getSport(), game.getLocation(), "joined");
                }
            });
        }
        GameResponse response = new GameResponse(
                game.getId(),
                game.getSport(),
                game.getLocation(),
                game.getTime(),
                mapParticipants(game.getParticipants())
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/games/{id}/unrsvp")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameResponse> unrsvpFromGame(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Optional<Game> gameOpt = gameRepository.findById(id);
        if (gameOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Game game = gameOpt.get();
        System.out.println("Un-RSVP attempt for game " + id + ", user: " + username + ", participants: " + game.getParticipants());
        if (!game.getParticipants().contains(user)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        game.getParticipants().remove(user);
        gameRepository.save(game);
        System.out.println("User removed from participants, notifying others for game " + id);
        // Notify creator
        User creator = game.getUser();
        if (creator != null && !creator.getUsername().equals(username)) {
            notificationService.createGameNotification(creator.getUsername(), username, game.getSport(), game.getLocation(), "left");
        }
        // Notify remaining participants
        game.getParticipants().forEach(participant -> {
            if (participant != null && !participant.getUsername().equals(creator.getUsername())) {
                notificationService.createGameNotification(participant.getUsername(), username, game.getSport(), game.getLocation(), "left");
            }
        });
        GameResponse response = new GameResponse(
                game.getId(),
                game.getSport(),
                game.getLocation(),
                game.getTime(),
                mapParticipants(game.getParticipants())
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntry> getLeaderboard() {
        List<Game> allGames = gameRepository.findAll();
        Map<String, Long> rsvpCounts = allGames.stream()
                .flatMap(game -> game.getParticipants().stream())
                .map(User::getUsername)
                .collect(Collectors.groupingBy(
                        username -> username,
                        Collectors.counting()
                ));
        return rsvpCounts.entrySet().stream()
                .map(entry -> new LeaderboardEntry(entry.getKey(), entry.getValue()))
                .sorted((e1, e2) -> e2.rsvpCount().compareTo(e1.rsvpCount()))
                .collect(Collectors.toList());
    }

    private List<UserDTO> mapParticipants(List<User> users) {
        return users.stream()
                .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getPreferredSport(), u.getLocation()))
                .collect(Collectors.toList());
    }

    public record GameResponse(Long id, String sport, String location, String time, List<UserDTO> participants) {}

    public record UserDTO(Long id, String username, String preferredSport, String location) {}

    public record LeaderboardEntry(String username, Long rsvpCount) {}
}