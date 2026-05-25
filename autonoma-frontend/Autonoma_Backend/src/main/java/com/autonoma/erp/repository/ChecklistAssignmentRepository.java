package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ChecklistAssignmentRepository extends JpaRepository<ChecklistAssignment, Long>, JpaSpecificationExecutor<ChecklistAssignment> {
    java.util.List<ChecklistAssignment> findByChecklistId(Long checklistId);
    java.util.Optional<ChecklistAssignment> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, java.util.Date checklistDate);
    java.util.List<ChecklistAssignment> findAllByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, java.util.Date checklistDate);
    boolean existsByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, java.util.Date checklistDate);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM ChecklistAssignment c JOIN c.status s WHERE s.name NOT IN ('Completed', 'Verified', 'Accepted', 'Unresolved', 'Missed') AND c.checklistDate <= :today")
    java.util.List<ChecklistAssignment> findUncompletedAssignments(@org.springframework.data.repository.query.Param("today") java.util.Date today);
}
