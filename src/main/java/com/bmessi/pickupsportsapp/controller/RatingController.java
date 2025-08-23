package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.RateUserRequest;
import com.bmessi.pickupsportsapp.dto.RatingDTO;
import com.bmessi.pickupsportsapp.dto.UserRatingSummaryDTO;
import com.bmessi.pickupsportsapp.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
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
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "no-store");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<UserRatingSummaryDTO> summary(@PathVariable Long userId) {
        UserRatingSummaryDTO body = ratingService.getSummary(userId);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=60");
        return ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/users/{userId}/recent")
    public ResponseEntity<List<RatingDTO>> recent(@PathVariable Long userId,
                                                  @RequestParam(defaultValue = "10") int limit) {
        int eff = Math.max(1, Math.min(limit, 100));
        List<RatingDTO> body = ratingService.getRecentRatings(userId, eff);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        return ResponseEntity.ok().headers(headers).body(body);
    }
}