package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.SavedSearchRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedSearchService {

    private final SavedSearchRepository repo;
    private final UserRepository users;

    @Transactional
    public SavedSearchEntity create(String username, SavedSearchEntity req) {
        User u = users.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
        req.setId(null);
        req.setUser(u);
        return repo.save(req);
    }

    @Transactional(readOnly = true)
    public List<SavedSearchEntity> list(String username) {
        return repo.findByUser_Username(username);
    }

    @Transactional
    public SavedSearchEntity update(String username, Long id, SavedSearchEntity updates) {
        SavedSearchEntity existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        if (!existing.getUser().getUsername().equals(username)) {
            throw new IllegalArgumentException("forbidden");
        }
        if (updates.getSport() != null) existing.setSport(updates.getSport());
        if (updates.getLocation() != null) existing.setLocation(updates.getLocation());
        if (updates.getRadiusKm() != null) existing.setRadiusKm(updates.getRadiusKm());
        return repo.save(existing);
    }

    @Transactional
    public void delete(String username, Long id) {
        SavedSearchEntity existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        if (!existing.getUser().getUsername().equals(username)) {
            throw new IllegalArgumentException("forbidden");
        }
        repo.delete(existing);
    }
}
