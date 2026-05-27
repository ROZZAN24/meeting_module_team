package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedHalfYearly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedHalfYearlyRepository extends JpaRepository<ChecklistClosedHalfYearly, Long> {
    List<ChecklistClosedHalfYearly> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedHalfYearly> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
