package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedQuarterly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedQuarterlyRepository extends JpaRepository<ChecklistClosedQuarterly, Long> {
    List<ChecklistClosedQuarterly> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedQuarterly> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
