package com.iciitp.api.features.auth.controller;

import com.iciitp.api.features.auth.dto.*;
import com.iciitp.api.features.auth.service.AuthService;
import com.iciitp.api.shared.email.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.login(request, ip));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest body) {
        return ResponseEntity.ok(authService.refresh(body.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        HttpServletRequest request,
        @RequestBody(required = false) Map<String, String> body
    ) {
        String authHeader = request.getHeader("Authorization");
        String accessToken  = authHeader != null && authHeader.startsWith("Bearer ")
            ? authHeader.substring(7) : null;
        String refreshToken = body != null ? body.get("refreshToken") : null;
        authService.logout(accessToken, refreshToken);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        String role = user.getAuthorities().stream()
            .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("");
        return ResponseEntity.ok(Map.of("email", user.getUsername(), "role", role));
    }

    // ── Forgot password (public) ───────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest req
    ) {
        // Always returns 200 to prevent email enumeration
        authService.sendOtp(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "If that account exists, an OTP has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
        @Valid @RequestBody OtpResetRequest req
    ) {
        authService.resetPasswordWithOtp(req.getEmail(), req.getOtp(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    // ── Change password (authenticated superAdmin) ─────────────────────────────

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
        @AuthenticationPrincipal UserDetails user,
        @Valid @RequestBody ChangePasswordRequest req
    ) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        authService.changePassword(user.getUsername(), req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    // ── Mail health (authenticated) ────────────────────────────────────────────

    @GetMapping("/mail-status")
    public ResponseEntity<Map<String, Object>> mailStatus(
        @AuthenticationPrincipal UserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        return ResponseEntity.ok(Map.of(
            "configured", emailService.isConfigured(),
            "recoveryEmail", emailService.getRecoveryEmail() != null ? emailService.getRecoveryEmail() : ""
        ));
    }
}
