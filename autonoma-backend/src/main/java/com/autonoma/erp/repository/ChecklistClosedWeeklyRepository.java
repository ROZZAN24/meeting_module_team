package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedWeekly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedWeeklyRepository extends JpaRepository<ChecklistClosedWeekly, Long> {
    List<ChecklistClosedWeekly> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedWeekly> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
