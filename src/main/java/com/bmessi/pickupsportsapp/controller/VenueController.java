package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.VenueService;
import com.bmessi.pickupsportsapp.service.VenueService.VenueSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
@CrossOrigin(origins = "*")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping("/nearby")
    public ResponseEntity<List<VenueSummary>> getNearbyVenues(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm) {
        try {
            List<VenueSummary> venues = venueService.getNearbyVenues(latitude, longitude, radiusKm);
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<VenueSummary> getVenueDetails(@PathVariable Long venueId) {
        try {
            VenueSummary venue = venueService.getVenueDetails(venueId);
            return ResponseEntity.ok(venue);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<VenueSummary>> searchVenues(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<VenueSummary> venues = venueService.searchVenues(query, page, size);
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<VenueSummary>> getTopRatedVenues(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<VenueSummary> venues = venueService.getTopRatedVenues(limit);
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}