package com.iciitp.api.features.lab.controller;

import com.iciitp.api.features.lab.service.LabService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/labs")
@RequiredArgsConstructor
public class LabController {

    private final LabService service;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String slug) {
        return ResponseEntity.ok(service.findBySlug(slug));
    }

    @PatchMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable String slug,
            @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(service.update(slug, data));
    }
}
