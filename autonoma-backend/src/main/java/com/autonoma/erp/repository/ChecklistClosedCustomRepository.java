package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistClosedCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistClosedCustomRepository extends JpaRepository<ChecklistClosedCustom, Long> {
    List<ChecklistClosedCustom> findByChecklistId(Long checklistId);
    Optional<ChecklistClosedCustom> findByChecklistIdAndAssignedToAndChecklistDate(Long checklistId, String assignedTo, Date checklistDate);
}
