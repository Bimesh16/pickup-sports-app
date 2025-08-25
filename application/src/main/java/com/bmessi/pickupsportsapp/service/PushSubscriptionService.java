package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.PushSubscription;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.PushSubscriptionRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

    private final PushSubscriptionRepository repo;
    private final UserRepository users;

    @Transactional
    public PushSubscription save(String username, String endpoint, String p256dh, String auth) {
        if (endpoint == null || endpoint.isBlank()) {
            throw new IllegalArgumentException("endpoint required");
        }
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        PushSubscription sub = repo.findByEndpoint(endpoint).orElse(PushSubscription.builder().user(u).endpoint(endpoint).build());
        sub.setP256dh(p256dh);
        sub.setAuth(auth);
        return repo.save(sub);
    }

    @Transactional(readOnly = true)
    public List<PushSubscription> list(String username) {
        return repo.findByUser_Username(username);
    }

    @Transactional
    public void delete(String username, String endpoint) {
        repo.deleteByUser_UsernameAndEndpoint(username, endpoint);
    }
}
