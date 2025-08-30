package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.service.SportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sports")
@CrossOrigin(origins = "*")
public class SportController {

    @Autowired
    private SportService sportService;

    /**
     * Get all active sports
     */
    @GetMapping
    public ResponseEntity<List<Sport>> getAllSports() {
        List<Sport> sports = sportService.getAllActiveSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Get sport by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Sport> getSportById(@PathVariable Long id) {
        Sport sport = sportService.getSportById(id);
        if (sport != null) {
            return ResponseEntity.ok(sport);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get sport by name
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<Sport> getSportByName(@PathVariable String name) {
        Sport sport = sportService.getSportByName(name);
        if (sport != null) {
            return ResponseEntity.ok(sport);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get sports by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Sport>> getSportsByCategory(@PathVariable String category) {
        try {
            Sport.SportCategory sportCategory = Sport.SportCategory.valueOf(category.toUpperCase());
            List<Sport> sports = sportService.getSportsByCategory(sportCategory);
            return ResponseEntity.ok(sports);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get sports by difficulty level
     */
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Sport>> getSportsByDifficulty(@PathVariable String difficulty) {
        try {
            Sport.DifficultyLevel difficultyLevel = Sport.DifficultyLevel.valueOf(difficulty.toUpperCase());
            List<Sport> sports = sportService.getSportsByDifficulty(difficultyLevel);
            return ResponseEntity.ok(sports);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get team sports only
     */
    @GetMapping("/team-sports")
    public ResponseEntity<List<Sport>> getTeamSports() {
        List<Sport> sports = sportService.getTeamSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Get individual sports only
     */
    @GetMapping("/individual-sports")
    public ResponseEntity<List<Sport>> getIndividualSports() {
        List<Sport> sports = sportService.getIndividualSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Get indoor sports
     */
    @GetMapping("/indoor")
    public ResponseEntity<List<Sport>> getIndoorSports() {
        List<Sport> sports = sportService.getIndoorSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Get outdoor sports
     */
    @GetMapping("/outdoor")
    public ResponseEntity<List<Sport>> getOutdoorSports() {
        List<Sport> sports = sportService.getOutdoorSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Get weather-dependent sports
     */
    @GetMapping("/weather-dependent")
    public ResponseEntity<List<Sport>> getWeatherDependentSports() {
        List<Sport> sports = sportService.getWeatherDependentSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Get sports by popularity (above threshold)
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Sport>> getPopularSports(@RequestParam(defaultValue = "7.0") Double minScore) {
        List<Sport> sports = sportService.getSportsByPopularity(minScore);
        return ResponseEntity.ok(sports);
    }

    /**
     * Get sports suitable for specific player count
     */
    @GetMapping("/players/{playerCount}")
    public ResponseEntity<List<Sport>> getSportsByPlayerCount(@PathVariable Integer playerCount) {
        List<Sport> sports = sportService.getSportsByPlayerCount(playerCount);
        return ResponseEntity.ok(sports);
    }

    /**
     * Get sports by duration range
     */
    @GetMapping("/duration")
    public ResponseEntity<List<Sport>> getSportsByDuration(
            @RequestParam Integer minMinutes,
            @RequestParam Integer maxMinutes) {
        List<Sport> sports = sportService.getSportsByDuration(minMinutes, maxMinutes);
        return ResponseEntity.ok(sports);
    }

    /**
     * Get all sport categories
     */
    @GetMapping("/categories")
    public ResponseEntity<Sport.SportCategory[]> getAllCategories() {
        Sport.SportCategory[] categories = Sport.SportCategory.values();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get all difficulty levels
     */
    @GetMapping("/difficulty-levels")
    public ResponseEntity<Sport.DifficultyLevel[]> getAllDifficultyLevels() {
        Sport.DifficultyLevel[] levels = Sport.DifficultyLevel.values();
        return ResponseEntity.ok(levels);
    }

    /**
     * Search sports by name or description
     */
    @GetMapping("/search")
    public ResponseEntity<List<Sport>> searchSports(@RequestParam String query) {
        List<Sport> sports = sportService.searchSports(query);
        return ResponseEntity.ok(sports);
    }

    /**
     * Get sports statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSportsStats() {
        Map<String, Object> stats = sportService.getSportsStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get sports by venue type
     */
    @GetMapping("/venue-type/{venueType}")
    public ResponseEntity<List<Sport>> getSportsByVenueType(@PathVariable String venueType) {
        List<Sport> sports = sportService.getSportsByVenueType(venueType);
        return ResponseEntity.ok(sports);
    }

    /**
     * Get trending sports (by popularity and recent activity)
     */
    @GetMapping("/trending")
    public ResponseEntity<List<Sport>> getTrendingSports(@RequestParam(defaultValue = "10") Integer limit) {
        List<Sport> sports = sportService.getTrendingSports(limit);
        return ResponseEntity.ok(sports);
    }

    /**
     * Get sports recommendations for user
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<Sport>> getSportRecommendations(
            @RequestParam(required = false) String userSkillLevel,
            @RequestParam(required = false) Boolean preferTeamSports,
            @RequestParam(required = false) Boolean preferIndoor,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(defaultValue = "10") Integer limit) {
        List<Sport> sports = sportService.getSportRecommendations(
            userSkillLevel, preferTeamSports, preferIndoor, maxDuration, limit);
        return ResponseEntity.ok(sports);
    }
}
