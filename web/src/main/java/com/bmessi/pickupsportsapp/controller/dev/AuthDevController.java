package com.bmessi.pickupsportsapp.controller.dev;

import com.bmessi.pickupsportsapp.security.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/dev/auth")
@Profile("dev")
@RequiredArgsConstructor
public class AuthDevController {

    private final JwtTokenService jwt;

    // POST /dev/auth/token  body: {"sub":"alice"}  -> {"token":"..."}
    @PostMapping(path = "/token", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> token(@RequestBody Map<String, String> body) {
        String subject = Optional.ofNullable(body.get("sub")).filter(s -> !s.isBlank()).orElse("demo-user");
        return Map.of("token", jwt.generate(subject));
    }

    // GET /dev/auth/token?sub=alice -> {"token":"..."}
    @GetMapping(path = "/token", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> tokenGet(@RequestParam(defaultValue = "demo-user") String sub) {
        return Map.of("token", jwt.generate(sub));
    }
}
