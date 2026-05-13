package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditCriteriaRepository extends JpaRepository<AuditCriteria, Long> {
    java.util.List<AuditCriteria> findByAuditTypeContaining(String auditType);
    java.util.Optional<AuditCriteria> findFirstByOrderBySeqNoDesc();
}
