package com.iciitp.api.features.startup.repository;

import com.iciitp.api.features.startup.entity.Startup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StartupRepository extends JpaRepository<Startup, String> {
    Page<Startup> findAllByOrderBySortOrderAscNameAsc(Pageable pageable);
    Page<Startup> findBySchemeOrderBySortOrderAscNameAsc(String scheme, Pageable pageable);
    List<Startup> findByPublishedTrueOrderBySortOrderAscNameAsc();
    List<Startup> findByPublishedTrueAndSchemeOrderBySortOrderAscNameAsc(String scheme);
    boolean existsByNameAndScheme(String name, String scheme);
}
