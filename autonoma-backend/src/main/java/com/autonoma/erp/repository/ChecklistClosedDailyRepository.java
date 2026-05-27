package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedDailyRepository extends JpaRepository<ChecklistClosedDaily, Long> {
    List<ChecklistClosedDaily> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedDaily> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
