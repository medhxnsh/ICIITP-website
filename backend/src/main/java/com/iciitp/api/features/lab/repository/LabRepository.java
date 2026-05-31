package com.iciitp.api.features.lab.repository;

import com.iciitp.api.features.lab.entity.Lab;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabRepository extends JpaRepository<Lab, String> {
    List<Lab> findAllByOrderBySlugAsc();
    Optional<Lab> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
