package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SportService {

    @Autowired
    private SportRepository sportRepository;

    /**
     * Get all active sports
     */
    public List<Sport> getAllActiveSports() {
        return sportRepository.findByIsActiveTrue();
    }

    /**
     * Get sport by ID
     */
    public Sport getSportById(Long id) {
        return sportRepository.findById(id).orElse(null);
    }

    /**
     * Get sport by name
     */
    public Sport getSportByName(String name) {
        return sportRepository.findByNameIgnoreCase(name);
    }

    /**
     * Get sports by category
     */
    public List<Sport> getSportsByCategory(Sport.SportCategory category) {
        return sportRepository.findByCategoryAndIsActiveTrue(category);
    }

    /**
     * Get sports by difficulty level
     */
    public List<Sport> getSportsByDifficulty(Sport.DifficultyLevel difficulty) {
        return sportRepository.findByDifficultyLevelAndIsActiveTrue(difficulty);
    }

    /**
     * Get team sports only
     */
    public List<Sport> getTeamSports() {
        return sportRepository.findByIsTeamSportTrueAndIsActiveTrue();
    }

    /**
     * Get individual sports only
     */
    public List<Sport> getIndividualSports() {
        return sportRepository.findByIsTeamSportFalseAndIsActiveTrue();
    }

    /**
     * Get indoor sports
     */
    public List<Sport> getIndoorSports() {
        return sportRepository.findByIsIndoorTrueAndIsActiveTrue();
    }

    /**
     * Get outdoor sports
     */
    public List<Sport> getOutdoorSports() {
        return sportRepository.findByIsOutdoorTrueAndIsActiveTrue();
    }

    /**
     * Get weather-dependent sports
     */
    public List<Sport> getWeatherDependentSports() {
        return sportRepository.findByIsWeatherDependentTrueAndIsActiveTrue();
    }

    /**
     * Get sports by popularity (above threshold)
     */
    public List<Sport> getSportsByPopularity(Double minScore) {
        return sportRepository.findByPopularityScoreGreaterThanEqualAndIsActiveTrue(minScore);
    }

    /**
     * Get sports suitable for specific player count
     */
    public List<Sport> getSportsByPlayerCount(Integer playerCount) {
        return sportRepository.findByTotalPlayersMinLessThanEqualAndTotalPlayersMaxGreaterThanEqualAndIsActiveTrue(playerCount);
    }

    /**
     * Get sports by duration range
     */
    public List<Sport> getSportsByDuration(Integer minMinutes, Integer maxMinutes) {
        return sportRepository.findByDurationMinutesMinLessThanEqualAndDurationMinutesMaxGreaterThanEqualAndIsActiveTrue(
            maxMinutes, minMinutes);
    }

    /**
     * Search sports by name or description
     */
    public List<Sport> searchSports(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        return sportRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsActiveTrue(searchQuery);
    }

    /**
     * Get sports statistics
     */
    public Map<String, Object> getSportsStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Sport> allSports = getAllActiveSports();
        
        stats.put("totalSports", allSports.size());
        stats.put("teamSports", getTeamSports().size());
        stats.put("individualSports", getIndividualSports().size());
        stats.put("indoorSports", getIndoorSports().size());
        stats.put("outdoorSports", getOutdoorSports().size());
        stats.put("weatherDependentSports", getWeatherDependentSports().size());
        
        // Category distribution
        Map<Sport.SportCategory, Long> categoryStats = allSports.stream()
            .collect(Collectors.groupingBy(Sport::getCategory, Collectors.counting()));
        stats.put("categoryDistribution", categoryStats);
        
        // Difficulty distribution
        Map<Sport.DifficultyLevel, Long> difficultyStats = allSports.stream()
            .collect(Collectors.groupingBy(Sport::getDifficultyLevel, Collectors.counting()));
        stats.put("difficultyDistribution", difficultyStats);
        
        // Average popularity
        double avgPopularity = allSports.stream()
            .mapToDouble(Sport::getPopularityScore)
            .average()
            .orElse(0.0);
        stats.put("averagePopularity", avgPopularity);
        
        // Most popular sport
        Sport mostPopular = allSports.stream()
            .max(Comparator.comparing(Sport::getPopularityScore))
            .orElse(null);
        if (mostPopular != null) {
            stats.put("mostPopularSport", mostPopular.getName());
            stats.put("mostPopularScore", mostPopular.getPopularityScore());
        }
        
        return stats;
    }

    /**
     * Get sports by venue type
     */
    public List<Sport> getSportsByVenueType(String venueType) {
        return getAllActiveSports().stream()
            .filter(sport -> {
                try {
                    List<String> venueTypes = parseJsonArray(sport.getVenueTypes());
                    return venueTypes.contains(venueType.toUpperCase());
                } catch (Exception e) {
                    return false;
                }
            })
            .collect(Collectors.toList());
    }

    /**
     * Get trending sports (by popularity and recent activity)
     */
    public List<Sport> getTrendingSports(Integer limit) {
        return getAllActiveSports().stream()
            .sorted(Comparator.comparing(Sport::getPopularityScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get sports recommendations for user
     */
    public List<Sport> getSportRecommendations(String userSkillLevel, Boolean preferTeamSports, 
                                             Boolean preferIndoor, Integer maxDuration, Integer limit) {
        List<Sport> allSports = getAllActiveSports();
        List<Sport> recommendations = new ArrayList<>();
        
        // Filter by preferences
        for (Sport sport : allSports) {
            boolean matches = true;
            
            // Skill level filter
            if (userSkillLevel != null) {
                try {
                    List<String> skillLevels = parseJsonArray(sport.getSkillLevels());
                    if (!skillLevels.contains(userSkillLevel.toUpperCase())) {
                        matches = false;
                    }
                } catch (Exception e) {
                    matches = false;
                }
            }
            
            // Team sport preference
            if (preferTeamSports != null && preferTeamSports != sport.getIsTeamSport()) {
                matches = false;
            }
            
            // Indoor preference
            if (preferIndoor != null && preferIndoor != sport.getIsIndoor()) {
                matches = false;
            }
            
            // Duration filter
            if (maxDuration != null && sport.getDurationMinutesMax() > maxDuration) {
                matches = false;
            }
            
            if (matches) {
                recommendations.add(sport);
            }
        }
        
        // Sort by popularity and limit results
        return recommendations.stream()
            .sorted(Comparator.comparing(Sport::getPopularityScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Helper method to parse JSON array strings
     */
    private List<String> parseJsonArray(String jsonArray) {
        try {
            // Simple JSON array parsing for basic use case
            if (jsonArray == null || jsonArray.trim().isEmpty()) {
                return new ArrayList<>();
            }
            
            // Remove brackets and split by comma
            String content = jsonArray.replaceAll("[\\[\\]\"]", "");
            if (content.trim().isEmpty()) {
                return new ArrayList<>();
            }
            
            return Arrays.stream(content.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
