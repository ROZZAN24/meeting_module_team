package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ChecklistAssignmentRepository extends JpaRepository<ChecklistAssignment, Long>, JpaSpecificationExecutor<ChecklistAssignment> {
    java.util.List<ChecklistAssignment> findByChecklistId(Long checklistId);
    java.util.Optional<ChecklistAssignment> findByChecklistIdAndAssignedTo(Long checklistId, String assignedTo);
}
