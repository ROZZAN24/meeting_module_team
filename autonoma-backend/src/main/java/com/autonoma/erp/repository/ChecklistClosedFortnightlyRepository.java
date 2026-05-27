package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedFortnightly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedFortnightlyRepository extends JpaRepository<ChecklistClosedFortnightly, Long> {
    List<ChecklistClosedFortnightly> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedFortnightly> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
