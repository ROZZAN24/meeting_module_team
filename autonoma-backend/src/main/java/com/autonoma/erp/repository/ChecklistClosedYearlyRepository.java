package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedYearly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedYearlyRepository extends JpaRepository<ChecklistClosedYearly, Long> {
    List<ChecklistClosedYearly> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedYearly> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
