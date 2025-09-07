package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.AnalyticsService;
import com.bmessi.pickupsportsapp.service.AnalyticsService.UserAnalytics;
import com.bmessi.pickupsportsapp.service.AnalyticsService.EventSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/user")
    public ResponseEntity<UserAnalytics> getUserAnalytics(Authentication authentication) {
        try {
            String username = authentication.getName();
            UserAnalytics analytics = analyticsService.getUserAnalytics(username);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventSummary>> getEventHistory(
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            List<EventSummary> events = analyticsService.getEventHistory(username, eventType, page, size);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/track")
    public ResponseEntity<Void> trackEvent(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            String eventType = request.get("eventType").toString();
            String eventCategory = request.get("eventCategory").toString();
            String eventAction = request.get("eventAction").toString();
            String eventLabel = request.get("eventLabel").toString();
            Long eventValue = request.get("eventValue") != null ? Long.valueOf(request.get("eventValue").toString()) : null;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> properties = (Map<String, Object>) request.get("properties");
            
            analyticsService.trackEvent(username, eventType, eventCategory, eventAction, eventLabel, eventValue, properties);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        try {
            Map<String, Object> metrics = analyticsService.getDashboardMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
