package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class DataDeletionService {

    private final UserRepository users;
    private final Map<String, String> pending = new ConcurrentHashMap<>();

    public String requestDeletion(String username) {
        String token = UUID.randomUUID().toString();
        pending.put(token, username);
        return token;
    }

    @Transactional
    public void confirmDeletion(String username, String token) {
        String stored = pending.remove(token);
        if (stored == null || !stored.equals(username)) {
            throw new IllegalArgumentException("invalid token");
        }
        users.deleteByUsername(username);
    }
}
