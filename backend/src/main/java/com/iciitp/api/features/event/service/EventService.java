package com.iciitp.api.features.event.service;

import com.iciitp.api.features.event.entity.Event;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import com.iciitp.api.features.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository repo;

    private static final Set<String> BASE_KEYS = Set.of(
        "id", "slug", "title", "tagline", "description", "category",
        "status", "autoClose", "closingDate", "coverImageUrl", "applyUrl",
        "contact", "published", "customBadge", "createdAt", "updatedAt"
    );

    public Page<Map<String, Object>> findAll(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable).map(this::toMap);
    }

    public List<Map<String, Object>> findPublished() {
        return repo.findByPublishedTrueOrderByCreatedAtDesc().stream().map(this::toMap).toList();
    }

    public Map<String, Object> findById(String id) {
        return toMap(repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id)));
    }

    public Map<String, Object> findBySlug(String slug) {
        return toMap(repo.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + slug)));
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> data) {
        String slug = (String) data.get("slug");
        if (repo.existsBySlug(slug)) throw new IllegalArgumentException("Slug already in use: " + slug);
        Event e = mapToEntity(new Event(), data);
        return toMap(repo.save(e));
    }

    @Transactional
    public Map<String, Object> update(String id, Map<String, Object> data) {
        Event e = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        return toMap(repo.save(mapToEntity(e, data)));
    }

    @Transactional
    public Map<String, Object> upsertBySlug(String slug, Map<String, Object> data) {
        Event e = repo.findBySlug(slug).orElseGet(() -> {
            Event n = new Event();
            n.setTitle(slug); // satisfies NOT NULL; actual display title comes from static content file
            return n;
        });
        e.setSlug(slug);
        mapToEntity(e, data);
        if (e.getTitle() == null || e.getTitle().isBlank()) e.setTitle(slug);
        return toMap(repo.save(e));
    }

    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Event not found: " + id);
        repo.deleteById(id);
    }

    private Event mapToEntity(Event e, Map<String, Object> d) {
        if (d.get("slug") instanceof String s) e.setSlug(s);
        if (d.get("title") instanceof String s) e.setTitle(s);
        if (d.get("tagline") instanceof String s) e.setTagline(s);
        if (d.get("description") instanceof String s) e.setDescription(s);
        if (d.get("category") instanceof String s) e.setCategory(s);
        if (d.get("status") instanceof String s) e.setStatus(s);
        if (d.containsKey("autoClose")) e.setAutoClose(Boolean.TRUE.equals(d.get("autoClose")));
        if (d.get("coverImageUrl") instanceof String s) e.setCoverImageUrl(s);
        if (d.get("applyUrl") instanceof String s) e.setApplyUrl(s);
        if (d.get("contact") instanceof String s) e.setContact(s);
        if (d.containsKey("published")) e.setPublished(Boolean.TRUE.equals(d.get("published")));
        if (d.get("customBadge") instanceof String s) e.setCustomBadge(s);
        if (d.get("closingDate") instanceof String s && !s.isBlank()) {
            try {
                e.setClosingDate(s.length() <= 10
                    ? LocalDate.parse(s).atStartOfDay()
                    : LocalDateTime.parse(s.substring(0, 19)));
            } catch (DateTimeParseException ignored) {}
        } else if (d.containsKey("closingDate") && d.get("closingDate") == null) {
            e.setClosingDate(null);
        }

        Map<String, Object> extras = new HashMap<>(d);
        BASE_KEYS.forEach(extras::remove);
        e.setExtras(extras);

        return e;
    }

    private Map<String, Object> toMap(Event e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("slug", e.getSlug());
        m.put("title", e.getTitle());
        m.put("tagline", e.getTagline());
        m.put("description", e.getDescription());
        m.put("category", e.getCategory());
        m.put("status", e.getStatus());
        m.put("autoClose", e.isAutoClose());
        m.put("closingDate", e.getClosingDate());
        m.put("coverImageUrl", e.getCoverImageUrl());
        m.put("applyUrl", e.getApplyUrl());
        m.put("contact", e.getContact());
        m.put("published", e.isPublished());
        m.put("customBadge", e.getCustomBadge());
        m.put("createdAt", e.getCreatedAt());
        m.put("updatedAt", e.getUpdatedAt());
        if (e.getExtras() != null) m.putAll(e.getExtras());
        return m;
    }
}
