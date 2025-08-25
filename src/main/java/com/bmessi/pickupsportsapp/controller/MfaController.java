package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.MfaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/auth/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final MfaService mfa;

    @PostMapping("/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.EnrollResponse> enroll(Principal principal) {
        String secret = mfa.enroll(principal.getName());
        String uri = mfa.provisioningUri("Pickup Sports", principal.getName());
        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(new com.bmessi.pickupsportsapp.dto.api.EnrollResponse(secret, uri));
    }

    @PostMapping("/enable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> enable(Principal principal, @RequestBody Map<String, Object> body) {
        String code = body != null ? String.valueOf(body.getOrDefault("code", "")) : "";
        if (!mfa.verify(principal.getName(), code)) {
            return ResponseEntity.status(400).headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("invalid_code"));
        }
        mfa.enable(principal.getName());
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.EnabledResponse(true));
    }

    @PostMapping("/disable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.EnabledResponse> disable(Principal principal) {
        mfa.disable(principal.getName());
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.EnabledResponse(false));
    }

    // Deprecated: use AuthMfaChallengeController /auth/mfa/verify
    @PostMapping("/verify-code")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ValidResponse> verify(Principal principal, @RequestBody Map<String, Object> body) {
        String code = body != null ? String.valueOf(body.getOrDefault("code", "")) : "";
        boolean ok = mfa.verify(principal.getName(), code);
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.ValidResponse(ok));
    }

    private static HttpHeaders noStoreHeaders() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
