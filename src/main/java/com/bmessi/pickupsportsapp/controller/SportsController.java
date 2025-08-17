package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class SportsController {

    private final GameRepository gameRepository;

    @GetMapping("/sports")
    public List<String> getSports() {
        Set<String> sports = gameRepository.findDistinctSports();
        if (sports == null || sports.isEmpty()) {
            return List.of();
        }
        return sports.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.naturalOrder())
                .toList();
    }
}