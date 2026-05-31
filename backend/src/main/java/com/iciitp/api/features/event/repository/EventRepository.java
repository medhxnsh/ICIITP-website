package com.iciitp.api.features.event.repository;

import com.iciitp.api.features.event.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, String> {
    Page<Event> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Event> findByPublishedTrueOrderByCreatedAtDesc();
    Optional<Event> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
