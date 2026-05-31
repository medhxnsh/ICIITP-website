package com.iciitp.api.features.notification.repository;

import com.iciitp.api.features.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Notification> findByPublishedTrueOrderByCreatedAtDesc();
    List<Notification> findByCategoryAndPublishedTrueOrderByCreatedAtDesc(String category);
    Optional<Notification> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
