package com.iciitp.api.features.notification.service;

import com.iciitp.api.features.notification.entity.Notification;
import com.iciitp.api.features.notification.entity.NotificationAttachment;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import com.iciitp.api.features.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    public Page<Notification> findAll(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<Notification> findPublished() {
        return repo.findByPublishedTrueOrderByCreatedAtDesc();
    }

    public List<Notification> findByCategory(String category) {
        return repo.findByCategoryAndPublishedTrueOrderByCreatedAtDesc(category);
    }

    public Notification findById(String id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
    }

    public Notification findBySlug(String slug) {
        return repo.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + slug));
    }

    @Transactional
    public Notification create(Map<String, Object> data) {
        Notification n = mapToEntity(new Notification(), data);
        return repo.save(n);
    }

    @Transactional
    public Notification update(String id, Map<String, Object> data) {
        Notification n = findById(id);
        n.getAttachments().clear();
        mapToEntity(n, data);
        return repo.save(n);
    }

    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Notification not found: " + id);
        repo.deleteById(id);
    }

    @SuppressWarnings("unchecked")
    private Notification mapToEntity(Notification n, Map<String, Object> d) {
        if (d.containsKey("slug")) n.setSlug((String) d.get("slug"));
        n.setTitle((String) d.get("title"));
        n.setBody((String) d.getOrDefault("body", ""));
        n.setSummary((String) d.get("summary"));
        n.setCategory((String) d.get("category"));
        n.setContactEmail((String) d.get("contactEmail"));
        n.setExternalUrl((String) d.get("externalUrl"));
        n.setAttachmentUrl((String) d.get("attachmentUrl"));
        n.setCoverImageUrl((String) d.get("coverImageUrl"));
        n.setCustomBadge((String) d.get("customBadge"));
        n.setPublished(Boolean.TRUE.equals(d.get("published")));

        n.setDeadline(parseDateTime(d.get("deadline")));
        n.setValidFrom(parseDateTime(d.get("validFrom")));

        if (d.get("extras") instanceof Map<?, ?> extras) {
            n.getExtras().clear();
            extras.forEach((k, v) -> n.getExtras().put((String) k, v));
        }

        if (d.get("attachments") instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    NotificationAttachment att = NotificationAttachment.builder()
                        .notification(n)
                        .title((String) m.get("title"))
                        .url((String) m.get("url"))
                        .type((String) m.get("type"))
                        .build();
                    n.getAttachments().add(att);
                }
            }
        }
        return n;
    }

    private LocalDateTime parseDateTime(Object value) {
        if (!(value instanceof String s) || s.isBlank()) return null;
        try {
            return s.length() <= 10
                ? LocalDate.parse(s).atStartOfDay()
                : LocalDateTime.parse(s.substring(0, 19));
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
