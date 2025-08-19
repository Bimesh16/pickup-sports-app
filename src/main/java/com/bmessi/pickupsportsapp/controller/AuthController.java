package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.auth.RefreshRequest;
import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.debug("Login attempt for user: {}", request.username());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            String username = authentication.getName();
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                username = userDetails.getUsername();
            }

            TokenPairResponse tokens = authService.issueTokensForAuthenticatedUser(username);

            log.debug("Login successful");
            return ResponseEntity.ok(tokens);

        } catch (BadCredentialsException e) {
            log.debug("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "error", "invalid_grant",
                            "message", "Invalid username or password",
                            "timestamp", System.currentTimeMillis()
                    ));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "error", "internal_server_error",
                            "message", "Authentication failed",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest request) {
        try {
            String tokenPreview = request.refreshToken() != null
                    ? request.refreshToken().substring(0, Math.min(10, request.refreshToken().length())) + "..."
                    : "null";
            log.debug("Token refresh attempt with refresh token: {}", tokenPreview);

            TokenPairResponse tokens = authService.refresh(request.refreshToken());
            log.debug("Token refresh successful");
            return ResponseEntity.ok(tokens);

        } catch (BadCredentialsException e) {
            log.debug("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "error", "invalid_token",
                            "message", "Invalid or expired refresh token",
                            "timestamp", System.currentTimeMillis()
                    ));
        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "error", "internal_server_error",
                            "message", "Token refresh failed",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@Valid @RequestBody RefreshRequest request) {
        try {
            log.debug("Logout attempt");
            authService.logout(request.refreshToken());
            log.debug("Logout successful");
        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage());
            // Intentionally returning 200 for logout regardless
        }
        return ResponseEntity.ok(Map.of(
                "message", "Logout completed",
                "timestamp", System.currentTimeMillis()
        ));
    }

    // DTOs for the login endpoint
    public record LoginRequest(
            @NotBlank @Size(max = 255) String username,
            @NotBlank @Size(max = 255) String password
    ) {}
}