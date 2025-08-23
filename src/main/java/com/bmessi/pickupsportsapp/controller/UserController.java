package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.CreateUserRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.service.UserService;
import com.bmessi.pickupsportsapp.service.IdempotencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final IdempotencyService idempotencyService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody CreateUserRequest request,
                                            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                            @RequestHeader(value = "Prefer", required = false) String prefer) {
        // Normalize headers
        String idem = (idempotencyKey == null || idempotencyKey.isBlank()) ? null : idempotencyKey.trim();
        boolean preferMinimal = prefer != null && prefer.toLowerCase().contains("return=minimal");

        // If idempotency key provided and we have a recorded result for this username+key, replay
        if (idem != null) {
            var existing = idempotencyService.get(request.username(), idem);
            if (existing.isPresent()) {
                HttpHeaders headers = noStoreHeaders();
                headers.add("Preference-Applied", "return=minimal");
                return ResponseEntity.ok().headers(headers).build();
            }
        }

        // First-time registration
        UserDTO user = userService.register(request);

        // Record idempotency mapping for future replays
        if (idem != null && user != null && user.id() != null) {
            idempotencyService.put(request.username(), idem, user.id());
        }

        HttpHeaders headers = noStoreHeaders();
        URI location = URI.create("/users/" + (user != null && user.id() != null ? user.id() : ""));
        if (preferMinimal) {
            headers.add("Preference-Applied", "return=minimal");
            return ResponseEntity.created(location).headers(headers).build();
        }
        return ResponseEntity.created(location).headers(headers).body(user);
    }

    private static HttpHeaders noStoreHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, "no-store");
        h.add(HttpHeaders.PRAGMA, "no-cache");
        return h;
    }
}