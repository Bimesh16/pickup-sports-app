package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.MfaRecoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth/mfa/recovery")
@RequiredArgsConstructor
public class MfaRecoveryController {

    private final MfaRecoveryService service;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.CodesResponse> list(Principal principal) {
        List<String> masked = service.listMasked(principal.getName());
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.CodesResponse(masked, masked.size()));
    }

    public record RegenerateRequest(Integer count) {}

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.CodesResponse> regenerate(@RequestBody(required = false) RegenerateRequest body,
                                                                                       Principal principal) {
        int count = body != null && body.count() != null ? body.count() : 10;
        List<String> plain = service.regenerate(principal.getName(), count);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.CodesResponse(plain, plain.size()));
    }

    private static HttpHeaders noStore() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
