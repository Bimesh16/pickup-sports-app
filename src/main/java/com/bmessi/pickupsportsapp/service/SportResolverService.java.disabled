package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SportResolverService {

    private final SportRepository sportRepository;

    /**
     * Normalize an incoming sport name, ensure the sport exists in the catalog, and return the canonical display name.
     * If the input is null/blank, returns "Unknown" and ensures the "unknown" sport exists.
     */
    @Transactional
    @CacheEvict(cacheNames = "search-filters", allEntries = true)
    public String resolveOrCreateCanonical(String incoming) {
        String normalizedKey = normalizeKey(incoming);
        String display = toDisplayName(normalizedKey);

        Sport sport = sportRepository.findByNameIgnoreCase(normalizedKey);
        if (sport == null) {
            sport = new Sport();
            sport.setName(normalizedKey);
            sport.setDisplayName(display);
            sport.setIsActive(true);
            sport.setCategory(Sport.SportCategory.BALL_SPORTS);
            sport.setTeamSizeMin(1);
            sport.setTeamSizeMax(1);
            sport.setTotalPlayersMin(1);
            sport.setTotalPlayersMax(1);
            sport.setDurationMinutesMin(30);
            sport.setDurationMinutesMax(90);
            sport.setSkillLevels("[\"BEGINNER\", \"INTERMEDIATE\"]");
            sport.setEquipmentRequired("[]");
            sport.setEquipmentProvided("[]");
            sport.setVenueTypes("[\"OUTDOOR_FIELD\"]");
            sport.setRules("Basic rules apply");
            sport.setPopularityScore(5.0);
            sport.setDifficultyLevel(Sport.DifficultyLevel.BEGINNER);
            sport.setIsTeamSport(false);
            sport.setIsIndoor(false);
            sport.setIsOutdoor(true);
            sport.setIsWeatherDependent(false);
            sport = sportRepository.save(sport);
        }
        return sport.getDisplayName();
    }

    private static String normalizeKey(String s) {
        if (s == null) return "unknown";
        String trimmed = s.trim();
        if (trimmed.isEmpty()) return "unknown";
        // Basic normalization rules; extend with synonyms as needed
        String key = trimmed.toLowerCase();
        if (key.equals("footy")) key = "soccer";
        if (key.equals("table tennis")) key = "table_tennis";
        key = key.replace(' ', '_');
        return key;
    }

    private static String toDisplayName(String key) {
        if ("unknown".equals(key)) return "Unknown";
        // Convert snake_case to Title Case
        String[] parts = key.split("_");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            sb.append(Character.toUpperCase(parts[i].charAt(0)));
            if (parts[i].length() > 1) sb.append(parts[i].substring(1));
            if (i < parts.length - 1) sb.append(' ');
        }
        return sb.toString();
    }
}
