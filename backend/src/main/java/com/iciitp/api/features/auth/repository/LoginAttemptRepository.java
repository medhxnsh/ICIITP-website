package com.iciitp.api.features.auth.repository;

import com.iciitp.api.features.auth.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, String> {

    long countByIpAndAttemptedAtAfter(String ip, LocalDateTime since);

    @Modifying
    @Transactional
    @Query("DELETE FROM LoginAttempt a WHERE a.ip = :ip")
    void deleteByIp(@Param("ip") String ip);

    @Modifying
    @Transactional
    @Query("DELETE FROM LoginAttempt a WHERE a.attemptedAt < :before")
    void deleteOlderThan(@Param("before") LocalDateTime before);
}
