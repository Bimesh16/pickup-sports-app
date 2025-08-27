package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.FeatureFlag;
import com.bmessi.pickupsportsapp.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

@RestController
@RequestMapping("/admin/feature-flags")
@RequiredArgsConstructor
public class FeatureFlagAdminController {

    private final FeatureFlagService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeatureFlag>> list() {
        return ResponseEntity.ok().headers(noStore()).body(service.findAll());
    }

    public record UpdateFlagRequest(boolean enabled, int rolloutPercentage) {}

    @PutMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeatureFlag> update(@PathVariable String name, @RequestBody UpdateFlagRequest req) {
        FeatureFlag flag = service.updateFlag(name, req.enabled(), req.rolloutPercentage());
        return ResponseEntity.ok().headers(noStore()).body(flag);
    }
}
