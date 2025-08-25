package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.TrustedDevice;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.TrustedDeviceRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrustedDeviceService {

    private final TrustedDeviceRepository repo;
    private final UserRepository users;

    @Value("${auth.mfa.trust-days:30}")
    private int trustDays;

    @Transactional(readOnly = true)
    public boolean isTrusted(String username, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) return false;
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        return repo.findByUser_IdAndDeviceId(u.getId(), deviceId)
                .map(TrustedDevice::isActive).orElse(false);
    }

    @Transactional
    public void trust(String username, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) return;
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        TrustedDevice td = repo.findByUser_IdAndDeviceId(u.getId(), deviceId)
                .orElse(TrustedDevice.builder().user(u).deviceId(deviceId).build());
        td.setTrustedUntil(Instant.now().plus(Math.max(1, trustDays), ChronoUnit.DAYS));
        repo.save(td);
    }

    @Transactional(readOnly = true)
    public List<TrustedDevice> list(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        return repo.findByUser_Id(u.getId());
    }

    @Transactional
    public void revoke(String username, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) return;
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        repo.deleteByUser_IdAndDeviceId(u.getId(), deviceId);
    }

    @Transactional
    public int revokeAll(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        return repo.deleteByUser_Id(u.getId());
    }
}
