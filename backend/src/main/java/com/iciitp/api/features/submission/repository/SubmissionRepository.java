package com.iciitp.api.features.submission.repository;

import com.iciitp.api.features.submission.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, String> {
    Page<Submission> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Submission> findByTypeOrderByCreatedAtDesc(String type, Pageable pageable);
}
