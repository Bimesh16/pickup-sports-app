package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.AbuseReport;
import com.bmessi.pickupsportsapp.service.AbuseReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/abuse-reports")
@RequiredArgsConstructor
public class AbuseReportController {

    private final AbuseReportService service;

    public record CreateRequest(@NotNull AbuseReport.SubjectType subjectType,
                                @NotNull Long subjectId,
                                @NotBlank String reason) {}

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@Valid @RequestBody CreateRequest req, Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ResponseEntity.status(401).headers(noStoreHeaders()).body(Map.of(
                    "error", "unauthorized",
                    "message", "Authentication required",
                    "timestamp", System.currentTimeMillis()
            ));
        }
        AbuseReport r = service.create(principal.getName(), req.subjectType(), req.subjectId(), req.reason());
        return ResponseEntity.ok().headers(noStoreHeaders())
                .body(new com.bmessi.pickupsportsapp.dto.api.AbuseReportResponse(
                        r.getId(), r.getStatus().name(), r.getCreatedAt(), r.getResolvedAt(), r.getResolver()
                ));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AbuseReport>> list(@RequestParam(required = false) AbuseReport.Status status, Pageable pageable) {
        Page<AbuseReport> page = service.list(status, pageable);
        return ResponseEntity.ok().headers(noStoreHeaders()).body(page);
    }

    public record UpdateStatusRequest(@NotNull AbuseReport.Status status) {}

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.AbuseReportResponse> updateStatus(@PathVariable Long id,
                                                                                                @Valid @RequestBody UpdateStatusRequest req,
                                                                                                Principal principal) {
        String resolver = principal != null ? principal.getName() : "system";
        AbuseReport r = service.updateStatus(id, req.status(), resolver);
        return ResponseEntity.ok().headers(noStoreHeaders())
                .body(new com.bmessi.pickupsportsapp.dto.api.AbuseReportResponse(
                        r.getId(), r.getStatus().name(), r.getCreatedAt(), r.getResolvedAt(), r.getResolver()
                ));
    }

    private static HttpHeaders noStoreHeaders() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
