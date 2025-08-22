package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.GameSummaryDTO;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ApiMapper mapper;

    @GetMapping("/games")
    public Page<GameSummaryDTO> searchGames(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skillLevel,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10.0") Double radiusKm,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        // Simplified - use existing search method
        Page<Game> games = gameRepository.search(sport, location, fromDate, toDate, skillLevel, pageable);
        return games.map(mapper::toGameSummaryDTO);
    }

    @GetMapping("/users")
    public Page<UserDTO> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String preferredSport,
            @RequestParam(required = false) String location,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<User> users = userRepository.search(preferredSport, location, username, pageable);
        return users.map(mapper::toUserDTO);
    }

    @GetMapping("/filters")
    public SearchFiltersResponse getFilters() {
        Set<String> sports = gameRepository.findDistinctSports();
        Set<String> locations = userRepository.findDistinctLocations();

        return new SearchFiltersResponse(
                sports.stream().sorted().toList(),
                locations.stream().sorted().toList(),
                List.of("Beginner", "Intermediate", "Advanced", "Pro")
        );
    }

    public record SearchFiltersResponse(
            List<String> availableSports,
            List<String> availableLocations,
            List<String> skillLevels
    ) {}
}