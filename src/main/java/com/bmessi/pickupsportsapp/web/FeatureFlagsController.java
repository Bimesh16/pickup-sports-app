package com.bmessi.pickupsportsapp.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

import com.bmessi.pickupsportsapp.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/config")
@Tag(name = "Config")
@RequiredArgsConstructor
public class FeatureFlagsController {

    private final FeatureFlagService flags;

    @Value("${app.env:dev}")
    private String env;

    @Operation(summary = "Return environment and feature flags for the frontend boot sequence")
    @GetMapping("/flags")
    public ResponseEntity<FeatureFlagsResponse> flags(Principal principal) {
        String user = principal != null ? principal.getName() : null;
        boolean recommend = flags.isEnabled("recommend", user);
        boolean chatEnabled = flags.isEnabled("chat", user);
        return ResponseEntity.ok(new FeatureFlagsResponse(env, recommend, chatEnabled));
    }
}
