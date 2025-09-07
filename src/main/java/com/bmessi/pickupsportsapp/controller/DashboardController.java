package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.DashboardService;
import com.bmessi.pickupsportsapp.service.DashboardService.DashboardSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getDashboardSummary(Authentication authentication) {
        try {
            String userId = authentication.getName();
            DashboardSummary summary = dashboardService.getDashboardSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
