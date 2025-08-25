package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.PushSubscription;
import com.bmessi.pickupsportsapp.service.PushSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/push/subscriptions")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionService service;

    public record SaveRequest(String endpoint, String p256dh, String auth) {}

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.IdResponse> save(@RequestBody SaveRequest req, Principal principal) {
        if (req == null || req.endpoint() == null || req.endpoint().isBlank()) {
            return ResponseEntity.status(400).headers(noStore()).build();
        }
        PushSubscription saved = service.save(principal.getName(), req.endpoint(), req.p256dh(), req.auth());
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.IdResponse(saved.getId()));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<com.bmessi.pickupsportsapp.dto.PushSubscriptionItemDTO>> list(Principal principal) {
        List<com.bmessi.pickupsportsapp.dto.PushSubscriptionItemDTO> items = service.list(principal.getName()).stream()
                .map(s -> new com.bmessi.pickupsportsapp.dto.PushSubscriptionItemDTO(s.getEndpoint(), s.getCreatedAt()))
                .toList();
        return ResponseEntity.ok().headers(noStore()).body(items);
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.StatusResponse> delete(@RequestParam String endpoint, Principal principal) {
        service.delete(principal.getName(), endpoint);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.StatusResponse("deleted"));
    }

    
}
