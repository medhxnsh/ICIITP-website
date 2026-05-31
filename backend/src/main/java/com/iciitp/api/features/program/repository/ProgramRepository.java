package com.iciitp.api.features.program.repository;

import com.iciitp.api.features.program.entity.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProgramRepository extends JpaRepository<Program, String> {
    Page<Program> findAllByOrderByUpdatedAtDesc(Pageable pageable);
    List<Program> findByPublishedTrueOrderByUpdatedAtDesc();
    List<Program> findByPublishedTrueAndSectionOrderByUpdatedAtDesc(Program.Section section);
    Optional<Program> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
