package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.auth.RefreshRequest;
import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import com.bmessi.pickupsportsapp.service.AuthService;
import jakarta.validation.Valid;
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
    private final JwtTokenService jwtTokenService;

    @PostMapping("/login")
    public ResponseEntity<TokenPairResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.debug("Login attempt for user: {}", request.username());

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            // Get username
            String username = authentication.getName();
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                username = userDetails.getUsername();
            }

            // Generate token pair through AuthService
            TokenPairResponse tokens = authService.issueTokensForAuthenticatedUser(username);

            log.debug("Login successful for user: {}", username);
            return ResponseEntity.ok(tokens);

        } catch (BadCredentialsException e) {
            log.debug("Login failed for user: {} - {}", request.username(), e.getMessage());
            throw new BadCredentialsException("Invalid username or password");
        } catch (Exception e) {
            log.error("Login error for user: {} - {}", request.username(), e.getMessage());
            throw new BadCredentialsException("Authentication failed");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenPairResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        try {
            log.debug("Token refresh attempt");
            TokenPairResponse tokens = authService.refresh(request.refreshToken());
            log.debug("Token refresh successful");
            return ResponseEntity.ok(tokens);
        } catch (BadCredentialsException e) {
            log.debug("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(401).body(null);
        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody RefreshRequest request) {
        try {
            log.debug("Logout attempt");
            authService.logout(request.refreshToken());
            log.debug("Logout successful");
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("message", "Logout completed")); // Always return success for logout
        }
    }

    // DTOs for the login endpoint
    public record LoginRequest(@Valid String username, @Valid String password) {}
}