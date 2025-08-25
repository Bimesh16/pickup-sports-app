package com.bmessi.pickupsportsapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class StatusController {

    @Value("${app.version:1.0.0}")
    private String version;

    @GetMapping("/status")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.AppStatusResponse> status() {
        HttpHeaders headers = com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
        return ResponseEntity.ok()
                .headers(headers)
                .body(new com.bmessi.pickupsportsapp.dto.api.AppStatusResponse(
                        "Pickup Sports API", version, "ok", Instant.now().toEpochMilli()
                ));
    }
}
