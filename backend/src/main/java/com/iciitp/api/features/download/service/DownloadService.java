package com.iciitp.api.features.download.service;

import com.iciitp.api.features.download.entity.Download;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import com.iciitp.api.features.download.repository.DownloadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DownloadService {

    private final DownloadRepository repo;

    public Page<Download> findAll(Pageable pageable) { return repo.findAllByOrderByCreatedAtDesc(pageable); }
    public List<Download> findPublished() { return repo.findByPublishedTrueOrderByCreatedAtDesc(); }
    public List<Download> findByPage(String page) { return repo.findByDisplayPageAndPublishedTrueOrderByCreatedAtDesc(page); }

    public Download findById(String id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Download not found: " + id));
    }

    @Transactional
    public Download create(Map<String, Object> data) {
        return repo.save(mapToEntity(new Download(), data));
    }

    @Transactional
    public Download update(String id, Map<String, Object> data) {
        return repo.save(mapToEntity(findById(id), data));
    }

    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Download not found: " + id);
        repo.deleteById(id);
    }

    private Download mapToEntity(Download d, Map<String, Object> data) {
        d.setTitle((String) data.get("title"));
        d.setFileUrl((String) data.get("fileUrl"));
        d.setFileType((String) data.get("fileType"));
        d.setCategory((String) data.get("category"));
        d.setPurpose((String) data.get("purpose"));
        d.setDisplayPage((String) data.get("displayPage"));
        d.setPublished(Boolean.TRUE.equals(data.get("published")));
        return d;
    }
}
