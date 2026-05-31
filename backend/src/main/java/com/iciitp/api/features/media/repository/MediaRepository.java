package com.iciitp.api.features.media.repository;

import com.iciitp.api.features.media.entity.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, String> {
    Page<Media> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsByFilename(String filename);
    java.util.Optional<Media> findByFilename(String filename);
}
