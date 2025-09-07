package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.UserNavigationPrefs;
import com.bmessi.pickupsportsapp.service.UserNavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/navigation")
@CrossOrigin(origins = "*")
public class NavigationPreferencesController {

    @Autowired
    private UserNavigationService navigationService;

    @GetMapping("/preferences")
    public ResponseEntity<UserNavigationPrefs> getNavigationPreferences(Authentication authentication) {
        try {
            String username = authentication.getName();
            UserNavigationPrefs prefs = navigationService.getNavigationPreferences(username);
            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserNavigationPrefs> updateNavigationPreferences(
            @RequestBody UserNavigationPrefs prefs,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            UserNavigationPrefs updatedPrefs = navigationService.updateNavigationPreferences(username, prefs);
            return ResponseEntity.ok(updatedPrefs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/preferences")
    public ResponseEntity<Void> deleteNavigationPreferences(Authentication authentication) {
        try {
            String username = authentication.getName();
            navigationService.deleteNavigationPreferences(username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
