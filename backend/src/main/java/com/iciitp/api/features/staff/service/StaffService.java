package com.iciitp.api.features.staff.service;

import com.iciitp.api.features.staff.entity.StaffMember;
import com.iciitp.api.features.staff.entity.StaffSection;
import com.iciitp.api.features.staff.repository.StaffMemberRepository;
import com.iciitp.api.features.staff.repository.StaffSectionRepository;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffSectionRepository sectionRepo;
    private final StaffMemberRepository memberRepo;

    // ── Sections ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllSectionsWithMembers() {
        return sectionRepo.findAllWithMembers()
                .stream().map(this::sectionToMap).toList();
    }

    @Transactional
    public Map<String, Object> createSection(Map<String, Object> data) {
        StaffSection s = StaffSection.builder()
                .name((String) data.get("name"))
                .sortOrder(data.containsKey("sortOrder") ? (int) data.get("sortOrder") : 0)
                .build();
        return sectionToMap(sectionRepo.save(s));
    }

    @Transactional
    public Map<String, Object> updateSection(String id, Map<String, Object> data) {
        StaffSection s = sectionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id));
        if (data.containsKey("name"))      s.setName((String) data.get("name"));
        if (data.containsKey("sortOrder")) s.setSortOrder((int) data.get("sortOrder"));
        return sectionToMap(sectionRepo.save(s));
    }

    @Transactional
    public void deleteSection(String id) {
        if (!sectionRepo.existsById(id)) throw new ResourceNotFoundException("Section not found: " + id);
        sectionRepo.deleteById(id);
    }

    // ── Members ─────────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> createMember(Map<String, Object> data) {
        String sectionId = (String) data.get("sectionId");
        StaffSection section = sectionRepo.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + sectionId));
        StaffMember m = fromData(new StaffMember(), data);
        m.setSection(section);
        return memberToMap(memberRepo.save(m));
    }

    @Transactional
    public Map<String, Object> updateMember(String id, Map<String, Object> data) {
        StaffMember m = memberRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
        if (data.containsKey("sectionId")) {
            String sectionId = (String) data.get("sectionId");
            StaffSection section = sectionRepo.findById(sectionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + sectionId));
            m.setSection(section);
        }
        fromData(m, data);
        return memberToMap(memberRepo.save(m));
    }

    @Transactional
    public void deleteMember(String id) {
        if (!memberRepo.existsById(id)) throw new ResourceNotFoundException("Member not found: " + id);
        memberRepo.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private StaffMember fromData(StaffMember m, Map<String, Object> d) {
        if (d.containsKey("name"))        m.setName((String) d.get("name"));
        if (d.containsKey("designation")) m.setDesignation((String) d.get("designation"));
        if (d.containsKey("bio"))         m.setBio((String) d.get("bio"));
        if (d.containsKey("photoUrl"))    m.setPhotoUrl((String) d.get("photoUrl"));
        if (d.containsKey("email"))       m.setEmail((String) d.get("email"));
        if (d.containsKey("linkedin"))       m.setLinkedin((String) d.get("linkedin"));
        if (d.containsKey("otherLinkUrl"))   m.setOtherLinkUrl((String) d.get("otherLinkUrl"));
        if (d.containsKey("otherLinkLabel")) m.setOtherLinkLabel((String) d.get("otherLinkLabel"));
        if (d.containsKey("sortOrder"))   m.setSortOrder((int) d.get("sortOrder"));
        return m;
    }

    private Map<String, Object> sectionToMap(StaffSection s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("name", s.getName());
        m.put("sortOrder", s.getSortOrder());
        m.put("createdAt", s.getCreatedAt());
        // Pass section id/name directly — avoids any lazy proxy access inside memberToMap
        m.put("members", s.getMembers().stream()
                .map(member -> memberToMap(member, s.getId(), s.getName()))
                .toList());
        return m;
    }

    // Called from within @Transactional context — no lazy access needed
    private Map<String, Object> memberToMap(StaffMember m, String sectionId, String sectionName) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("sectionId", sectionId);
        map.put("sectionName", sectionName);
        map.put("name", m.getName());
        map.put("designation", m.getDesignation());
        map.put("bio", m.getBio());
        map.put("photoUrl", m.getPhotoUrl());
        map.put("email", m.getEmail());
        map.put("linkedin", m.getLinkedin());
        map.put("otherLinkUrl", m.getOtherLinkUrl());
        map.put("otherLinkLabel", m.getOtherLinkLabel());
        map.put("sortOrder", m.getSortOrder());
        map.put("createdAt", m.getCreatedAt());
        map.put("updatedAt", m.getUpdatedAt());
        return map;
    }

    // Used when returning a single member after create/update — section is already loaded in the same @Transactional
    private Map<String, Object> memberToMap(StaffMember m) {
        String sId = m.getSection() != null ? m.getSection().getId() : null;
        String sName = m.getSection() != null ? m.getSection().getName() : null;
        return memberToMap(m, sId, sName);
    }
}
