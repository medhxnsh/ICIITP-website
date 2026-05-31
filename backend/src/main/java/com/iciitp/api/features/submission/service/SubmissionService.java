package com.iciitp.api.features.submission.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iciitp.api.features.submission.entity.Submission;
import com.iciitp.api.shared.email.EmailService;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import com.iciitp.api.features.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository repo;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    public Page<Submission> findAll(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Submission> findByType(String type, Pageable pageable) {
        return repo.findByTypeOrderByCreatedAtDesc(type, pageable);
    }

    public Submission findById(String id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + id));
    }

    @Transactional
    public Submission create(String type, Map<String, Object> data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            Submission saved = repo.save(Submission.builder().type(type).data(json).status("pending").build());
            emailService.sendSubmissionNotification(type, data);
            return saved;
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid submission data");
        }
    }

    @Transactional
    public Submission updateStatus(String id, String status) {
        Submission s = findById(id);
        s.setStatus(status);
        return repo.save(s);
    }

    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Submission not found: " + id);
        repo.deleteById(id);
    }

    public String exportCsv(String type) {
        // export uses unpaginated fetch via JpaRepository directly — intentional full-table read for CSV
        java.util.List<Submission> submissions = type == null
            ? repo.findAll()
            : repo.findByTypeOrderByCreatedAtDesc(type, org.springframework.data.domain.Pageable.unpaged()).getContent();
        StringBuilder csv = new StringBuilder("ID,Type,Status,Date,Data\r\n");
        for (Submission s : submissions) {
            csv.append(escape(s.getId())).append(",")
               .append(escape(s.getType())).append(",")
               .append(escape(s.getStatus())).append(",")
               .append(escape(s.getCreatedAt().toString())).append(",")
               .append(escape(s.getData())).append("\r\n");
        }
        return csv.toString();
    }

    private String escape(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }
}
