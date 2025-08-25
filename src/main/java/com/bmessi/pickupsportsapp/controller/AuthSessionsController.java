package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.RefreshToken;
import com.bmessi.pickupsportsapp.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth/sessions")
@RequiredArgsConstructor
public class AuthSessionsController {

    private final RefreshTokenRepository repo;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<com.bmessi.pickupsportsapp.dto.SessionDTO>> list(Principal principal) {
        List<RefreshToken> rows = repo.findByUser_UsernameAndRevokedAtIsNull(principal.getName());
        List<com.bmessi.pickupsportsapp.dto.SessionDTO> items = rows.stream()
                .map(rt -> new com.bmessi.pickupsportsapp.dto.SessionDTO(
                        rt.getId(),
                        rt.getDeviceId(),
                        rt.getUserAgent(),
                        rt.getIssuedIp(),
                        rt.getCreatedAt(),
                        rt.getLastUsedAt(),
                        rt.getExpiresAt()
                )).toList();
        return ResponseEntity.ok().headers(noStore()).body(items);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UpdatedResponse> revokeOne(@PathVariable Long id, Principal principal) {
        List<RefreshToken> rows = repo.findByUser_UsernameAndRevokedAtIsNull(principal.getName());
        RefreshToken target = rows.stream().filter(r -> r.getId().equals(id)).findFirst().orElse(null);
        if (target == null) {
            return ResponseEntity.status(404).headers(noStore()).build();
        }
        target.setRevokedAt(Instant.now());
        repo.save(target);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.UpdatedResponse(1));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UpdatedResponse> revokeAll(Principal principal) {
        List<RefreshToken> rows = repo.findByUser_UsernameAndRevokedAtIsNull(principal.getName());
        int count = 0;
        for (RefreshToken rt : rows) {
            rt.setRevokedAt(Instant.now());
            repo.save(rt);
            count++;
        }
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.UpdatedResponse(count));
    }

    private static HttpHeaders noStore() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
