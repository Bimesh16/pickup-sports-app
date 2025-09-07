package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.SportsService;
import com.bmessi.pickupsportsapp.service.SportsService.SportSummary;
import com.bmessi.pickupsportsapp.service.SportsService.CountryInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sports")
@CrossOrigin(origins = "*")
public class SportsController {

    @Autowired
    private SportsService sportsService;

    @GetMapping
    public ResponseEntity<List<SportSummary>> getAvailableSports() {
        try {
            List<SportSummary> sports = sportsService.getAvailableSports();
            return ResponseEntity.ok(sports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<List<SportSummary>> getPopularSports() {
        try {
            List<SportSummary> sports = sportsService.getPopularSports();
            return ResponseEntity.ok(sports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/countries")
    public ResponseEntity<List<CountryInfo>> getSupportedCountries() {
        try {
            List<CountryInfo> countries = sportsService.getSupportedCountries();
            return ResponseEntity.ok(countries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/detect-country")
    public ResponseEntity<CountryInfo> detectCountry(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        try {
            CountryInfo country = sportsService.detectCountry(latitude, longitude);
            return ResponseEntity.ok(country);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}