package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface ChecklistClosedRepository extends JpaRepository<ChecklistClosed, Long> {
    Optional<ChecklistClosed> findByChecklistIdAndAssignedToAndChecklistDate(
            Long checklistId, String assignedTo, Date checklistDate);
}
