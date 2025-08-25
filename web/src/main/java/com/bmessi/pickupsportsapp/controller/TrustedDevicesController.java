package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.TrustedDevice;
import com.bmessi.pickupsportsapp.service.TrustedDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/auth/mfa/trusted-devices")
@RequiredArgsConstructor
public class TrustedDevicesController {

    private final TrustedDeviceService service;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<com.bmessi.pickupsportsapp.dto.TrustedDeviceDTO>> list(Principal principal) {
        List<TrustedDevice> rows = service.list(principal.getName());
        List<com.bmessi.pickupsportsapp.dto.TrustedDeviceDTO> out = rows.stream()
                .map(td -> new com.bmessi.pickupsportsapp.dto.TrustedDeviceDTO(
                        td.getDeviceId(),
                        td.getTrustedUntil(),
                        td.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok().headers(noStore()).body(out);
    }

    @DeleteMapping("/{deviceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.StatusResponse> revoke(@PathVariable String deviceId, Principal principal) {
        service.revoke(principal.getName(), deviceId);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.StatusResponse("revoked"));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UpdatedResponse> revokeAll(Principal principal) {
        int n = service.revokeAll(principal.getName());
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.UpdatedResponse(n));
    }

    
}
