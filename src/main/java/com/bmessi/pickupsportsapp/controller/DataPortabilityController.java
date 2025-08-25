package com.bmessi.pickupsportsapp.controller;

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

    @GetMapping("/export")
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "exports")
    public ResponseEntity<Map<String, Object>> export(Principal principal) {
        Map<String, Object> data = exportService.exportFor(principal.getName());
        HttpHeaders h = com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
        h.add("Content-Disposition", "attachment; filename=\"userdata-" + principal.getName() + "-" + Instant.now().toEpochMilli() + ".json\"");
        h.setContentType(MediaType.APPLICATION_JSON);
        return ResponseEntity.ok().headers(h).body(data);
    }
}
