package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.GameSummaryDTO;
import com.bmessi.pickupsportsapp.dto.UpdateGameRequest;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.NotificationService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.XaiRecommendationService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.security.Principal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * REST Controller for game management operations.
 * Provides endpoints for CRUD operations, RSVP management, search, and chat functionality.
 */
@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@Validated
public class GameController {

    // Constants
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_NEARBY_RADIUS_KM = 5;
    private static final String CACHE_CONTROL_HEADER = "private, max-age=30";
    private static final String DEFAULT_RECOMMENDATION_SPORT = "Soccer";
    private static final String DEFAULT_RECOMMENDATION_LOCATION = "Park A";

    // Dependencies
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final XaiRecommendationService xaiRecommendationService;
    private final ApiMapper mapper;
    private final ChatService chatService;
    private final SportResolverService sportResolver;

    // Configuration properties
    @Value("${app.games.default-recommendation-sport:Soccer}")
    private String defaultRecommendationSport;

    @Value("${app.games.default-recommendation-location:Park A}")
    private String defaultRecommendationLocation;

    // ================================================================================
    // Chat Endpoints
    // ================================================================================

    /**
     * Retrieves chat message history for a specific game.
     */
    @GetMapping("/{gameId}/chat/history")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageDTO> getChatHistory(
            @PathVariable Long gameId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
            @RequestParam(defaultValue = "50") int limit,
            Principal principal
    ) {
        validateGameAccess(gameId, principal.getName());
        return chatService.history(gameId, before, limit);
    }

    /**
     * Retrieves latest chat messages for a specific game.
     */
    @GetMapping("/{gameId}/chat/latest")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageDTO> getLatestChatMessages(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "50") int limit,
            Principal principal
    ) {
        validateGameAccess(gameId, principal.getName());
        return chatService.latest(gameId, limit);
    }

    // ================================================================================
    // Game CRUD Endpoints
    // ================================================================================

    /**
     * Retrieves a paginated list of games with optional filtering.
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
            @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "time") Pageable pageable
    ) {
        Page<Game> page = hasAnyFilter(sport, location, fromTime, toTime, skillLevel)
                ? gameRepository.search(sport, location, fromTime, toTime, skillLevel, pageable)
                : gameRepository.findAll(pageable);
        return page.map(mapper::toGameSummaryDTO);
    }

    /**
     * Retrieves a specific game with ETag and conditional GET support.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameDetailsDTO> getGame(
            @PathVariable Long id,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch
    ) {
        return gameRepository.findWithParticipantsById(id)
                .map(game -> buildGameResponse(game, ifNoneMatch))
                .orElseGet(this::gameNotFound);
    }

    /**
     * Creates a new game.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> createGame(
            @Valid @RequestBody CreateGameRequest request,
            Principal principal
    ) {
        User owner = findAuthenticatedUser(principal);
        validateCoordinates(request.latitude(), request.longitude());

        String canonicalSport = sportResolver.resolveOrCreateCanonical(request.sport());

        Game game = buildNewGame(request, owner, canonicalSport);
        Game saved = gameRepository.save(game);

        notificationService.createGameNotification(
                owner.getUsername(),
                owner.getUsername(),
                canonicalSport,
                request.location(),
                "created"
        );

        return ResponseEntity.created(URI.create("/games/" + saved.getId()))
                .body(mapper.toGameDetailsDTO(saved));
    }

    /**
     * Updates an existing game (PUT - full update).
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> updateGame(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGameRequest request,
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            Principal principal
    ) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User currentUser = pair.user();

        enforceIfMatch(ifMatch, game.getVersion());
        validateGameOwnership(game, currentUser);

        applyUpdates(game, request);
        game.setUpdatedAt(OffsetDateTime.now());
        Game updated = gameRepository.save(game);

        notifyParticipantsOfUpdate(game, currentUser, "updated");

        String etag = toEtag(updated.getVersion());
        return ResponseEntity.ok()
                .eTag(etag)
                .body(mapper.toGameDetailsDTO(updated));
    }

    /**
     * Partially updates an existing game (PATCH).
     */
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> patchGame(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGameRequest request,
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            Principal principal
    ) {
        // PATCH and PUT have identical logic in this implementation
        return updateGame(id, request, ifMatch, principal);
    }

    /**
     * Deletes a game.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> deleteGame(@PathVariable Long id, Principal principal) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User currentUser = pair.user();

        validateGameOwnership(game, currentUser);

        // Notify all participants before deletion
        game.getParticipants().forEach(participant ->
                notificationService.createGameNotification(
                        participant.getUsername(),
                        currentUser.getUsername(),
                        game.getSport(),
                        game.getLocation(),
                        "cancelled"
                )
        );

        gameRepository.delete(game);
        return ResponseEntity.noContent().build();
    }

    // ================================================================================
    // Search and Discovery Endpoints
    // ================================================================================

    /**
     * Finds games near a specific location within a radius.
     */
    @GetMapping("/near")
    public List<GameSummaryDTO> findNearbyGames(
            @RequestParam
            @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
            @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
            double lat,
            @RequestParam
            @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
            @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
            double lon,
            @RequestParam(defaultValue = "5.0") double radiusKm
    ) {
        validateRadius(radiusKm);
        List<Game> games = gameRepository.findByLocationWithinRadius(lat, lon, radiusKm);
        return games.stream().map(mapper::toGameSummaryDTO).toList();
    }

    /**
     * Gets AI-powered game recommendations.
     */
    @GetMapping("/recommend")
    @PreAuthorize("isAuthenticated()")
    public Page<GameSummaryDTO> recommendGames(
            @RequestParam(required = false) String preferredSport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skillLevel,
            @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "time") Pageable pageable
    ) {
        String sport = getValueOrDefault(preferredSport, defaultRecommendationSport);
        String loc = getValueOrDefault(location, defaultRecommendationLocation);

        return xaiRecommendationService.getRecommendations(sport, loc, skillLevel, pageable)
                .map(mapper::toGameSummaryDTO);
    }

    // ================================================================================
    // User Game Management Endpoints
    // ================================================================================

    /**
     * Retrieves games created by the authenticated user.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public Page<GameDetailsDTO> getMyGames(
            @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "time") Pageable pageable,
            Principal principal
    ) {
        User user = findAuthenticatedUser(principal);
        return gameRepository.findByUserIdWithParticipants(user.getId(), pageable)
                .map(mapper::toGameDetailsDTO);
    }

    /**
     * RSVP to a game.
     */
    @PostMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> rsvpToGame(@PathVariable Long id, Principal principal) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User user = pair.user();

        boolean alreadyParticipating = gameRepository.existsParticipant(game.getId(), user.getId());
        if (!alreadyParticipating) {
            game.addParticipant(user);
            gameRepository.save(game);

            notifyGameCreatorOfParticipation(game, user, "joined");
        }

        return ResponseEntity.ok(mapper.toGameDetailsDTO(game));
    }

    /**
     * Cancel RSVP to a game.
     */
    @DeleteMapping("/{id}/unrsvp")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> unrsvpFromGame(@PathVariable Long id, Principal principal) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User user = pair.user();

        boolean wasParticipating = gameRepository.existsParticipant(game.getId(), user.getId());
        if (!wasParticipating) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You are not a participant of this game");
        }

        game.removeParticipant(user);
        gameRepository.save(game);

        notifyGameCreatorOfParticipation(game, user, "left");

        return ResponseEntity.ok(mapper.toGameDetailsDTO(game));
    }

    // ================================================================================
    // Private Helper Methods
    // ================================================================================

    /**
     * Validates that a user has access to a game's chat.
     */
    private void validateGameAccess(Long gameId, String username) {
        boolean hasAccess = gameRepository.findWithParticipantsById(gameId)
                .map(game -> isGameCreator(game, username) || isGameParticipant(game, username))
                .orElse(false);

        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access denied to this game's chat");
        }
    }

    /**
     * Validates and retrieves user and game entities.
     */
    private UserGamePair validateUserAndGame(Long gameId, Principal principal) {
        User user = findAuthenticatedUser(principal);
        Game game = gameRepository.findWithParticipantsById(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));
        return new UserGamePair(user, game);
    }

    /**
     * Finds authenticated user or throws exception.
     */
    private User findAuthenticatedUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return user;
    }

    /**
     * Validates that coordinates are provided together.
     */
    private void validateCoordinates(Double latitude, Double longitude) {
        if ((latitude != null) ^ (longitude != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "latitude and longitude must be provided together");
        }
    }

    /**
     * Validates radius parameter.
     */
    private void validateRadius(double radiusKm) {
        if (radiusKm <= 0 || radiusKm > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Radius must be between 0 and 1000 km");
        }
    }

    /**
     * Validates that current user owns the game.
     */
    private void validateGameOwnership(Game game, User currentUser) {
        if (!game.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only game creator can modify the game");
        }
    }

    /**
     * Checks if any filter parameter is present.
     */
    private boolean hasAnyFilter(String sport, String location, OffsetDateTime fromTime,
                                 OffsetDateTime toTime, String skillLevel) {
        return sport != null || location != null || fromTime != null ||
                toTime != null || skillLevel != null;
    }

    /**
     * Builds the response for a game request with ETag support.
     */
    private ResponseEntity<GameDetailsDTO> buildGameResponse(Game game, String ifNoneMatch) {
        GameDetailsDTO dto = mapper.toGameDetailsDTO(game);
        String etag = toEtag(game.getVersion());

        if (ifNoneMatch != null && !ifNoneMatch.isBlank()) {
            String norm = normalizeIfMatch(ifNoneMatch);
            String current = String.valueOf(game.getVersion() == null ? 0L : game.getVersion());
            if (current.equals(norm)) {
                return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
                        .eTag(etag)
                        .header("Cache-Control", CACHE_CONTROL_HEADER)
                        .header("Last-Modified", httpDate(lastModifiedEpochMilli(game)))
                        .build();
            }
        }

        return ResponseEntity.ok()
                .eTag(etag)
                .header("Cache-Control", CACHE_CONTROL_HEADER)
                .header("Last-Modified", httpDate(lastModifiedEpochMilli(game)))
                .body(dto);
    }

    /**
     * Builds a new game entity from request.
     */
    private Game buildNewGame(CreateGameRequest request, User owner, String canonicalSport) {
        return Game.builder()
                .sport(canonicalSport)
                .location(request.location())
                .time(request.time().toInstant())
                .skillLevel(request.skillLevel())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .user(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    /**
     * Applies updates from request to game entity.
     */
    private void applyUpdates(Game game, UpdateGameRequest request) {
        if (request.sport() != null) {
            String raw = request.sport().trim();
            if (raw.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "sport must not be blank when provided");
            }
            game.setSport(sportResolver.resolveOrCreateCanonical(raw));
        }

        if (request.location() != null) {
            String raw = request.location().trim();
            if (raw.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "location must not be blank when provided");
            }
            game.setLocation(raw);
        }

        if (request.time() != null) {
            game.setTime(request.time().toInstant());
        }

        if (request.skillLevel() != null) {
            String s = request.skillLevel().trim();
            game.setSkillLevel(s.isEmpty() ? null : s);
        }

        // Handle coordinates
        validateCoordinates(request.latitude(), request.longitude());
        if (request.latitude() != null && request.longitude() != null) {
            game.setLatitude(request.latitude());
            game.setLongitude(request.longitude());
        }
    }

    /**
     * Notifies game participants about updates.
     */
    private void notifyParticipantsOfUpdate(Game game, User currentUser, String action) {
        game.getParticipants().forEach(participant -> {
            if (!participant.getId().equals(currentUser.getId())) {
                notificationService.createGameNotification(
                        participant.getUsername(),
                        currentUser.getUsername(),
                        game.getSport(),
                        game.getLocation(),
                        action
                );
            }
        });
    }

    /**
     * Notifies game creator about participation changes.
     */
    private void notifyGameCreatorOfParticipation(Game game, User participant, String action) {
        User creator = game.getUser();
        if (creator != null && !creator.getId().equals(participant.getId())) {
            notificationService.createGameNotification(
                    creator.getUsername(),
                    participant.getUsername(),
                    game.getSport(),
                    game.getLocation(),
                    action
            );
        }
    }

    /**
     * Checks if user is the game creator.
     */
    private boolean isGameCreator(Game game, String username) {
        return game.getUser() != null && username.equals(game.getUser().getUsername());
    }

    /**
     * Checks if user is a game participant.
     */
    private boolean isGameParticipant(Game game, String username) {
        return game.getParticipants().stream()
                .anyMatch(p -> username.equals(p.getUsername()));
    }

    /**
     * Returns value or default if value is null/blank.
     */
    private String getValueOrDefault(String value, String defaultValue) {
        return (value != null && !value.isBlank()) ? value : defaultValue;
    }

    /**
     * Returns not found response.
     */
    private ResponseEntity<GameDetailsDTO> gameNotFound() {
        return ResponseEntity.notFound().build();
    }

    /**
     * Generates ETag from version.
     */
    private static String toEtag(Long version) {
        long v = (version == null ? 0L : version);
        return "W/\"" + v + "\"";
    }

    /**
     * Enforces If-Match header for optimistic locking.
     */
    private static void enforceIfMatch(String ifMatchHeader, Long currentVersion) {
        if (ifMatchHeader == null || ifMatchHeader.isBlank()) {
            return; // Optional in this implementation
        }
        String norm = normalizeIfMatch(ifMatchHeader);
        String current = String.valueOf(currentVersion == null ? 0L : currentVersion);
        if (!current.equals(norm)) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,
                    "ETag mismatch; resource changed");
        }
    }

    /**
     * Normalizes If-Match header value.
     */
    private static String normalizeIfMatch(String raw) {
        String s = raw.trim();
        if (s.startsWith("W/")) s = s.substring(2).trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s;
    }

    /**
     * Gets last modified timestamp in epoch milliseconds.
     */
    private static long lastModifiedEpochMilli(Game g) {
        if (g.getUpdatedAt() != null) return g.getUpdatedAt().toInstant().toEpochMilli();
        if (g.getCreatedAt() != null) return g.getCreatedAt().toInstant().toEpochMilli();
        return System.currentTimeMillis();
    }

    /**
     * Formats epoch milliseconds as HTTP date.
     */
    private static String httpDate(long epochMillis) {
        java.time.format.DateTimeFormatter fmt =
                java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                        .withZone(java.time.ZoneOffset.UTC);
        return fmt.format(java.time.Instant.ofEpochMilli(epochMillis));
    }

    /**
     * Helper record for user-game pair validation.
     */
    private record UserGamePair(User user, Game game) {}
}