package com.iciitp.api.features.submission.controller;

import com.iciitp.api.features.auth.dto.StatusRequest;
import com.iciitp.api.features.submission.entity.Submission;
import com.iciitp.api.features.submission.service.SubmissionRateLimiter;
import com.iciitp.api.features.submission.service.SubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService service;
    private final SubmissionRateLimiter rateLimiter;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Submission>> list(
        @RequestParam(required = false) String type,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(type != null ? service.findByType(type, pageable) : service.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Submission> get(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping("/{type}")
    public ResponseEntity<Submission> create(
        @PathVariable String type,
        @RequestBody Map<String, Object> data,
        HttpServletRequest request
    ) {
        rateLimiter.validateType(type);
        rateLimiter.checkAndRecord(request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(type, data));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Submission> updateStatus(
        @PathVariable String id,
        @Valid @RequestBody StatusRequest request
    ) {
        return ResponseEntity.ok(service.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> export(@RequestParam(required = false) String type) {
        String csv = service.exportCsv(type);
        String filename = "submissions-" + (type != null ? type : "all") + "-"
            + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
            .body(csv);
    }
}
