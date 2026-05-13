package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistDepartment;
import com.autonoma.erp.model.MasterChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChecklistDepartmentRepository extends JpaRepository<ChecklistDepartment, Long> {
    void deleteByChecklist(MasterChecklist checklist);
}
