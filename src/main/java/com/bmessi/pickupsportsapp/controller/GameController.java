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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.format.annotation.DateTimeFormat;

import java.net.URI;
import java.security.Principal;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final XaiRecommendationService xaiRecommendationService;
    private final ApiMapper mapper;

    @GetMapping
    public Page<GameSummaryDTO> getGames(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            @RequestParam(required = false) String skillLevel,
            @PageableDefault(size = 10, sort = "time") Pageable pageable
    ) {
        Page<Game> page = (sport == null && location == null && fromTime == null && toTime == null && skillLevel == null)
                ? gameRepository.findAll(pageable)
                : gameRepository.search(sport, location, fromTime, toTime, skillLevel, pageable);
        return page.map(mapper::toGameSummaryDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDetailsDTO> getGame(@PathVariable Long id) {
        return gameRepository.findWithParticipantsById(id)
                .map(mapper::toGameDetailsDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameDetailsDTO> createGame(@Valid @RequestBody CreateGameRequest request, Principal principal) {
        User owner = userRepository.findByUsername(principal.getName());
        if (owner == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        Game game = Game.builder()
                .sport(request.sport())
                .location(request.location())
                .time(request.time())
                .skillLevel(request.skillLevel())
                .user(owner)
                .build();
        Game saved = gameRepository.save(game);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("/games/" + saved.getId()));
        return new ResponseEntity<>(mapper.toGameDetailsDTO(saved), headers, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Page<GameDetailsDTO> getMyGames(@PageableDefault(size = 10, sort = "time") Pageable pageable, Principal principal) {
        User me = userRepository.findByUsername(principal.getName());
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return gameRepository.findByUser_Id(me.getId(), pageable)
                .map(mapper::toGameDetailsDTO);
    }

    @PostMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
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
                notificationService.createGameNotification(creator.getUsername(), me.getUsername(), game.getSport(), game.getLocation(), "joined");
            }
            game.getParticipants().forEach(p -> {
                if (!p.getId().equals(me.getId()) && (creator == null || !p.getId().equals(creator.getId()))) {
                    notificationService.createGameNotification(p.getUsername(), me.getUsername(), game.getSport(), game.getLocation(), "joined");
                }
            });
        }
        return ResponseEntity.ok(mapper.toGameDetailsDTO(game));
    }

    @DeleteMapping("/{id}/unrsvp")
    @PreAuthorize("isAuthenticated()")
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
            notificationService.createGameNotification(creator.getUsername(), me.getUsername(), game.getSport(), game.getLocation(), "left");
        }
        game.getParticipants().forEach(p -> {
            if (creator == null || !p.getId().equals(creator.getId())) {
                notificationService.createGameNotification(p.getUsername(), me.getUsername(), game.getSport(), game.getLocation(), "left");
            }
        });

        return ResponseEntity.ok(mapper.toGameDetailsDTO(game));
    }

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
        return xaiRecommendationService.getRecommendations(sport, loc, skill, pageable).map(mapper::toGameSummaryDTO);
    }
}