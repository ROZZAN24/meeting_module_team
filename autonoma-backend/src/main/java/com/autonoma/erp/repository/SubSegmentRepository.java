package com.autonoma.erp.repository;

import com.autonoma.erp.model.SubSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubSegmentRepository extends JpaRepository<SubSegment, Long> {
    boolean existsBySubSegmentCodeIgnoreCase(String subSegmentCode);
    boolean existsBySubSegmentNameIgnoreCase(String subSegmentName);
}
