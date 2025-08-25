package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.repository.GameRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class SportsService {

    private final GameRepository gameRepository;

    public SportsService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Cacheable(cacheNames = "sports")
    public List<String> listSports() {
        Set<String> sports = gameRepository.findDistinctSports();
        if (sports == null || sports.isEmpty()) return List.of();

        return sports.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.naturalOrder())
                .toList();
    }
}