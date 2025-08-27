package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.FeatureFlag;
import com.bmessi.pickupsportsapp.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {
    private final FeatureFlagRepository repo;

    public boolean isEnabled(String name, String userId) {
        FeatureFlag flag = repo.findById(name).orElse(null);
        if (flag == null || !flag.isEnabled()) return false;
        int pct = flag.getRolloutPercentage();
        if (pct >= 100) return true;
        if (pct <= 0) return false;
        if (userId == null || userId.isBlank()) {
            return ThreadLocalRandom.current().nextInt(100) < pct;
        }
        int bucket = Math.abs(userId.hashCode() % 100);
        return bucket < pct;
    }

    public List<FeatureFlag> findAll() {
        return repo.findAll();
    }

    public FeatureFlag updateFlag(String name, boolean enabled, int rolloutPercentage) {
        FeatureFlag flag = repo.findById(name).orElse(new FeatureFlag(name, false, 0));
        flag.setEnabled(enabled);
        flag.setRolloutPercentage(rolloutPercentage);
        return repo.save(flag);
    }
}
