package com.iciitp.api.features.startup.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iciitp.api.features.startup.entity.Startup;
import com.iciitp.api.features.startup.repository.StartupRepository;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository repo;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public Page<Map<String, Object>> findAll(String scheme, Pageable pageable) {
        Page<Startup> page = scheme != null
            ? repo.findBySchemeOrderBySortOrderAscNameAsc(scheme, pageable)
            : repo.findAllByOrderBySortOrderAscNameAsc(pageable);
        return page.map(this::toMap);
    }

    public List<Map<String, Object>> findPublished(String scheme) {
        List<Startup> list = scheme != null
            ? repo.findByPublishedTrueAndSchemeOrderBySortOrderAscNameAsc(scheme)
            : repo.findByPublishedTrueOrderBySortOrderAscNameAsc();
        return list.stream().map(this::toMap).toList();
    }

    public Map<String, Object> findById(String id) {
        return toMap(repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Startup not found: " + id)));
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> data) {
        return toMap(repo.save(mapToEntity(new Startup(), data)));
    }

    @Transactional
    public Map<String, Object> update(String id, Map<String, Object> data) {
        Startup s = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Startup not found: " + id));
        return toMap(repo.save(mapToEntity(s, data)));
    }

    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Startup not found: " + id);
        repo.deleteById(id);
    }

    @Transactional
    public Map<String, Object> bulkImport(List<Map<String, Object>> rows) {
        int created = 0, skipped = 0;
        for (Map<String, Object> row : rows) {
            String name = str(row, "name");
            String scheme = str(row, "scheme");
            if (name == null || scheme == null) { skipped++; continue; }
            if (repo.existsByNameAndScheme(name, scheme)) { skipped++; continue; }
            repo.save(mapToEntity(new Startup(), row));
            created++;
        }
        return Map.of("created", created, "skipped", skipped);
    }

    @SuppressWarnings("unchecked")
    private Startup mapToEntity(Startup s, Map<String, Object> d) {
        if (d.get("name") instanceof String v) s.setName(v);
        if (d.get("scheme") instanceof String v) s.setScheme(v);
        if (d.get("tagline") instanceof String v) s.setTagline(v);
        if (d.get("website") instanceof String v) s.setWebsite(v.isBlank() ? null : v);
        if (d.get("logoUrl") instanceof String v) s.setLogoUrl(v.isBlank() ? null : v);
        if (d.containsKey("published")) s.setPublished(Boolean.TRUE.equals(d.get("published")));
        if (d.get("sortOrder") instanceof Number n) s.setSortOrder(n.intValue());

        if (d.get("sectors") instanceof List<?> list) {
            s.setSectorsJson(toJson(list.stream().map(Object::toString).toList()));
        }
        if (d.get("founders") instanceof List<?> list) {
            s.setFoundersJson(toJson(list.stream().map(Object::toString).toList()));
        }
        return s;
    }

    private Map<String, Object> toMap(Startup s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("name", s.getName());
        m.put("scheme", s.getScheme());
        m.put("tagline", s.getTagline());
        m.put("sectors", fromJson(s.getSectorsJson()));
        m.put("founders", fromJson(s.getFoundersJson()));
        m.put("website", s.getWebsite());
        m.put("logoUrl", s.getLogoUrl());
        m.put("published", s.isPublished());
        m.put("sortOrder", s.getSortOrder());
        m.put("createdAt", s.getCreatedAt());
        m.put("updatedAt", s.getUpdatedAt());
        return m;
    }

    private String toJson(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try { return MAPPER.writeValueAsString(list); } catch (JsonProcessingException e) { return null; }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return MAPPER.readValue(json, new TypeReference<>() {}); } catch (JsonProcessingException e) { return List.of(); }
    }

    private String str(Map<String, Object> d, String key) {
        Object v = d.get(key);
        return v instanceof String s && !s.isBlank() ? s : null;
    }
}
