package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.security.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@Profile("dev")
@RequiredArgsConstructor
@RequestMapping("/api/dev")
public class DevTokenController {

    private final JwtTokenService jwt;

    @GetMapping("/token")
    public Map<String, String> token(@RequestParam String sub,
                                     @RequestParam(required = false) String roles,
                                     @RequestParam(required = false) String email) {
        Map<String, Object> claims = new HashMap<>();
        if (roles != null && !roles.isBlank()) {
            claims.put("roles", Arrays.stream(roles.split(",")).map(String::trim).toList());
        }
        if (email != null && !email.isBlank()) {
            claims.put("email", email);
        }
        String token = jwt.generateWithClaims(sub, claims);
        return Map.of("token", token);
    }
}
