package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.UserNotificationPrefs;
import com.bmessi.pickupsportsapp.repository.UserNotificationPrefsRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserNotificationPrefsService {

    private final UserNotificationPrefsRepository repo;
    private final UserRepository users;

    @Timed("prefs.get")
    @Transactional(readOnly = true)
    public UserNotificationPrefs getOrDefaults(String username) {
        User user = users.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
        return repo.findByUser_Id(user.getId()).orElse(UserNotificationPrefs.defaults(user));
    }

    @Timed("prefs.put")
    @Transactional
    public UserNotificationPrefs update(String username, UserNotificationPrefs incoming) {
        User user = users.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
        UserNotificationPrefs current = repo.findByUser_Id(user.getId()).orElse(UserNotificationPrefs.defaults(user));
        current.setInAppOnRsvp(incoming.isInAppOnRsvp());
        current.setInAppOnCreate(incoming.isInAppOnCreate());
        current.setInAppOnCancel(incoming.isInAppOnCancel());
        current.setEmailOnRsvp(incoming.isEmailOnRsvp());
        current.setEmailOnCreate(incoming.isEmailOnCreate());
        current.setEmailOnCancel(incoming.isEmailOnCancel());
        // push channel
        current.setPushOnRsvp(incoming.isPushOnRsvp());
        current.setPushOnCreate(incoming.isPushOnCreate());
        current.setPushOnCancel(incoming.isPushOnCancel());
        current.setUser(user);
        return repo.save(current);
    }
}
