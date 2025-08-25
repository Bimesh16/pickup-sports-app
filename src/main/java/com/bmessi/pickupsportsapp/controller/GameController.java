package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.GameSummaryDTO;
import com.bmessi.pickupsportsapp.dto.UpdateGameRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.NotificationService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;

import java.net.URI;
import java.security.Principal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

/**
 * REST Controller for game management operations.
 * Provides endpoints for CRUD operations, RSVP management, search, and chat functionality.
 */
@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@Validated
@Tag(name = "Games")
public class GameController {

    // Constants
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final int DEFAULT_NEARBY_RADIUS_KM = 5;
    private static final String CACHE_CONTROL_HEADER = "private, max-age=30";
    private static final String DEFAULT_RECOMMENDATION_SPORT = "Soccer";
    private static final String DEFAULT_RECOMMENDATION_LOCATION = "Park A";
    private static final Set<String> ALLOWED_SKILL_LEVELS = Set.of("Beginner", "Intermediate", "Advanced", "Pro");

    // Dependencies
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AiRecommendationResilientService xaiRecommendationService;
    private final ApiMapper mapper;
    private final ChatService chatService;
    private final SportResolverService sportResolver;
    private final com.bmessi.pickupsportsapp.service.IdempotencyService idempotencyService;
    private final com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService gameAccessService;
    private final java.util.Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter;

    // Configuration properties
    @Value("${app.games.default-recommendation-sport:Soccer}")
    private String defaultRecommendationSport;

    @Value("${app.games.default-recommendation-location:Park A}")
    private String defaultRecommendationLocation;

    // Enforce preconditions for PUT/PATCH/DELETE; can be relaxed in non-prod
    @Value("${app.http.allow-unsafe-write:false}")
    private boolean allowUnsafeWrite;


    // ================================================================================
    // Chat Endpoints
    // ================================================================================

    /**
     * Retrieves chat message history for a specific game.
     */
    @Operation(summary = "Retrieve chat message history for a specific game")
    @GetMapping("/{gameId}/chat/history")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageDTO> getChatHistory(
            @Parameter(description = "ID of the game") @PathVariable Long gameId,
            @Parameter(description = "Return messages before this timestamp")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
            @Parameter(description = "Maximum number of messages to return")
            @RequestParam(defaultValue = "50") int limit,
            @Parameter(hidden = true) Principal principal
    ) {
        validateGameAccess(gameId, principal.getName());
        return chatService.history(gameId, before, limit);
    }

    // ================================================================================
    // Game CRUD Endpoints
    // ================================================================================

    /**
     * Retrieves a paginated list of games with optional filtering.
     */
    @Operation(summary = "Retrieve games with optional filters")
    @GetMapping
    public ResponseEntity<Page<GameSummaryDTO>> getGames(
            @Parameter(description = "Filter by sport")
            @RequestParam(required = false) String sport,
            @Parameter(description = "Filter by location")
            @RequestParam(required = false) String location,
            @Parameter(description = "Start of time range")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            @Parameter(description = "End of time range")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            @Parameter(description = "Filter by skill level")
            @RequestParam(required = false) String skillLevel,
            @Parameter(description = "Latitude for geo search")
            @RequestParam(required = false) Double lat,
            @Parameter(description = "Longitude for geo search")
            @RequestParam(required = false) Double lon,
            @Parameter(description = "Radius in kilometers for geo search")
            @RequestParam(required = false) Double radiusKm,
            @Parameter(description = "Pagination information")
            @ParameterObject @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "time") Pageable pageable,
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(hidden = true)
            @RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSinceList
    ) {
        Pageable effective = sanitizePageable(pageable);
        String normalizedSkill = canonicalizeSkill(skillLevel);
        String nsport = normalizeFilter(sport);
        String nloc = normalizeFilter(location);
        validateTimeRange(fromTime, toTime);
        validateGeoParams(lat, lon, radiusKm);

        // Branch: geo-filtered list using PostGIS
        if (lat != null && lon != null && radiusKm != null) {
            validateRadius(radiusKm);
            Page<Game> page = gameRepository.findByLocationWithinRadius(
                    nsport,
                    nloc,
                    fromTime,
                    toTime,
                    normalizedSkill,
                    lat,
                    lon,
                    radiusKm,
                    effective
            );

            Page<GameSummaryDTO> body = page.map(mapper::toGameSummaryDTO);

            long lastMod = page.getContent().stream()
                    .mapToLong(GameController::lastModifiedEpochMilli)
                    .max()
                    .orElse(System.currentTimeMillis());

            HttpHeaders headers = new HttpHeaders();
            addPaginationLinks(request, headers, page);
            headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
            headers.add("Cache-Control", CACHE_CONTROL_HEADER);
            headers.add("Last-Modified", httpDate(lastMod));

            Long clientMillis = parseIfModifiedSince(ifModifiedSinceList);
            if (clientMillis != null && lastMod <= clientMillis) {
                return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
            }

            return ResponseEntity.ok().headers(headers).body(body);
        }

        // Default DB-backed paging
        Page<Game> page = hasAnyFilter(nsport, nloc, fromTime, toTime, normalizedSkill)
                ? gameRepository.search(nsport, nloc, fromTime, toTime, normalizedSkill, effective)
                : gameRepository.findAll(effective);

        Page<GameSummaryDTO> body = page.map(mapper::toGameSummaryDTO);

        long lastMod = page.getContent().stream()
                .mapToLong(GameController::lastModifiedEpochMilli)
                .max()
                .orElse(System.currentTimeMillis());

        HttpHeaders headers = new HttpHeaders();
        addPaginationLinks(request, headers, page);
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add("Cache-Control", CACHE_CONTROL_HEADER);
        headers.add("Last-Modified", httpDate(lastMod));

        Long clientMillis = parseIfModifiedSince(ifModifiedSinceList);
        if (clientMillis != null && lastMod <= clientMillis) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }

        return ResponseEntity.ok().headers(headers).body(body);
    }

    /**
     * Retrieves a specific game with ETag and conditional GET support.
     */
    @Operation(summary = "Retrieve detailed information for a game")
    @GetMapping("/{id}")
    public ResponseEntity<GameDetailsDTO> getGame(
            @Parameter(description = "Game identifier") @PathVariable Long id,
            @Parameter(description = "ETag for conditional requests")
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch,
            @Parameter(description = "Last known modification time")
            @RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSince
    ) {
        return gameRepository.findWithParticipantsById(id)
                .map(game -> buildGameResponse(game, ifNoneMatch, ifModifiedSince))
                .orElseGet(this::gameNotFound);
    }

    /**
     * Retrieves participants for a game as a compact list.
     * Adds ETag/Cache-Control/Last-Modified headers derived from the game entity.
     */
    @Operation(summary = "Retrieve participants for a game")
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<UserDTO>> getParticipants(@Parameter(description = "Game identifier") @PathVariable Long id) {
        var opt = gameRepository.findWithParticipantsById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Game game = opt.get();

        // Map participants to DTOs and sort by username for stable output
        List<UserDTO> users = game.getParticipants().stream()
                .sorted(java.util.Comparator.comparing(User::getUsername, java.util.Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(mapper::toUserDTO)
                .toList();

        String etag = toEtag(game.getVersion());
        long lastMod = lastModifiedEpochMilli(game);

        return ResponseEntity.ok()
                .eTag(etag)
                .header("Cache-Control", CACHE_CONTROL_HEADER)
                .header("Last-Modified", httpDate(lastMod))
                .body(users);
    }

    /**
     * HEAD for a specific game: returns ETag and Last-Modified without a body.
     * Supports 200/304/404 like GET, but with no payload.
     */
    @RequestMapping(path = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> headGame(
            @PathVariable Long id,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch,
            @RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSince
    ) {
        var opt = gameRepository.findWithParticipantsById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var game = opt.get();
        ResponseEntity<GameDetailsDTO> full = buildGameResponse(game, ifNoneMatch, ifModifiedSince);
        return ResponseEntity.status(full.getStatusCodeValue())
                .headers(full.getHeaders())
                .build();
    }

    /**
     * Creates a new game.
     */
    @Operation(summary = "Create a new game")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "games")
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(cacheNames = {"explore-first", "sports-list", "nearby-games"}, allEntries = true)
    public ResponseEntity<GameDetailsDTO> createGame(
            @Valid @RequestBody
            @RequestBody(description = "Details for the game to create") CreateGameRequest request,
            @Parameter(description = "Idempotency key to prevent duplicate submissions")
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Parameter(description = "Header specifying response preference")
            @RequestHeader(value = "Prefer", required = false) String prefer,
            @Parameter(hidden = true) Principal principal
    ) {
        User owner = findAuthenticatedUser(principal);
        try {
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow("games:create:" + owner.getUsername(), 5, 60)) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please try again later");
            }
        } catch (Exception ignore) {}
        validateCoordinates(request.latitude(), request.longitude());
        validateGameTime(request.time());

        // If client provided an idempotency key, return the previous result if exists
        String idem = (idempotencyKey == null || idempotencyKey.isBlank()) ? null : idempotencyKey.trim();
        if (idem != null && idem.length() > 128) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Idempotency-Key too long");
        }
        if (idem != null) {
            var existingId = idempotencyService.get(owner.getUsername(), idem);
            if (existingId.isPresent()) {
                Long gameId = existingId.get();
                Game existing = gameRepository.findById(gameId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.GONE, "Resource expired"));
                GameDetailsDTO dto = mapper.toGameDetailsDTO(existing);
                // Honor Prefer: return=minimal on replay
                if (prefer != null && prefer.toLowerCase().contains("return=minimal")) {
                    return ResponseEntity.ok()
                            .header("Preference-Applied", "return=minimal")
                            .build();
                }
                // Subsequent replay returns 200 OK with the canonical resource
                return ResponseEntity.ok(dto);
            }
        }

        String canonicalSport = sportResolver.resolveOrCreateCanonical(request.sport());
        String canonicalSkill = canonicalizeSkill(request.skillLevel());

        Game game = Game.builder()
                .sport(canonicalSport)
                .location(request.location())
                .time(request.time().toInstant())
                .skillLevel(canonicalSkill)
                .latitude(request.latitude())
                .longitude(request.longitude())
                .user(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        Game saved = gameRepository.save(game);

        // Store idempotency mapping for future replays
        if (idem != null) {
            idempotencyService.put(owner.getUsername(), idem, saved.getId());
        }

        notificationService.createGameNotification(
                owner.getUsername(),
                owner.getUsername(),
                canonicalSport,
                request.location(),
                "created"
        );

        String etag = toEtag(saved.getVersion());
        long lastMod = lastModifiedEpochMilli(saved);
        var builder = ResponseEntity.created(URI.create("/games/" + saved.getId()))
                .eTag(etag)
                .header("Cache-Control", CACHE_CONTROL_HEADER)
                .header("Last-Modified", httpDate(lastMod));
        if (prefer != null && prefer.toLowerCase().contains("return=minimal")) {
            return builder
                    .header("Preference-Applied", "return=minimal")
                    .body(null);
        }
        return builder.body(mapper.toGameDetailsDTO(saved));
    }

    /**
     * Updates an existing game (PUT - full update).
     */
    @Operation(summary = "Update an existing game")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "games")
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(cacheNames = {"explore-first", "sports-list", "nearby-games"}, allEntries = true)
    public ResponseEntity<GameDetailsDTO> updateGame(
            @Parameter(description = "Game identifier") @PathVariable Long id,
            @Valid @RequestBody
            @RequestBody(description = "Updated game information") UpdateGameRequest request,
            @Parameter(description = "ETag for concurrency control")
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            @Parameter(description = "Last known update time")
            @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
            @Parameter(hidden = true) Principal principal
    ) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User currentUser = pair.user();
        try {
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow("games:update:" + currentUser.getUsername(), 5, 60)) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please try again later");
            }
        } catch (Exception ignore) {}

        // Require at least one precondition header unless explicitly allowed
        enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);

        enforceIfMatch(ifMatch, game.getVersion());
        validateGameOwnership(game, currentUser);

        if (request.time() != null) {
            validateGameTime(request.time());
        }

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
    @org.springframework.cache.annotation.CacheEvict(cacheNames = {"explore-first", "sports-list", "nearby-games"}, allEntries = true)
    public ResponseEntity<GameDetailsDTO> patchGame(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGameRequest request,
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
            Principal principal
    ) {
        // PATCH and PUT have identical logic in this implementation
        return updateGame(id, request, ifMatch, ifUnmodifiedSince, principal);
    }

    /**
     * Deletes a game.
     */
    @Operation(summary = "Delete a game")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "games")
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(cacheNames = {"explore-first", "sports-list", "nearby-games"}, allEntries = true)
    public ResponseEntity<Void> deleteGame(
            @Parameter(description = "Game identifier") @PathVariable Long id,
            @Parameter(description = "ETag for concurrency control")
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            @Parameter(description = "Last known update time")
            @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
            @Parameter(hidden = true) Principal principal) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User currentUser = pair.user();
        try {
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow("games:delete:" + currentUser.getUsername(), 5, 60)) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please try again later");
            }
        } catch (Exception ignore) {}

        // Prevent deleting a stale version (optimistic concurrency for deletes)
        enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);
        enforceIfMatch(ifMatch, game.getVersion());
        enforceIfUnmodifiedSince(ifUnmodifiedSince, lastModifiedEpochMilli(game));

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
        // Invalidate access cache as the game is gone
        gameAccessService.invalidateForGame(game.getId());
        return ResponseEntity.noContent().build();
    }

    // ================================================================================
    // Search and Discovery Endpoints
    // ================================================================================

    /**
     * Finds games near a specific location within a radius.
     */
    @Operation(summary = "Find games near a location")
    @GetMapping("/near")
    public List<GameSummaryDTO> findNearbyGames(
            @Parameter(description = "Latitude of the search location")
            @RequestParam
            @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
            @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
            double lat,
            @Parameter(description = "Longitude of the search location")
            @RequestParam
            @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
            @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
            double lon,
            @Parameter(description = "Search radius in kilometers")
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @Parameter(description = "Maximum number of results to return")
            @RequestParam(defaultValue = "50") int limit
    ) {
        validateRadius(radiusKm);
        int effLimit = clamp(limit, 1, MAX_PAGE_SIZE, 50);
        List<Game> games = gameRepository.findByLocationWithinRadius(lat, lon, radiusKm);
        return games.stream()
                .limit(effLimit)
                .map(mapper::toGameSummaryDTO)
                .toList();
    }

    /**
     * Gets AI-powered game recommendations.
     */
    @Operation(summary = "Get AI-powered game recommendations")
    @GetMapping("/recommend")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<GameSummaryDTO>> recommendGames(
            @Parameter(description = "Preferred sport for recommendations")
            @RequestParam(required = false) String preferredSport,
            @Parameter(description = "Location to base recommendations on")
            @RequestParam(required = false) String location,
            @Parameter(description = "Desired skill level")
            @RequestParam(required = false) String skillLevel,
            @Parameter(description = "Pagination information")
            @ParameterObject @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "time") Pageable pageable,
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(hidden = true)
            @RequestHeader(value = "If-Modified-Since", required = false) String ifModifiedSinceList
    ) {
        String sport = getValueOrDefault(preferredSport, defaultRecommendationSport);
        String loc = getValueOrDefault(location, defaultRecommendationLocation);
        String normalizedSkill = canonicalizeSkill(skillLevel);

        Pageable effective = sanitizePageable(pageable);

        Page<GameSummaryDTO> body = xaiRecommendationService
                .recommend(sport, loc, normalizedSkill, effective)
                .join();

        // Compute Last-Modified from DTO times as a proxy (max time)
        long lastMod = body.getContent().stream()
                .filter(dto -> dto.time() != null)
                .mapToLong(dto -> dto.time().toInstant().toEpochMilli())
                .max()
                .orElse(System.currentTimeMillis());

        HttpHeaders headers = new HttpHeaders();
        // Use synthetic page meta based on total elements and pageable for Link headers
        addPaginationLinks(request, headers, new org.springframework.data.domain.PageImpl<>(
                java.util.Collections.emptyList(), effective, body.getTotalElements()
        ));
        headers.add("X-Total-Count", String.valueOf(body.getTotalElements()));
        headers.add("Cache-Control", CACHE_CONTROL_HEADER);
        headers.add("Last-Modified", httpDate(lastMod));

        Long clientMillis = parseIfModifiedSince(ifModifiedSinceList);
        if (clientMillis != null && lastMod <= clientMillis) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }

        // Expose recommendation source header
        String source = xaiRecommendationService.getLastSource();
        headers.add("X-Recommendation-Source", source);

        return ResponseEntity.ok().headers(headers).body(body);
    }


    // ================================================================================
    // User Game Management Endpoints
    // ================================================================================

    /**
     * Retrieves games created by the authenticated user.
     */
    @Operation(summary = "Retrieve games created by the authenticated user")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public Page<GameDetailsDTO> getMyGames(
            @Parameter(description = "Pagination information")
            @ParameterObject @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "time") Pageable pageable,
            @Parameter(hidden = true) Principal principal
    ) {
        User user = findAuthenticatedUser(principal);
        return gameRepository.findByUserIdWithParticipants(user.getId(), pageable)
                .map(mapper::toGameDetailsDTO);
    }

    /**
     * RSVP to a game.
     */
    @Operation(summary = "RSVP to a game")
    @PostMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> rsvpToGame(
            @Parameter(description = "Game identifier") @PathVariable Long id,
            @Parameter(hidden = true) Principal principal) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User user = pair.user();

        boolean alreadyParticipating = gameRepository.existsParticipant(game.getId(), user.getId());
        Game saved = game;
        if (!alreadyParticipating) {
            game.addParticipant(user);
            saved = gameRepository.save(game);

            notifyGameCreatorOfParticipation(game, user, "joined");
        }

        String etag = toEtag(saved.getVersion());
        long lastMod = lastModifiedEpochMilli(saved);
        return ResponseEntity.ok()
                .eTag(etag)
                .header("Cache-Control", CACHE_CONTROL_HEADER)
                .header("Last-Modified", httpDate(lastMod))
                .header("Deprecation", "true")
                .header("Link", "</games/" + id + "/rsvp2>; rel=\"successor-version\"")
                .body(mapper.toGameDetailsDTO(saved));
    }

    /**
     * Cancel RSVP to a game.
     */
    @Operation(summary = "Cancel RSVP to a game")
    @DeleteMapping("/{id}/unrsvp")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<GameDetailsDTO> unrsvpFromGame(
            @Parameter(description = "Game identifier") @PathVariable Long id,
            @Parameter(hidden = true) Principal principal) {
        UserGamePair pair = validateUserAndGame(id, principal);
        Game game = pair.game();
        User user = pair.user();

        boolean wasParticipating = gameRepository.existsParticipant(game.getId(), user.getId());
        if (!wasParticipating) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You are not a participant of this game");
        }

        game.removeParticipant(user);
        Game saved = gameRepository.save(game);

        notifyGameCreatorOfParticipation(game, user, "left");

        // Invalidate access cache for this game to reflect participant removal
        gameAccessService.invalidateForGame(game.getId());

        String etag = toEtag(saved.getVersion());
        long lastMod = lastModifiedEpochMilli(saved);
        return ResponseEntity.ok()
                .eTag(etag)
                .header("Cache-Control", CACHE_CONTROL_HEADER)
                .header("Last-Modified", httpDate(lastMod))
                .header("Deprecation", "true")
                .header("Link", "</games/" + id + "/rsvp2>; rel=\"successor-version\"")
                .body(mapper.toGameDetailsDTO(saved));
    }

    // ================================================================================
    // Private Helper Methods
    // ================================================================================

    /**
     * Clamp page size and whitelist sort properties to prevent heavy or invalid queries.
     */
    private Pageable sanitizePageable(Pageable pageable) {
        if (pageable == null) {
            return PageRequest.of(0, DEFAULT_PAGE_SIZE, Sort.by("time"));
        }
        int size = pageable.getPageSize() <= 0 ? DEFAULT_PAGE_SIZE
                : Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);

        // Whitelist allowed sort properties; default to 400 if any is invalid
        Set<String> allowed = Set.of("time", "sport", "location", "createdAt", "updatedAt", "distance");
        boolean invalidSort = pageable.getSort().stream()
                .map(Sort.Order::getProperty)
                .anyMatch(p -> !allowed.contains(p));

        if (invalidSort) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort property");
        }

        Sort sort = pageable.getSort();
        if (sort.isUnsorted()) {
            sort = Sort.by("time");
        }

        return PageRequest.of(Math.max(0, pageable.getPageNumber()), size, sort);
    }

    /**
     * Clamp integer values to [min, max], using a default if requested is invalid.
     */
    private int clamp(int requested, int min, int max, int dflt) {
        if (requested <= 0) return dflt;
        return Math.max(min, Math.min(max, requested));
    }

    /**
     * Validate and normalize skill level (case-insensitive) to a canonical display value.
     * Returns null if input is null/blank. Throws 400 for unsupported values.
     */
    private String canonicalizeSkill(String skillLevel) {
        if (skillLevel == null || skillLevel.isBlank()) {
            return null;
        }
        String trimmed = skillLevel.trim();
        String lower = trimmed.toLowerCase();
        String canonical = switch (lower) {
            case "beginner" -> "Beginner";
            case "intermediate" -> "Intermediate";
            case "advanced" -> "Advanced";
            case "pro", "professional" -> "Pro";
            default -> null;
        };
        if (canonical == null || !ALLOWED_SKILL_LEVELS.contains(canonical)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported skillLevel");
        }
        return canonical;
    }

    /**
     * Normalize free-text filters (trim and convert blank to null).
     */
    private String normalizeFilter(String value) {
        if (value == null) return null;
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    /**
     * Validate that fromTime is not after toTime when both provided.
     */
    private void validateTimeRange(OffsetDateTime fromTime, OffsetDateTime toTime) {
        if (fromTime != null && toTime != null && fromTime.isAfter(toTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromTime must be <= toTime");
        }
    }

    /**
     * Validate that a game time is not in the past (5-minute grace for clock skew).
     */
    private void validateGameTime(OffsetDateTime time) {
        if (time == null) return;
        OffsetDateTime threshold = OffsetDateTime.now().minusMinutes(5);
        if (time.isBefore(threshold)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "time must be in the future");
        }
    }

    /**
     * Validate geo params: either all of (lat, lon, radiusKm) are provided, or none.
     */
    private void validateGeoParams(Double lat, Double lon, Double radiusKm) {
        int count = (lat != null ? 1 : 0) + (lon != null ? 1 : 0) + (radiusKm != null ? 1 : 0);
        if (count != 0 && count != 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "lat, lon and radiusKm must be provided together");
        }
        // Basic range guard if provided
        if (lat != null && (lat < -90.0 || lat > 90.0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude must be between -90 and 90");
        }
        if (lon != null && (lon < -180.0 || lon > 180.0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude must be between -180 and 180");
        }
    }

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
     * Builds the response for a game request with ETag support (delegates to the overload with date header).
     */
    private ResponseEntity<GameDetailsDTO> buildGameResponse(Game game, String ifNoneMatch) {
        return buildGameResponse(game, ifNoneMatch, null);
    }

    /**
     * Builds the response for a game request with ETag and If-Modified-Since support.
     * ETag check takes precedence; if not present or not matched, checks If-Modified-Since.
     */
    private ResponseEntity<GameDetailsDTO> buildGameResponse(Game game, String ifNoneMatch, String ifModifiedSince) {
        GameDetailsDTO dto = mapper.toGameDetailsDTO(game);
        String etag = toEtag(game.getVersion());
        long lastModified = lastModifiedEpochMilli(game);

        // 1) Strong/weak ETag handling
        if (ifNoneMatch != null && !ifNoneMatch.isBlank()) {
            String norm = normalizeIfMatch(ifNoneMatch);
            String current = String.valueOf(game.getVersion() == null ? 0L : game.getVersion());
            if (current.equals(norm)) {
                return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
                        .eTag(etag)
                        .header("Cache-Control", CACHE_CONTROL_HEADER)
                        .header("Last-Modified", httpDate(lastModified))
                        .build();
            }
        }

        // 2) If-Modified-Since (RFC 7232); only if ETag did not short-circuit
        if (ifModifiedSince != null && !ifModifiedSince.isBlank()) {
            try {
                var zdt = java.time.ZonedDateTime.parse(ifModifiedSince.trim(),
                        java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME);
                long clientMillis = zdt.toInstant().toEpochMilli();
                if (lastModified <= clientMillis) {
                    return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
                            .eTag(etag)
                            .header("Cache-Control", CACHE_CONTROL_HEADER)
                            .header("Last-Modified", httpDate(lastModified))
                            .build();
                }
            } catch (Exception ignore) {
                // Invalid date header -> ignore and return the resource normally
            }
        }

        return ResponseEntity.ok()
                .eTag(etag)
                .header("Cache-Control", CACHE_CONTROL_HEADER)
                .header("Last-Modified", httpDate(lastModified))
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
            game.setSkillLevel(canonicalizeSkill(request.skillLevel()));
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
     * Ensure at least one precondition header is present for unsafe writes.
     * Returns 428 Precondition Required when both are missing (unless allowUnsafeWrite is true).
     */
    private void enforcePreconditionsPresent(String ifMatchHeader, String ifUnmodifiedSinceHeader) {
        if (allowUnsafeWrite) return;
        boolean noIfMatch = (ifMatchHeader == null || ifMatchHeader.isBlank());
        boolean noIus = (ifUnmodifiedSinceHeader == null || ifUnmodifiedSinceHeader.isBlank());
        if (noIfMatch && noIus) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED, "Missing precondition header");
        }
    }

    /**
     * Enforces If-Unmodified-Since precondition (RFC 7232).
     * Rejects (412) if the resource was modified after the provided date.
     */
    private static void enforceIfUnmodifiedSince(String ifUnmodifiedSinceHeader, long currentLastModifiedMillis) {
        if (ifUnmodifiedSinceHeader == null || ifUnmodifiedSinceHeader.isBlank()) {
            return;
        }
        try {
            java.time.ZonedDateTime zdt = java.time.ZonedDateTime.parse(
                    ifUnmodifiedSinceHeader.trim(),
                    java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
            );
            long clientMillis = zdt.toInstant().toEpochMilli();
            if (currentLastModifiedMillis > clientMillis) {
                throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,
                        "Resource modified since provided date");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid If-Unmodified-Since header");
        }
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
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.httpDate(epochMillis);
    }

    /**
     * Parses an RFC 1123 date header, returning epoch millis or null on invalid/missing.
     */
    private static Long parseIfModifiedSince(String header) {
        if (header == null || header.isBlank()) return null;
        try {
            var zdt = java.time.ZonedDateTime.parse(header.trim(),
                    java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME);
            return zdt.toInstant().toEpochMilli();
        } catch (Exception ignore) {
            return null;
        }
    }

    /**
     * Adds RFC 5988 Link headers (first, prev, next, last) based on the current request and Page metadata.
     */
    private void addPaginationLinks(HttpServletRequest request, HttpHeaders headers, Page<?> page) {
        com.bmessi.pickupsportsapp.web.ApiResponseUtils.addPaginationLinks(request, headers, page);
    }

    private static String buildLink(UriComponentsBuilder base, int page, int size, String rel) {
        String url = base.replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .build(true)
                .toUriString();
        return "<" + url + ">; rel=\"" + rel + "\"";
    }

    /**
     * Helper record for user-game pair validation.
     */
    private record UserGamePair(User user, Game game) {}
}