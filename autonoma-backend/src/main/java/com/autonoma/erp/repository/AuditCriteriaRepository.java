package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditCriteriaRepository extends JpaRepository<AuditCriteria, Long> {
    java.util.List<AuditCriteria> findByAuditTypeContaining(String auditType);
    java.util.Optional<AuditCriteria> findFirstByOrderBySeqNoDesc();
    
    boolean existsBySeqNoIgnoreCase(String seqNo);
    boolean existsBySeqNoIgnoreCaseAndIdNot(String seqNo, Long id);
    
    boolean existsByCriteriaTextIgnoreCase(String criteriaText);
    boolean existsByCriteriaTextIgnoreCaseAndIdNot(String criteriaText, Long id);
    
    boolean existsByClauseIgnoreCaseAndAuditTypeIgnoreCase(String clause, String auditType);
    boolean existsByClauseIgnoreCaseAndAuditTypeIgnoreCaseAndIdNot(String clause, String auditType, Long id);
}

