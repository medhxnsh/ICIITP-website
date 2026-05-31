package com.iciitp.api.features.submission.service;

import com.iciitp.api.features.auth.entity.LoginAttempt;
import com.iciitp.api.features.auth.repository.LoginAttemptRepository;
import com.iciitp.api.shared.exception.RateLimitException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SubmissionRateLimiter {

    private final LoginAttemptRepository attemptRepo;

    // Allow 5 submissions per IP per hour — enough for a real applicant, blocks spam
    private static final int MAX_PER_HOUR = 5;
    private static final int WINDOW_MINUTES = 60;

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "incubation", "lab-access", "internship", "feedback", "careers", "contact"
    );

    public void validateType(String type) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException(
                "Invalid submission type. Allowed: " + String.join(", ", ALLOWED_TYPES));
        }
    }

    @Transactional
    public void checkAndRecord(String ip) {
        long count = attemptRepo.countByIpAndAttemptedAtAfter(
                "sub:" + ip, LocalDateTime.now().minusMinutes(WINDOW_MINUTES));
        if (count >= MAX_PER_HOUR) throw new RateLimitException();

        attemptRepo.save(LoginAttempt.builder()
                .ip("sub:" + ip)
                .attemptedAt(LocalDateTime.now())
                .build());
    }

    // Purge old submission attempt records every hour
    @Scheduled(fixedDelay = 60 * 60 * 1000L)
    @Transactional
    public void purgeOld() {
        attemptRepo.deleteOlderThan(LocalDateTime.now().minusMinutes(WINDOW_MINUTES));
    }
}
