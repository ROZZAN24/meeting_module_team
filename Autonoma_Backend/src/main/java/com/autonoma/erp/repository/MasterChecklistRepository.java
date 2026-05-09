package com.autonoma.erp.repository;

import com.autonoma.erp.model.MasterChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Query;

public interface MasterChecklistRepository extends JpaRepository<MasterChecklist, Long>, JpaSpecificationExecutor<MasterChecklist> {
    @Query(value = "SELECT COALESCE(MAX(CAST(seq_no AS INT)), 0) FROM QMS_MASTER_CHECKLIST", nativeQuery = true)
    Integer findMaxSeqNo();
}
