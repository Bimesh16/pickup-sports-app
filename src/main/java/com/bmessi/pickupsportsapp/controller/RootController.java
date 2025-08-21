// src/main/java/com/bmessi/pickupsportsapp/web/RootController.java
package com.bmessi.pickupsportsapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
    @GetMapping("/")
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("Pickup Sports API is running");
    }
}
