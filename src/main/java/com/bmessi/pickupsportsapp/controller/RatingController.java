package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.RateUserRequest;
import com.bmessi.pickupsportsapp.dto.RatingDTO;
import com.bmessi.pickupsportsapp.dto.UserRatingSummaryDTO;
import com.bmessi.pickupsportsapp.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RatingDTO> rate(@Valid @RequestBody RateUserRequest request, Principal principal) {
        RatingDTO dto = ratingService.rateUser(principal.getName(), request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<UserRatingSummaryDTO> summary(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getSummary(userId));
    }

    @GetMapping("/users/{userId}/recent")
    public ResponseEntity<List<RatingDTO>> recent(@PathVariable Long userId,
                                                  @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ratingService.getRecentRatings(userId, limit));
    }
}