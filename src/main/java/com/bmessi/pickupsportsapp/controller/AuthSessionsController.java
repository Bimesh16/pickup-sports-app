package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.auth.RefreshToken;
import com.bmessi.pickupsportsapp.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.bmessi.pickupsportsapp.dto.SessionDTO;
import com.bmessi.pickupsportsapp.dto.api.UpdatedResponse;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

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
    public ResponseEntity<List<SessionDTO>> list(Principal principal) {
        List<RefreshToken> rows = repo.findByUser_UsernameAndRevokedAtIsNull(principal.getName());
        List<SessionDTO> items = rows.stream()
                .map(rt -> new SessionDTO(
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
    @Transactional
    public ResponseEntity<UpdatedResponse> revokeOne(@PathVariable Long id, Principal principal) {
        List<RefreshToken> rows = repo.findByUser_UsernameAndRevokedAtIsNull(principal.getName());
        RefreshToken target = rows.stream().filter(r -> r.getId().equals(id)).findFirst().orElse(null);
        if (target == null) {
            return ResponseEntity.status(404).headers(noStore()).build();
        }
        target.setRevokedAt(Instant.now());
        repo.save(target);
        return ResponseEntity.ok().headers(noStore()).body(new UpdatedResponse(1));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<UpdatedResponse> revokeAll(Principal principal) {
        List<RefreshToken> rows = repo.findByUser_UsernameAndRevokedAtIsNull(principal.getName());
        int count = 0;
        for (RefreshToken rt : rows) {
            rt.setRevokedAt(Instant.now());
            repo.save(rt);
            count++;
        }
        return ResponseEntity.ok().headers(noStore()).body(new UpdatedResponse(count));
    }

    
}
