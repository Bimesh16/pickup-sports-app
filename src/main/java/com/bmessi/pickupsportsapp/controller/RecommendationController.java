package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.RecommendationService;
import com.bmessi.pickupsportsapp.service.RecommendationService.RecommendationSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<RecommendationSummary>> getRecommendations(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            List<RecommendationSummary> recommendations = recommendationService.getRecommendations(username, limit);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/personalized")
    public ResponseEntity<List<RecommendationSummary>> getPersonalizedRecommendations(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            List<RecommendationSummary> recommendations = recommendationService.getPersonalizedRecommendations(username, type, limit);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{recommendationId}/click")
    public ResponseEntity<Void> trackClick(
            @PathVariable Long recommendationId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            recommendationService.trackRecommendationClick(recommendationId, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{recommendationId}/view")
    public ResponseEntity<Void> trackView(
            @PathVariable Long recommendationId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            recommendationService.trackRecommendationView(recommendationId, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
