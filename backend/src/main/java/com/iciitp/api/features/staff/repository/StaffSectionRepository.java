package com.iciitp.api.features.staff.repository;

import com.iciitp.api.features.staff.entity.StaffSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StaffSectionRepository extends JpaRepository<StaffSection, String> {

    // JOIN FETCH loads members in a single query — fixes N+1 and LazyInitializationException
    @Query("SELECT DISTINCT s FROM StaffSection s LEFT JOIN FETCH s.members ORDER BY s.sortOrder ASC, s.createdAt ASC")
    List<StaffSection> findAllWithMembers();
}
