package com.autonoma.erp.repository;

import com.autonoma.erp.model.OrgPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrgPositionRepository extends JpaRepository<OrgPosition, Long> {
    List<OrgPosition> findByStatus(String status);
    List<OrgPosition> findByAssignedEmployeeId(Long assignedEmployeeId);
}
