package com.iciitp.api.features.staff.repository;

import com.iciitp.api.features.staff.entity.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffMemberRepository extends JpaRepository<StaffMember, String> {
    List<StaffMember> findBySectionIdOrderBySortOrderAscCreatedAtAsc(String sectionId);
}
