package com.bmessi.pickupsportsapp.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/config")
@Tag(name = "Config")
public class FeatureFlagsController {

    @Value("${app.env:dev}")
    private String env;

    @Value("${features.recommend:false}")
    private boolean recommend;

    @Value("${features.chat.enabled:true}")
    private boolean chatEnabled;

    @Operation(summary = "Return environment and feature flags for the frontend boot sequence")
    @GetMapping("/flags")
    public ResponseEntity<FeatureFlagsResponse> flags() {
        return ResponseEntity.ok(new FeatureFlagsResponse(env, recommend, chatEnabled));
    }
}
