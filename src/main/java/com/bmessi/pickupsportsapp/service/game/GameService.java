package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;

import java.util.List;

/**
 * Global Game Service - Core game management functionality for all countries.
 * 
 * <p>This service provides universal game operations while supporting
 * country-specific customizations through the service layer.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
public interface GameService {

    /**
     * Creates a new game with global functionality.
     */
    GameDetailsDTO createGame(CreateGameRequest request);

    /**
     * Retrieves a game by ID with full details.
     */
    GameDetailsDTO getGameById(Long gameId);

    /**
     * Finds nearby games with optional country-specific filtering.
     */
    List<GameSummaryDTO> findNearbyGames(Double latitude, Double longitude, 
                                        Double radiusKm, String sport, 
                                        String skillLevel, String countryCode);

    /**
     * Gets trending games based on location and preferences.
     */
    List<GameSummaryDTO> getTrendingGames(String countryCode);

    /**
     * Updates an existing game.
     */
    GameDetailsDTO updateGame(Long gameId, CreateGameRequest request);

    /**
     * Deletes a game.
     */
    void deleteGame(Long gameId);
}
