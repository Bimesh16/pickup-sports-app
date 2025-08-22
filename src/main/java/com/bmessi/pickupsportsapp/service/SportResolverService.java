package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import lombok.RequiredArgsConstructor;
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
    public String resolveOrCreateCanonical(String incoming) {
        String normalizedKey = normalizeKey(incoming);
        String display = toDisplayName(normalizedKey);

        Sport sport = sportRepository.findByName(normalizedKey)
                .orElseGet(() -> sportRepository.save(
                        Sport.builder()
                                .name(normalizedKey)
                                .displayName(display)
                                .build()
                ));
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
