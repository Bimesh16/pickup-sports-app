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
    public ResponseEntity<Map<String, Object>> status() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "no-store");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        return ResponseEntity.ok()
                .headers(headers)
                .body(Map.of(
                        "app", "Pickup Sports API",
                        "version", version,
                        "status", "ok",
                        "timestamp", Instant.now().toEpochMilli()
                ));
    }
}
