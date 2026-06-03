package com.autonoma.erp.repository;

import com.autonoma.erp.model.MasterChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Query;

public interface MasterChecklistRepository extends JpaRepository<MasterChecklist, Long>, JpaSpecificationExecutor<MasterChecklist> {
    java.util.Optional<MasterChecklist> findFirstByOrderBySeqNoDesc();
    
    java.util.List<MasterChecklist> findBySeqNoAndIdNot(String seqNo, Long id);
    java.util.List<MasterChecklist> findByStatusAndVerifyStatus(String status, String verifyStatus);
    
    @Query("SELECT m FROM MasterChecklist m WHERE (m.status IS NULL OR m.status != 'In Active') AND LOWER(TRIM(m.checkingPoint)) = LOWER(TRIM(:checkingPoint)) AND (:id IS NULL OR m.id != :id)")
    java.util.List<MasterChecklist> findDuplicates(String checkingPoint, Long id);
}
