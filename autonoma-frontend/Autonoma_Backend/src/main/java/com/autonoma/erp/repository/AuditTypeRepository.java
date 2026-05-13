package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditTypeRepository extends JpaRepository<AuditType, Long> {
}
