package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.integration.xai.XaiApiClient;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class XaiRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(XaiRecommendationService.class);

    private final GameRepository gameRepository;
    private final XaiApiClient xaiApiClient;

    public Page<Game> getRecommendations(String preferredSport, String location, Pageable pageable) {
        // Try external recommender first
        var hintsOpt = xaiApiClient.getRecommendations(preferredSport, location, pageable.getPageNumber(), pageable.getPageSize());

        if (hintsOpt.isPresent() && !hintsOpt.get().isEmpty()) {
            // Strategy: collect games for the hinted (sport, location) pairs; keep order roughly by scores
            List<Game> collected = new ArrayList<>();
            for (var hint : hintsOpt.get()) {
                var page = gameRepository.search(
                        hint.sport(), hint.location(),
                        OffsetDateTime.now(), null,  // focus on upcoming games
                        PageRequest.of(0, Math.max(1, pageable.getPageSize()))
                );
                // Append results, avoid duplicates by ID
                page.getContent().forEach(g -> {
                    if (collected.stream().noneMatch(x -> x.getId().equals(g.getId()))) {
                        collected.add(g);
                    }
                });
                if (collected.size() >= pageable.getPageSize()) break;
            }
            // Paginate locally (simple and effective). For large sets, consider query-time ordering by score.
            int from = 0;
            int to = Math.min(collected.size(), pageable.getPageSize());
            List<Game> slice = collected.subList(from, to);
            log.debug("XAI-backed recommendations: {} games", slice.size());
            return new PageImpl<>(slice, pageable, collected.size());
        }

        // Fallback: upcoming games filtered by user hints
        var fallback = gameRepository.search(
                emptyToNull(preferredSport),
                emptyToNull(location),
                OffsetDateTime.now(),
                null,
                pageable
        );
        log.debug("Fallback recommendations (no XAI): {} games", fallback.getNumberOfElements());
        return fallback;
    }

    private static String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}