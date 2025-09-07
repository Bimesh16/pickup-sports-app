package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.UserNotificationPrefs;
import com.bmessi.pickupsportsapp.entity.UserPaymentSettings;
import com.bmessi.pickupsportsapp.entity.UserSportsPreferences;
import com.bmessi.pickupsportsapp.service.UserPreferencesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profiles/me")
@CrossOrigin(origins = "*")
public class UserPreferencesController {

    @Autowired
    private UserPreferencesService userPreferencesService;

    // Notification Preferences
    @GetMapping("/notification-prefs")
    public ResponseEntity<UserNotificationPrefs> getNotificationPreferences(Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserNotificationPrefs prefs = userPreferencesService.getNotificationPreferences(userId);
            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/notification-prefs")
    public ResponseEntity<UserNotificationPrefs> updateNotificationPreferences(
            @RequestBody UserNotificationPrefs prefs, 
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserNotificationPrefs updated = userPreferencesService.updateNotificationPreferences(userId, prefs);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Payment Settings
    @GetMapping("/payment-settings")
    public ResponseEntity<UserPaymentSettings> getPaymentSettings(Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserPaymentSettings settings = userPreferencesService.getPaymentSettings(userId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/payment-settings")
    public ResponseEntity<UserPaymentSettings> updatePaymentSettings(
            @RequestBody UserPaymentSettings settings, 
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserPaymentSettings updated = userPreferencesService.updatePaymentSettings(userId, settings);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Sports Preferences
    @GetMapping("/sports-preferences")
    public ResponseEntity<UserSportsPreferences> getSportsPreferences(Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserSportsPreferences prefs = userPreferencesService.getSportsPreferences(userId);
            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/sports-preferences")
    public ResponseEntity<UserSportsPreferences> updateSportsPreferences(
            @RequestBody UserSportsPreferences prefs, 
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserSportsPreferences updated = userPreferencesService.updateSportsPreferences(userId, prefs);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
