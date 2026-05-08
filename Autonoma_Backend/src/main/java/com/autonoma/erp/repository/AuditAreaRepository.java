package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditAreaRepository extends JpaRepository<AuditArea, Long> {
}
