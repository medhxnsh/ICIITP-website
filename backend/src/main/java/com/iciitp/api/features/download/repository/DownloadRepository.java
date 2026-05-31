package com.iciitp.api.features.download.repository;

import com.iciitp.api.features.download.entity.Download;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DownloadRepository extends JpaRepository<Download, String> {
    Page<Download> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Download> findByPublishedTrueOrderByCreatedAtDesc();
    List<Download> findByDisplayPageAndPublishedTrueOrderByCreatedAtDesc(String displayPage);
}
