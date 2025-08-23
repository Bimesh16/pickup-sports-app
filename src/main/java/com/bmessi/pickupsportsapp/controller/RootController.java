// src/main/java/com/bmessi/pickupsportsapp/web/RootController.java
package com.bmessi.pickupsportsapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
    @GetMapping("/")
    public ResponseEntity<String> root() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "public, max-age=60");
        headers.add(HttpHeaders.LAST_MODIFIED, java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(java.time.ZoneOffset.UTC)
                .format(java.time.Instant.now()));
        return ResponseEntity.ok()
                .headers(headers)
                .body("Pickup Sports API is running");
    }
}
