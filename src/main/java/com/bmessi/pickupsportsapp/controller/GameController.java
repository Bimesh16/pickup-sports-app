package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.NotificationService;
import com.bmessi.pickupsportsapp.service.XaiRecommendationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ApiMapper mapper;

    // Optional dependency
    private final @Nullable XaiRecommendationService xaiRecommendationService;

    public GameController(
            GameRepository gameRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ApiMapper mapper,
            ObjectProvider<XaiRecommendationService> xaiRecommendationServiceProvider
    ) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
        this.xaiRecommendationService = xaiRecommendationServiceProvider.getIfAvailable();
    }

    /**
     * List games with optional filters (sport, location, time range, skill).
     */
    @GetMapping
    public Page<GameSummaryDTO> getGames(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            @RequestParam(required = false) String skillLevel,
            @PageableDefault(size = 10, sort = "time") Pageable pageable
    ) {
        Page<Game> page = (sport == null && location == null && fromTime == null && toTime == null && skillLevel == null)
                ? gameRepository.findAll(pageable)
                : gameRepository.search(sport, location, fromTime, toTime, skillLevel, pageable);
        return page.map(mapper::toGameSummaryDTO);
    }

    /**
     * Retrieve a single game by ID with participants and creator loaded.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameDetailsDTO> getGame(@PathVariable Long id) {
        return gameRepository.findWithParticipantsById(id)
                .map(mapper::toGameDetailsDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new game.  Requires authentication.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameDetailsDTO> createGame(
            @Valid @RequestBody CreateGameRequest request,
            Principal principal
    ) {
        User owner = userRepository.findByUsername(principal.getName());
        if (owner == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        Game game = Game.builder()
                .sport(request.sport())
                .location(request.location())
                .time(request.time().toInstant())
                .skillLevel(request.skillLevel())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .user(owner)
                .build();
        Game saved = gameRepository.save(game);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("/games/" + saved.getId()));
        return new ResponseEntity<>(mapper.toGameDetailsDTO(saved), headers, HttpStatus.CREATED);
    }

    /**
     * Find games near a given coordinate (in kilometers).  Public endpoint.
     */
    @GetMapping("/near")
    public List<GameSummaryDTO> findNearbyGames(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5.0") double radiusKm
    ) {
        var games = gameRepository.findByLocationWithinRadius(lat, lon, radiusKm);
        return games.stream().map(mapper::toGameSummaryDTO).toList();
    }

    /**
     * Get games created by the current user.  Eagerly loads participants.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public Page<GameDetailsDTO> getMyGames(
            @PageableDefault(size = 10, sort = "time") Pageable pageable,
            Principal principal
    ) {
        User me = userRepository.findByUsername(principal.getName());
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return gameRepository.findByUserIdWithParticipants(me.getId(), pageable)
                .map(mapper::toGameDetailsDTO);
    }

    /**
     * RSVP to a game.
     */
    @PostMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> rsvpToGame(@PathVariable Long id, Principal principal) {
        User me = userRepository.findByUsername(principal.getName());
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        Game game = gameRepository.findWithParticipantsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));

        boolean already = gameRepository.existsParticipant(game.getId(), me.getId());
        if (!already) {
            game.addParticipant(me);
            gameRepository.save(game);

            User creator = game.getUser();
            if (creator != null && !creator.getId().equals(me.getId())) {
                notificationService.createGameNotification(
                        creator.getUsername(),
                        me.getUsername(),
                        game.getSport(),
                        game.getLocation(),
                        "joined"
                );
            }
            game.getParticipants().forEach(p -> {
                if (!p.getId().equals(me.getId()) && (creator == null || !p.getId().equals(creator.getId()))) {
                    notificationService.createGameNotification(
                            p.getUsername(),
                            me.getUsername(),
                            game.getSport(),
                            game.getLocation(),
                            "joined"
                    );
                }
            });
        }
        return ResponseEntity.ok(mapper.toGameDetailsDTO(game));
    }

    /**
     * Un-RSVP from a game.
     */
    @DeleteMapping("/{id}/unrsvp")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> unrsvpFromGame(@PathVariable Long id, Principal principal) {
        User me = userRepository.findByUsername(principal.getName());
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        Game game = gameRepository.findWithParticipantsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));

        boolean existed = gameRepository.existsParticipant(game.getId(), me.getId());
        if (!existed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are not a participant of this game");
        }
        game.removeParticipant(me);
        gameRepository.save(game);

        User creator = game.getUser();
        if (creator != null && !creator.getId().equals(me.getId())) {
            notificationService.createGameNotification(
                    creator.getUsername(),
                    me.getUsername(),
                    game.getSport(),
                    game.getLocation(),
                    "left"
            );
        }
        game.getParticipants().forEach(p -> {
            if (creator == null || !p.getId().equals(creator.getId())) {
                notificationService.createGameNotification(
                        p.getUsername(),
                        me.getUsername(),
                        game.getSport(),
                        game.getLocation(),
                        "left"
                );
            }
        });
        return ResponseEntity.ok(mapper.toGameDetailsDTO(game));
    }

    /**
     * Get AI-powered game recommendations.
     * Falls back to a plain list if XaiRecommendationService isn’t available.
     */
    @GetMapping("/recommend")
    @PreAuthorize("isAuthenticated()")
    public Page<GameSummaryDTO> recommendGames(
            @RequestParam(required = false) String preferredSport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skillLevel,
            @PageableDefault(size = 10, sort = "time") Pageable pageable
    ) {
        String sport = (preferredSport != null && !preferredSport.isBlank()) ? preferredSport : "Soccer";
        String loc = (location != null && !location.isBlank()) ? location : "Park A";
        String skill = (skillLevel != null && !skillLevel.isBlank()) ? skillLevel : null;

        if (xaiRecommendationService != null) {
            return xaiRecommendationService.getRecommendations(sport, loc, skill, pageable)
                    .map(mapper::toGameSummaryDTO);
        }

        // Fallback: basic search or list-all if you want something even simpler
        Page<Game> page = gameRepository.search(sport, loc, null, null, skill, pageable);
        return page.map(mapper::toGameSummaryDTO);
    }
}
