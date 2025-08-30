package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of GameService providing global game management functionality.
 * 
 * <p>This service handles core game operations while delegating country-specific
 * features to specialized services when available.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final ApiMapper apiMapper;

    @Override
    public GameDetailsDTO createGame(CreateGameRequest request) {
        log.info("Creating new game: sport={}, location={}", request.sport(), request.location());
        
        // Convert DTO to entity
        Game game = apiMapper.toGame(request);
        
        // Save game
        Game savedGame = gameRepository.save(game);
        
        log.info("Game created successfully with ID: {}", savedGame.getId());
        
        // Convert back to DTO
        return apiMapper.toGameDetailsDTO(savedGame);
    }

    @Override
    public GameDetailsDTO getGameById(Long gameId) {
        log.debug("Getting game by ID: {}", gameId);
        
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found: " + gameId));
        
        return apiMapper.toGameDetailsDTO(game);
    }

    @Override
    public List<GameSummaryDTO> findNearbyGames(Double latitude, Double longitude, 
                                               Double radiusKm, String sport, 
                                               String skillLevel, String countryCode) {
        log.info("Finding nearby games: lat={}, lon={}, radius={}km, sport={}, skill={}, country={}", 
                latitude, longitude, radiusKm, sport, skillLevel, countryCode);
        
        // Use existing repository method for location-based search
        var gamePage = gameRepository.findByLocationWithinRadius(
                sport, skillLevel, null, null, null, latitude, longitude, radiusKm, 
                org.springframework.data.domain.PageRequest.of(0, 50));
        
        List<Game> games = gamePage.getContent();
        
        log.info("Found {} nearby games", games.size());
        
        return games.stream()
                .map(this::convertToGameSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameSummaryDTO> getTrendingGames(String countryCode) {
        log.info("Getting trending games for country: {}", countryCode);
        
        // For now, return recent games
        // In the future, this could use analytics to determine trending games
        var gamePage = gameRepository.findAll(
                org.springframework.data.domain.PageRequest.of(0, 20));
        
        List<Game> games = gamePage.getContent();
        
        return games.stream()
                .map(this::convertToGameSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GameDetailsDTO updateGame(Long gameId, CreateGameRequest request) {
        log.info("Updating game: {}", gameId);
        
        Game existingGame = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found: " + gameId));
        
        // Update game properties
        updateGameFromRequest(existingGame, request);
        
        Game updatedGame = gameRepository.save(existingGame);
        
        log.info("Game updated successfully: {}", gameId);
        
        return apiMapper.toGameDetailsDTO(updatedGame);
    }

    @Override
    public void deleteGame(Long gameId) {
        log.info("Deleting game: {}", gameId);
        
        if (!gameRepository.existsById(gameId)) {
            throw new RuntimeException("Game not found: " + gameId);
        }
        
        gameRepository.deleteById(gameId);
        
        log.info("Game deleted successfully: {}", gameId);
    }

    // ==================== Helper Methods ====================

    private GameSummaryDTO convertToGameSummaryDTO(Game game) {
        return GameSummaryDTO.builder()
                .id(game.getId())
                .sport(game.getSport())
                .location(game.getLocation())
                .time(game.getTime())
                .skillLevel(game.getSkillLevel())
                .latitude(game.getLatitude())
                .longitude(game.getLongitude())
                .creatorName(game.getUser() != null ? game.getUser().getUsername() : "Unknown")
                .currentPlayers(game.getParticipants() != null ? game.getParticipants().size() : 0)
                .maxPlayers(game.getMaxPlayers())
                .status("ACTIVE") // This could be more sophisticated
                .build();
    }

    private void updateGameFromRequest(Game game, CreateGameRequest request) {
        if (request.sport() != null) game.setSport(request.sport());
        if (request.location() != null) game.setLocation(request.location());
        if (request.time() != null) game.setTime(request.time());
        if (request.skillLevel() != null) game.setSkillLevel(request.skillLevel());
        if (request.latitude() != null) game.setLatitude(request.latitude());
        if (request.longitude() != null) game.setLongitude(request.longitude());
        if (request.gameType() != null) game.setGameType(request.gameType());
        if (request.description() != null) game.setDescription(request.description());
        if (request.minPlayers() != null) game.setMinPlayers(request.minPlayers());
        if (request.maxPlayers() != null) game.setMaxPlayers(request.maxPlayers());
        if (request.pricePerPlayer() != null) game.setPricePerPlayer(request.pricePerPlayer());
        if (request.totalCost() != null) game.setTotalCost(request.totalCost());
        if (request.durationMinutes() != null) game.setDurationMinutes(request.durationMinutes());
        if (request.rsvpCutoff() != null) game.setRsvpCutoff(request.rsvpCutoff());
        if (request.capacity() != null) game.setCapacity(request.capacity());
        if (request.waitlistEnabled() != null) game.setWaitlistEnabled(request.waitlistEnabled());
        if (request.isPrivate() != null) game.setIsPrivate(request.isPrivate());
        if (request.requiresApproval() != null) game.setRequiresApproval(request.requiresApproval());
        if (request.weatherDependent() != null) game.setWeatherDependent(request.weatherDependent());
        if (request.cancellationPolicy() != null) game.setCancellationPolicy(request.cancellationPolicy());
        if (request.rules() != null) game.setRules(request.rules());
        if (request.equipmentProvided() != null) game.setEquipmentProvided(request.equipmentProvided());
        if (request.equipmentRequired() != null) game.setEquipmentRequired(request.equipmentRequired());
    }
}
