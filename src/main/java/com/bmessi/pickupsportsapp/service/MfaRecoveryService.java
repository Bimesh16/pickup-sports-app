package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.MfaRecoveryCode;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.MfaRecoveryCodeRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MfaRecoveryService {

    private final MfaRecoveryCodeRepository repo;
    private final UserRepository users;
    private final MeterRegistry meterRegistry;

    private static final SecureRandom RNG = new SecureRandom();

    @Transactional(readOnly = true)
    public List<String> listMasked(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        return repo.findByUser_IdAndConsumedAtIsNull(u.getId())
                .stream()
                .map(code -> maskHash(code.getCodeHash()))
                .toList();
    }

    @Transactional
    public List<String> regenerate(String username, int count) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        repo.deleteByUser_Id(u.getId());
        int n = Math.max(6, Math.min(count, 20));
        java.util.ArrayList<String> plain = new java.util.ArrayList<>(n);
        for (int i = 0; i < n; i++) {
            String code = generatePlainCode();
            String hash = sha256(code);
            repo.save(MfaRecoveryCode.builder().user(u).codeHash(hash).build());
            plain.add(code);
        }
        try { meterRegistry.counter("mfa.recovery.regenerated").increment(); } catch (Exception ignore) {}
        return plain;
    }

    @Transactional
    public boolean consume(String code) {
        if (code == null || code.isBlank()) return false;
        String hash = sha256(code);
        var opt = repo.findByCodeHashAndConsumedAtIsNull(hash);
        if (opt.isEmpty()) return false;
        var row = opt.get();
        row.setConsumedAt(Instant.now());
        repo.save(row);
        try { meterRegistry.counter("mfa.recovery.consumed").increment(); } catch (Exception ignore) {}
        return true;
    }

    private static String generatePlainCode() {
        // 12-character URL-safe: 72 bits entropy
        byte[] buf = new byte[9];
        RNG.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    private static String maskHash(String hash) {
        if (hash == null || hash.length() < 8) return "********";
        return "****" + hash.substring(hash.length() - 8);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot hash value", e);
        }
    }
}
