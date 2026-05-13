package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditAttendanceRepository extends JpaRepository<AuditAttendance, Long> {
    List<AuditAttendance> findByAuditScheduleNo(String auditScheduleNo);
    java.util.Optional<AuditAttendance> findByAuditScheduleNoAndEmployeeCode(String auditScheduleNo, String employeeCode);
}
