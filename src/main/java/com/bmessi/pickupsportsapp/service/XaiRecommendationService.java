package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class XaiRecommendationService {

    private final GameRepository gameRepository;

    public XaiRecommendationService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    /**
     * Local, deterministic recommendations with pagination.
     * - If preferredSport is provided, start from games of that sport; otherwise, all games.
     * - If location is provided, filter by a case-insensitive contains match on location.
     * - Apply pagination based on the provided Pageable.
     */
    public Page<Game> getRecommendations(String preferredSport, String location, Pageable pageable) {
        return gameRepository.findBySportAndLocation(preferredSport, location, pageable);
    }
}