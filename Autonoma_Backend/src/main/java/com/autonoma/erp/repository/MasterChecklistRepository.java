package com.autonoma.erp.repository;

import com.autonoma.erp.model.MasterChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MasterChecklistRepository extends JpaRepository<MasterChecklist, Long>, JpaSpecificationExecutor<MasterChecklist> {
}
