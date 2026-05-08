package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditScheduleRepository extends JpaRepository<AuditSchedule, Long> {
    java.util.Optional<AuditSchedule> findFirstByOrderByScheduleNoDesc();
}
