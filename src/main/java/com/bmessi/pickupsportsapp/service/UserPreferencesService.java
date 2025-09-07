package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserNotificationPrefs;
import com.bmessi.pickupsportsapp.entity.UserPaymentSettings;
import com.bmessi.pickupsportsapp.entity.UserSportsPreferences;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.UserNotificationPrefsRepository;
import com.bmessi.pickupsportsapp.repository.UserPaymentSettingsRepository;
import com.bmessi.pickupsportsapp.repository.UserSportsPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserPreferencesService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNotificationPrefsRepository notificationPrefsRepository;

    @Autowired
    private UserPaymentSettingsRepository paymentSettingsRepository;

    @Autowired
    private UserSportsPreferencesRepository sportsPreferencesRepository;

    public UserNotificationPrefs getNotificationPreferences(String userId) {
        User user = userRepository.findByUsername(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return notificationPrefsRepository.findByUserUsername(userId)
            .orElseGet(() -> {
                UserNotificationPrefs prefs = UserNotificationPrefs.defaults(user);
                return notificationPrefsRepository.save(prefs);
            });
    }

    public UserNotificationPrefs updateNotificationPreferences(String userId, UserNotificationPrefs prefs) {
        UserNotificationPrefs existing = getNotificationPreferences(userId);
        existing.setGameInvites(prefs.isGameInvites());
        existing.setGameUpdates(prefs.isGameUpdates());
        existing.setAchievements(prefs.isAchievements());
        existing.setSocialActivity(prefs.isSocialActivity());
        existing.setMarketing(prefs.isMarketing());
        existing.setPushNotifications(prefs.isPushNotifications());
        existing.setEmailNotifications(prefs.isEmailNotifications());
        return notificationPrefsRepository.save(existing);
    }

    public UserPaymentSettings getPaymentSettings(String userId) {
        User user = userRepository.findByUsername(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return paymentSettingsRepository.findByUserUsername(userId)
            .orElseGet(() -> {
                UserPaymentSettings settings = new UserPaymentSettings();
                settings.setUser(user);
                settings.setCountry("NP"); // Default to Nepal
                settings.setCurrency("NPR");
                return paymentSettingsRepository.save(settings);
            });
    }

    public UserPaymentSettings updatePaymentSettings(String userId, UserPaymentSettings settings) {
        UserPaymentSettings existing = getPaymentSettings(userId);
        existing.setCountry(settings.getCountry());
        existing.setCurrency(settings.getCurrency());
        existing.setPaymentMethods(settings.getPaymentMethods());
        return paymentSettingsRepository.save(existing);
    }

    public UserSportsPreferences getSportsPreferences(String userId) {
        User user = userRepository.findByUsername(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return sportsPreferencesRepository.findByUserUsername(userId)
            .orElseGet(() -> {
                UserSportsPreferences prefs = new UserSportsPreferences();
                prefs.setUser(user);
                prefs.setDefaultCricketFormat("T20");
                return sportsPreferencesRepository.save(prefs);
            });
    }

    public UserSportsPreferences updateSportsPreferences(String userId, UserSportsPreferences prefs) {
        UserSportsPreferences existing = getSportsPreferences(userId);
        existing.setDefaultCricketFormat(prefs.getDefaultCricketFormat());
        return sportsPreferencesRepository.save(existing);
    }
}
