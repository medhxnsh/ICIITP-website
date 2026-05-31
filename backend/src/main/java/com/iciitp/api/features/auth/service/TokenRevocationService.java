package com.iciitp.api.features.auth.service;

import com.iciitp.api.features.auth.entity.RevokedToken;
import com.iciitp.api.features.auth.repository.RevokedTokenRepository;
import com.iciitp.api.shared.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class TokenRevocationService {

    private final RevokedTokenRepository repo;
    private final JwtUtil jwtUtil;

    public void revoke(String token) {
        if (token == null || token.isBlank()) return;
        try {
            Claims claims = jwtUtil.extractClaims(token);
            String jti = claims.getId();
            if (jti == null || repo.existsByJti(jti)) return;
            Date exp = claims.getExpiration();
            LocalDateTime expiresAt = exp != null
                ? exp.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                : LocalDateTime.now().plusDays(8);
            repo.save(RevokedToken.builder().jti(jti).expiresAt(expiresAt).build());
        } catch (JwtException | IllegalArgumentException ignored) {
            // already invalid — nothing to revoke
        }
    }

    public boolean isRevoked(String jti) {
        return jti != null && repo.existsByJti(jti);
    }

    @Scheduled(cron = "0 0 * * * *")
    public void purgeExpired() {
        repo.deleteExpiredBefore(LocalDateTime.now());
    }
}
