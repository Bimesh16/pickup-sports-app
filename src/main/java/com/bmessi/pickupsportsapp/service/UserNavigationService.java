package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserNavigationPrefs;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.UserNavigationPrefsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserNavigationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNavigationPrefsRepository navigationPrefsRepository;

    public UserNavigationPrefs getNavigationPreferences(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return navigationPrefsRepository.findByUserUsername(username)
            .orElseGet(() -> {
                UserNavigationPrefs prefs = UserNavigationPrefs.defaults(user);
                return navigationPrefsRepository.save(prefs);
            });
    }

    public UserNavigationPrefs updateNavigationPreferences(String username, UserNavigationPrefs prefs) {
        UserNavigationPrefs existing = getNavigationPreferences(username);
        
        if (prefs.getPreferredLayout() != null) {
            existing.setPreferredLayout(prefs.getPreferredLayout());
        }
        if (prefs.getShowTabLabels() != null) {
            existing.setShowTabLabels(prefs.getShowTabLabels());
        }
        if (prefs.getTabAnimationSpeed() != null) {
            existing.setTabAnimationSpeed(prefs.getTabAnimationSpeed());
        }
        if (prefs.getEnableHapticFeedback() != null) {
            existing.setEnableHapticFeedback(prefs.getEnableHapticFeedback());
        }
        if (prefs.getEnableRTL() != null) {
            existing.setEnableRTL(prefs.getEnableRTL());
        }
        if (prefs.getPreferredLanguage() != null) {
            existing.setPreferredLanguage(prefs.getPreferredLanguage());
        }
        if (prefs.getThemePreference() != null) {
            existing.setThemePreference(prefs.getThemePreference());
        }
        if (prefs.getHighContrast() != null) {
            existing.setHighContrast(prefs.getHighContrast());
        }
        if (prefs.getReducedMotion() != null) {
            existing.setReducedMotion(prefs.getReducedMotion());
        }
        
        return navigationPrefsRepository.save(existing);
    }

    public void deleteNavigationPreferences(String username) {
        navigationPrefsRepository.deleteByUserUsername(username);
    }
}
