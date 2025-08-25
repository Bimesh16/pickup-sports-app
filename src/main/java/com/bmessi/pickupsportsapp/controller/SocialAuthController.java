package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.service.AuthService;
import com.bmessi.pickupsportsapp.service.SocialAuthService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.Map;

@RestController
@RequestMapping("/auth/oauth2")
@RequiredArgsConstructor
public class SocialAuthController {

    private final java.util.Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter;

    private final SocialAuthService social;
    private final AuthService auth;

    public record SocialTokenRequest(@NotBlank String provider, @NotBlank String token) {}

    @PostMapping("/token")
    public ResponseEntity<?> exchange(@RequestBody SocialTokenRequest req, jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            String ip = httpRequest != null ? httpRequest.getRemoteAddr() : "";
            String provider = (req.provider() == null ? "" : req.provider());
            String key = "oauth2:exchange:" + provider + ":" + ip;
            // Limit to 30 requests per minute per provider+IP
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow(key, 30, 60)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS, "Please try again later");
            }
        } catch (Exception ignore) {}
        String username = social.loginOrLink(req.provider(), req.token());
        if (username == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid social token");
        }
        TokenPairResponse pair = auth.issueTokensForAuthenticatedUser(username);
        return ResponseEntity.ok().headers(noStore()).body(pair);
    }

    
}
