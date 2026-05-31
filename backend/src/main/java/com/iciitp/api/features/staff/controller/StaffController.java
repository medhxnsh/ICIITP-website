package com.iciitp.api.features.staff.controller;

import com.iciitp.api.features.staff.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService service;

    // ── Public ───────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(service.getAllSectionsWithMembers());
    }

    // ── Sections (admin) ─────────────────────────────────────────────────────────

    @PostMapping("/sections")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createSection(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSection(data));
    }

    @PutMapping("/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateSection(
            @PathVariable String id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(service.updateSection(id, data));
    }

    @DeleteMapping("/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSection(@PathVariable String id) {
        service.deleteSection(id);
        return ResponseEntity.noContent().build();
    }

    // ── Members (admin) ──────────────────────────────────────────────────────────

    @PostMapping("/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createMember(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createMember(data));
    }

    @PutMapping("/members/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateMember(
            @PathVariable String id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(service.updateMember(id, data));
    }

    @DeleteMapping("/members/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMember(@PathVariable String id) {
        service.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
