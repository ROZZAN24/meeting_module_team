package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedMonthly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedMonthlyRepository extends JpaRepository<ChecklistClosedMonthly, Long> {
    List<ChecklistClosedMonthly> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedMonthly> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
