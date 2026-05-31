package com.iciitp.api.features.auth.service;

import com.iciitp.api.features.auth.dto.LoginRequest;
import com.iciitp.api.features.auth.dto.AuthResponse;
import com.iciitp.api.features.auth.entity.LoginAttempt;
import com.iciitp.api.features.auth.entity.PasswordResetToken;
import com.iciitp.api.features.auth.entity.User;
import com.iciitp.api.features.auth.repository.LoginAttemptRepository;
import com.iciitp.api.features.auth.repository.PasswordResetTokenRepository;
import com.iciitp.api.features.auth.repository.UserRepository;
import com.iciitp.api.shared.email.EmailService;
import com.iciitp.api.shared.exception.RateLimitException;
import com.iciitp.api.shared.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository resetTokenRepo;
    private final EmailService emailService;
    private final TokenRevocationService tokenRevocationService;
    private final LoginAttemptRepository loginAttemptRepo;

    private static final int MAX_ATTEMPTS = 5;
    private static final int WINDOW_MINUTES = 15;

    public AuthResponse login(LoginRequest request, String ip) {
        checkRateLimit(ip);

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> {
                recordFailedAttempt(ip);
                return new BadCredentialsException("Invalid credentials");
            });

        if (!user.isActive()) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            recordFailedAttempt(ip);
            throw new BadCredentialsException("Invalid credentials");
        }

        clearAttempts(ip);

        String accessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.isSuperAdmin(), user.getPermissions());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken, user.getEmail(),
            user.getRole().name(), user.isSuperAdmin(), user.getPermissions());
    }

    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadCredentialsException("No refresh token provided");
        }
        if (!jwtUtil.isValid(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
        io.jsonwebtoken.Claims claims = jwtUtil.extractClaims(refreshToken);
        if (!"refresh".equals(claims.get("type"))) {
            throw new BadCredentialsException("Invalid token type");
        }
        if (tokenRevocationService.isRevoked(claims.getId())) {
            throw new BadCredentialsException("Refresh token has been revoked");
        }

        String email = claims.getSubject();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account deactivated");
        }

        // Revoke the consumed refresh token (rotation — prevents replay attacks)
        tokenRevocationService.revoke(refreshToken);

        String newAccessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.isSuperAdmin(), user.getPermissions());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return new AuthResponse(newAccessToken, newRefreshToken, user.getEmail(),
            user.getRole().name(), user.isSuperAdmin(), user.getPermissions());
    }

    public void logout(String accessToken, String refreshToken) {
        tokenRevocationService.revoke(accessToken);
        tokenRevocationService.revoke(refreshToken);
    }

    // ── Forgot password (superAdmin only) ─────────────────────────────────────

    @Transactional
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        // Always return success to avoid email enumeration
        if (user == null || !user.isSuperAdmin()) return;

        // Clean up expired tokens for this email first
        resetTokenRepo.deleteExpired(LocalDateTime.now());

        // Throttle: if a valid token was issued in the last 2 minutes, don't send another
        resetTokenRepo.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
            .filter(t -> t.getCreatedAt() != null
                && t.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(2)))
            .ifPresent(t -> { throw new RateLimitException(); });

        String otp = generateOtp();
        resetTokenRepo.save(PasswordResetToken.builder()
            .email(email)
            .otp(passwordEncoder.encode(otp))
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .build());

        emailService.sendOtp(otp);
    }

    @Transactional
    public void resetPasswordWithOtp(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid or expired OTP"));

        if (!user.isSuperAdmin()) {
            throw new BadCredentialsException("Invalid or expired OTP");
        }

        PasswordResetToken token = resetTokenRepo
            .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid or expired OTP"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("OTP has expired");
        }

        if (!passwordEncoder.matches(otp, token.getOtp())) {
            throw new BadCredentialsException("Invalid OTP");
        }

        token.setUsed(true);
        resetTokenRepo.save(token);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Change password (authenticated superAdmin) ─────────────────────────────

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isSuperAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(1_000_000));
    }

    private void checkRateLimit(String ip) {
        long count = loginAttemptRepo.countByIpAndAttemptedAtAfter(
                ip, LocalDateTime.now().minusMinutes(WINDOW_MINUTES));
        if (count >= MAX_ATTEMPTS) throw new RateLimitException();
    }

    private void recordFailedAttempt(String ip) {
        loginAttemptRepo.save(LoginAttempt.builder()
                .ip(ip)
                .attemptedAt(LocalDateTime.now())
                .build());
    }

    private void clearAttempts(String ip) {
        loginAttemptRepo.deleteByIp(ip);
    }

    // Purge attempts older than the rate-limit window every 30 minutes
    @Scheduled(fixedDelay = 30 * 60 * 1000L)
    @Transactional
    public void purgeOldAttempts() {
        loginAttemptRepo.deleteOlderThan(LocalDateTime.now().minusMinutes(WINDOW_MINUTES));
    }
}
