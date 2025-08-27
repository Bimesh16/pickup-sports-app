package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.DataDeletionService;
import com.bmessi.pickupsportsapp.service.DataExportService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class DataPortabilityController {

    private final DataExportService exportService;
    private final DataDeletionService deletionService;

    @PostMapping("/export")
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "exports")
    public Map<String, String> requestExport(Principal principal) {
        String token = exportService.requestExport(principal.getName());
        return Map.of("token", token);
    }

    @GetMapping("/export/{token}")
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "exports")
    public ResponseEntity<Map<String, Object>> confirmExport(@PathVariable String token, Principal principal) {
        Map<String, Object> data = exportService.confirmExport(principal.getName(), token);
        HttpHeaders h = com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
        h.add("Content-Disposition", "attachment; filename=\"userdata-" + principal.getName() + "-" + Instant.now().toEpochMilli() + ".json\"");
        h.setContentType(MediaType.APPLICATION_JSON);
        return ResponseEntity.ok().headers(h).body(data);
    }

    @PostMapping("/delete")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> requestDeletion(Principal principal) {
        String token = deletionService.requestDeletion(principal.getName());
        return Map.of("token", token);
    }

    @DeleteMapping("/delete/{token}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> confirmDeletion(@PathVariable String token, Principal principal) {
        deletionService.confirmDeletion(principal.getName(), token);
        return ResponseEntity.noContent().build();
    }
}
