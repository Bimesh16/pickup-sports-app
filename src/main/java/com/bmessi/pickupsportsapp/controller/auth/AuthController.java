package com.bmessi.pickupsportsapp.controller.auth;

import com.bmessi.pickupsportsapp.dto.auth.RefreshRequest;
import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.service.auth.AuthService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.Map;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.bmessi.pickupsportsapp.security.VelocityCheckService;
import com.bmessi.pickupsportsapp.security.CaptchaService;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final com.bmessi.pickupsportsapp.config.properties.RefreshCookieProperties cookieProps;
    private final com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties authProps;
    private final Optional<com.bmessi.pickupsportsapp.service.VerificationService> verificationService;
    private final Optional<com.bmessi.pickupsportsapp.service.PasswordResetService> passwordResetService;
    private final Optional<com.bmessi.pickupsportsapp.service.EmailService> emailService;
    private final com.bmessi.pickupsportsapp.security.LoginAttemptService loginAttemptService;
    private final com.bmessi.pickupsportsapp.security.SecurityAuditService securityAuditService;
    private final com.bmessi.pickupsportsapp.service.AdminAuditService adminAuditService;
    private final com.bmessi.pickupsportsapp.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.bmessi.pickupsportsapp.service.ChangeEmailService changeEmailService;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final java.util.Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter; // optional
    private final com.bmessi.pickupsportsapp.config.properties.LoginPolicyProperties loginPolicyProperties;
    private final com.bmessi.pickupsportsapp.service.MfaService mfaService;
    private final com.bmessi.pickupsportsapp.service.MfaChallengeService mfaChallengeService;
    private final com.bmessi.pickupsportsapp.service.TrustedDeviceService trustedDeviceService;
    private final VelocityCheckService velocityCheckService;
    private final CaptchaService captchaService;

    public AuthController(AuthService authService,
                         AuthenticationManager authenticationManager,
                         com.bmessi.pickupsportsapp.config.properties.RefreshCookieProperties cookieProps,
                         com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties authProps,
                         @Autowired(required = false) com.bmessi.pickupsportsapp.service.VerificationService verificationService,
                         @Autowired(required = false) com.bmessi.pickupsportsapp.service.PasswordResetService passwordResetService,
                         @Autowired(required = false) com.bmessi.pickupsportsapp.service.EmailService emailService,
                         com.bmessi.pickupsportsapp.security.LoginAttemptService loginAttemptService,
                         com.bmessi.pickupsportsapp.security.SecurityAuditService securityAuditService,
                         com.bmessi.pickupsportsapp.service.AdminAuditService adminAuditService,
                         com.bmessi.pickupsportsapp.repository.UserRepository userRepository,
                         org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                         com.bmessi.pickupsportsapp.service.ChangeEmailService changeEmailService,
                         io.micrometer.core.instrument.MeterRegistry meterRegistry,
                         java.util.Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter,
                         com.bmessi.pickupsportsapp.config.properties.LoginPolicyProperties loginPolicyProperties,
                         com.bmessi.pickupsportsapp.service.MfaService mfaService,
                         com.bmessi.pickupsportsapp.service.MfaChallengeService mfaChallengeService,
                         com.bmessi.pickupsportsapp.service.TrustedDeviceService trustedDeviceService,
                         VelocityCheckService velocityCheckService,
                         CaptchaService captchaService) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.cookieProps = cookieProps;
        this.authProps = authProps;
        this.verificationService = Optional.ofNullable(verificationService);
        this.passwordResetService = Optional.ofNullable(passwordResetService);
        this.emailService = Optional.ofNullable(emailService);
        this.loginAttemptService = loginAttemptService;
        this.securityAuditService = securityAuditService;
        this.adminAuditService = adminAuditService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.changeEmailService = changeEmailService;
        this.meterRegistry = meterRegistry;
        this.redisRateLimiter = redisRateLimiter;
        this.loginPolicyProperties = loginPolicyProperties;
        this.mfaService = mfaService;
        this.mfaChallengeService = mfaChallengeService;
        this.trustedDeviceService = trustedDeviceService;
        this.velocityCheckService = velocityCheckService;
        this.captchaService = captchaService;
    }

    @Operation(summary = "Authenticate a user and issue tokens")
    @PostMapping("/login")
    @RateLimiter(name = "auth")
    public ResponseEntity<?> login(
            @Valid
            @org.springframework.web.bind.annotation.RequestBody LoginRequest request,
            @Parameter(hidden = true) jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            log.debug("Login attempt for user: {}", request.username());

            // Redis-based rate limit guard (optional)
            try {
                String ip = httpRequest.getHeader("X-Forwarded-For");
                if (ip == null || ip.isBlank()) ip = httpRequest.getRemoteAddr();
                String uname = request.username() == null ? "" : request.username().toLowerCase();
                String key = "auth:login:" + uname + ":" + ip;
                int limit = (loginPolicyProperties != null) ? loginPolicyProperties.getRequestsPerIpPerMinute() : 60;
                if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow(key, Math.max(1, limit), 60)) {
                    return ResponseEntity.status(429)
                            .headers(noStore())
                            .body(Map.of(
                                    "error", "too_many_requests",
                                    "message", "Please try again later",
                                    "timestamp", System.currentTimeMillis()
                            ));
                }

                // In-memory velocity check and CAPTCHA gate
                String velocityKey = "auth:login:" + uname + ":" + ip;
                boolean allowed = velocityCheckService.incrementAndCheck(velocityKey, 10, 60_000);
                if (!allowed) {
                    String captchaToken = httpRequest.getHeader("X-Captcha-Token");
                    if (!captchaService.verify(captchaToken)) {
                        securityAuditService.suspiciousActivity("auth_velocity", velocityKey);
                        return ResponseEntity.status(429)
                                .headers(noStore())
                                .body(Map.of(
                                        "error", "too_many_requests",
                                        "captchaRequired", true,
                                        "message", "Please complete CAPTCHA",
                                        "timestamp", System.currentTimeMillis()
                                ));
                    }
                }
            } catch (Exception ignore) {}

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            String username = authentication.getName();
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                username = userDetails.getUsername();
            }

            // Enforce verification if required (skip if verification service is not available)
            if (authProps.isVerificationRequired() && verificationService.isPresent() && !verificationService.get().isVerified(username)) {
                return ResponseEntity.status(403)
                        .headers(noStore())
                        .body(Map.of(
                                "error", "email_unverified",
                                "message", "Please verify your email before logging in",
                                "timestamp", System.currentTimeMillis()
                        ));
            }

            String deviceId = httpRequest.getHeader("X-Device-Id");
            String userAgent = httpRequest.getHeader("User-Agent");
            String ip = httpRequest.getHeader("X-Forwarded-For");
            if (ip == null || ip.isBlank()) ip = httpRequest.getRemoteAddr();

            boolean isAdmin = authentication.getAuthorities() != null &&
                    authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));

            // MFA gate: enforce for admins when policy enabled, or when user enabled MFA and device is not trusted
            try {
                boolean requireAdminMfa = loginPolicyProperties != null && Boolean.TRUE.equals(loginPolicyProperties.isRequireMfaForAdmin());
                boolean deviceTrusted = trustedDeviceService.isTrusted(username, deviceId);
                boolean mfaEnabled = mfaService.isEnabled(username);

                if ((requireAdminMfa && isAdmin && (!mfaEnabled || !deviceTrusted)) ||
                        (mfaEnabled && !deviceTrusted)) {
                    String challenge = mfaChallengeService.create(username);
                    return ResponseEntity.ok()
                            .headers(noStore())
                            .body(Map.of(
                                    "mfaRequired", true,
                                    "methods", java.util.List.of("TOTP"),
                                    "challenge", challenge,
                                    "timestamp", System.currentTimeMillis()
                            ));
                }

                // If admin and policy requires MFA but bypassed due to trusted device, audit it
                if (requireAdminMfa && isAdmin && mfaEnabled && deviceTrusted) {
                    try {
                        String details = "ip=" + ip + "; ua=" + userAgent + "; deviceId=" + deviceId;
                        adminAuditService.record(username, "admin_login_without_mfa", "user", null, details);
                    } catch (Exception ignore) {}
                }
            } catch (Exception ignore) {}

            TokenPairResponse tokens = authService.issueTokensForAuthenticatedUser(username);
            // Persist refresh metadata if cookie-less (request body) is used on refresh; for login, metadata is saved in storeRefresh invoked inside service

            log.debug("Login successful");
            HttpHeaders headers = noStore();
            // Issue refresh cookie if enabled
            if (cookieProps.isEnabled()) {
                headers.add(HttpHeaders.SET_COOKIE, buildRefreshCookie(tokens.refreshToken(), false, httpRequest));
            }
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(tokens);

        } catch (BadCredentialsException e) {
            log.debug("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "invalid_grant",
                            "message", "Invalid username or password",
                            "timestamp", System.currentTimeMillis()
                    ));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "internal_server_error",
                            "message", "Authentication failed",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
    }

    @Operation(summary = "Refresh access and refresh tokens")
    @PostMapping("/refresh")
    @RateLimiter(name = "auth")
    public ResponseEntity<?> refresh(
            @Valid
            @org.springframework.web.bind.annotation.RequestBody RefreshRequest request,
            @Parameter(description = "Refresh token from cookie")
            @CookieValue(name = "refreshToken", required = false) String refreshCookie,
            @Parameter(hidden = true) jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            String provided = (request != null && request.refreshToken() != null && !request.refreshToken().isBlank())
                    ? request.refreshToken()
                    : refreshCookie;

            if (provided == null || provided.isBlank()) {
                return ResponseEntity.status(400)
                        .headers(noStore())
                        .body(Map.of(
                                "error", "invalid_request",
                                "message", "Missing refresh token (body or cookie 'refreshToken')",
                                "timestamp", System.currentTimeMillis()
                        ));
            }

            String nonce = (request != null && request.nonce() != null && !request.nonce().isBlank())
                    ? request.nonce()
                    : httpRequest.getHeader("X-Refresh-Nonce");

            if (nonce == null || nonce.isBlank()) {
                return ResponseEntity.status(400)
                        .headers(noStore())
                        .body(Map.of(
                                "error", "invalid_request",
                                "message", "Missing refresh nonce (header 'X-Refresh-Nonce' or body field 'nonce')",
                                "timestamp", System.currentTimeMillis()
                        ));
            }

            String tokenPreview = provided.substring(0, Math.min(10, provided.length())) + "...";
            log.debug("Token refresh attempt with refresh token: {}", tokenPreview);

            TokenPairResponse tokens = authService.refresh(provided, nonce);
            // Note: refresh rotation stores new refresh; metadata capture can be added in service when needed
            log.debug("Token refresh successful");
            HttpHeaders headers = noStore();
            if (cookieProps.isEnabled()) {
                headers.add(HttpHeaders.SET_COOKIE, buildRefreshCookie(tokens.refreshToken(), false, httpRequest));
            }
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(tokens);

        } catch (BadCredentialsException e) {
            log.debug("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "invalid_token",
                            "message", "Invalid or expired refresh token",
                            "timestamp", System.currentTimeMillis()
                    ));
        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "internal_server_error",
                            "message", "Token refresh failed",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
    }

    @Operation(summary = "Invalidate refresh token and logout")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @Valid
            @org.springframework.web.bind.annotation.RequestBody RefreshRequest request) {
        try {
            log.debug("Logout attempt");
            authService.logout(request.refreshToken());
            log.debug("Logout successful");
        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage());
            // Intentionally returning 200 for logout regardless
        }
        HttpHeaders headers = noStore();
        // Help clients clear local caches/storage if they opt-in to using cookies/local storage
        headers.add("Clear-Site-Data", "\"cache\", \"storage\"");
        return ResponseEntity.ok()
                .headers(headers)
                .body(Map.of(
                        "message", "Logout completed",
                        "timestamp", System.currentTimeMillis()
                ));
    }

    

    private String buildRefreshCookie(String value, boolean delete, jakarta.servlet.http.HttpServletRequest req) {
        String name = cookieProps.getName();
        String path = cookieProps.getPath();
        String domain = cookieProps.getDomain();
        String sameSite = cookieProps.getSameSite();
        boolean httpOnly = cookieProps.isHttpOnly();
        int maxAge = delete ? 0 : Math.max(0, cookieProps.getMaxAgeDays() * 24 * 60 * 60);

        boolean secure = cookieProps.getSecure() != null
                ? cookieProps.getSecure()
                : (req.isSecure() || "https".equalsIgnoreCase(req.getHeader("X-Forwarded-Proto")));

        StringBuilder sb = new StringBuilder();
        sb.append(name).append("=").append(delete ? "" : value).append("; ")
                .append("Path=").append(path).append("; ");
        if (domain != null && !domain.isBlank()) {
            sb.append("Domain=").append(domain).append("; ");
        }
        sb.append("SameSite=").append(sameSite).append("; ");
        if (secure) sb.append("Secure; ");
        if (httpOnly) sb.append("HttpOnly; ");
        sb.append("Max-Age=").append(maxAge);
        return sb.toString().trim();
    }

    @Operation(summary = "Return information about the current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(hidden = true) org.springframework.security.core.Authentication auth) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank() || auth == null) {
            return ResponseEntity.status(401)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "unauthorized",
                            "message", "Authentication required",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
        java.util.List<String> roles = auth.getAuthorities() == null
                ? java.util.List.of()
                : auth.getAuthorities().stream()
                    .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                    .sorted()
                    .toList();

        return ResponseEntity.ok()
                .headers(noStore())
                .body(Map.of(
                        "username", principal.getName(),
                        "roles", roles,
                        "authenticated", auth.isAuthenticated(),
                        "timestamp", System.currentTimeMillis()
                ));
    }

    // DTOs for the login endpoint
    public record LoginRequest(
            @NotBlank @Size(max = 255) String username,
            @NotBlank @Size(max = 255) String password
    ) {}
}