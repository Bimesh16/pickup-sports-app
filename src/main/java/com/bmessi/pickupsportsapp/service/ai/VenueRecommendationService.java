package com.bmessi.pickupsportsapp.service.ai;

import com.bmessi.pickupsportsapp.dto.ai.VenueRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.ai.VenueRecommendation;
import com.bmessi.pickupsportsapp.repository.ai.VenueRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for AI-powered venue recommendations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenueRecommendationService {

    private final VenueRecommendationRepository venueRecommendationRepository;

    /**
     * Get personalized venue recommendations for a user.
     */
    public List<VenueRecommendationDTO> getPersonalizedRecommendations(User user, int limit) {
        log.debug("Getting personalized venue recommendations for user: {}", user.getId());

        List<VenueRecommendation> recommendations = venueRecommendationRepository
                .findByUserAndStatusOrderByRecommendationScoreDesc(
                        user,
                        VenueRecommendation.RecommendationStatus.ACTIVE,
                        PageRequest.of(0, limit)
                );
        
        return recommendations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Generate batch recommendations for all active users.
     */
    public void generateBatchRecommendations() {
        log.info("Starting batch venue recommendation generation");
        
        // TODO: Implement actual batch recommendation generation
        // This would typically involve:
        // - Analyzing user location preferences
        // - Processing venue availability data
        // - Running ML models for predictions
        
        log.info("Batch venue recommendation generation completed");
    }

    /**
     * Update recommendation with user feedback.
     */
    public void updateWithFeedback(Long recommendationId, String feedback) {
        log.debug("Updating venue recommendation {} with feedback: {}", recommendationId, feedback);
        
        VenueRecommendation recommendation = venueRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Venue recommendation not found"));
        
        // Update status based on feedback
        if ("click".equalsIgnoreCase(feedback)) {
            recommendation.setStatus(VenueRecommendation.RecommendationStatus.CLICKED);
            recommendation.setClickedAt(java.time.OffsetDateTime.now());
        } else if ("book".equalsIgnoreCase(feedback)) {
            recommendation.setStatus(VenueRecommendation.RecommendationStatus.BOOKED);
            recommendation.setBookedVenue(true);
        }
        
        venueRecommendationRepository.save(recommendation);
    }

    /**
     * Get total recommendations generated.
     */
    public long getTotalRecommendationsGenerated() {
        return venueRecommendationRepository.count();
    }

    /**
     * Map entity to DTO.
     */
    private VenueRecommendationDTO mapToDTO(VenueRecommendation recommendation) {
        return new VenueRecommendationDTO(
                recommendation.getId(),
                mapVenueToResponse(recommendation.getRecommendedVenue()),
                recommendation.getRecommendationScore(),
                recommendation.getReason(),
                recommendation.getStatus(),
                recommendation.getAiModelVersion(),
                recommendation.getCreatedAt()
        );
    }

    /**
     * Map venue entity to response DTO (simplified for now).
     */
    private com.bmessi.pickupsportsapp.dto.venue.VenueResponse mapVenueToResponse(com.bmessi.pickupsportsapp.entity.Venue venue) {
        return new com.bmessi.pickupsportsapp.dto.venue.VenueResponse(
                venue.getId(),
                venue.getName(),
                venue.getDescription(),
                venue.getAddress(),
                venue.getCity(),
                venue.getState(),
                venue.getCountry(),
                venue.getPostalCode(),
                venue.getLatitude(),
                venue.getLongitude(),
                venue.getVenueType(),
                venue.getMaxCapacity(),
                venue.getMinCapacity(),
                venue.getStatus(),
                venue.getBasePricePerHour(),
                venue.getBasePricePerPlayer(),
                venue.getIsVerified(),
                venue.getOwnerId(),
                venue.getContactPhone(),
                venue.getContactEmail(),
                venue.getWebsiteUrl(),
                venue.getCreatedAt(),
                venue.getUpdatedAt(),
                java.util.Set.of(), // supportedSports - empty set for now
                java.util.List.of(), // amenities - empty list for now
                java.util.List.of(), // businessHours - empty list for now
                java.util.List.of()  // images - empty list for now
        );
    }
}
