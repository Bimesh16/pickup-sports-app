package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.integration.xai.XaiApiClient;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "xai", name = "enabled", havingValue = "true")
public class XaiRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(XaiRecommendationService.class);

    private final GameRepository gameRepository;
    private final XaiApiClient xaiApiClient;

    public Page<Game> getRecommendations(String preferredSport, String location, String skillLevel, Pageable pageable) {
        var hintsOpt = xaiApiClient.getRecommendations(preferredSport, location, pageable.getPageNumber(), pageable.getPageSize());

        if (hintsOpt.isPresent() && !hintsOpt.get().isEmpty()) {
            List<Game> collected = new ArrayList<>();
            for (var hint : hintsOpt.get()) {
                var page = gameRepository.search(
                        hint.sport(),
                        hint.location(),
                        OffsetDateTime.now(),
                        null,
                        skillLevel,
                        PageRequest.of(0, Math.max(1, pageable.getPageSize()))
                );
                page.getContent().forEach(g -> {
                    if (collected.stream().noneMatch(x -> x.getId().equals(g.getId()))) {
                        collected.add(g);
                    }
                });
                if (collected.size() >= pageable.getPageSize()) break;
            }
            int from = 0;
            int to = Math.min(collected.size(), pageable.getPageSize());
            List<Game> slice = collected.subList(from, to);
            log.debug("XAI-backed recommendations: {} games for sport={}, location={}, skillLevel={}",
                    slice.size(), preferredSport, location, skillLevel);
            return new PageImpl<>(slice, pageable, collected.size());
        }

        var fallback = gameRepository.search(
                emptyToNull(preferredSport),
                emptyToNull(location),
                OffsetDateTime.now(),
                null,
                emptyToNull(skillLevel),
                pageable
        );
        log.debug("Fallback recommendations (no XAI): {} games for sport={}, location={}, skillLevel={}",
                fallback.getNumberOfElements(), preferredSport, location, skillLevel);
        return fallback;
    }

    private static String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}