package com.autonoma.erp.repository;

import com.autonoma.erp.model.QmsMeetingUserAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QmsMeetingUserAttendanceRepository extends JpaRepository<QmsMeetingUserAttendance, Long> {
    List<QmsMeetingUserAttendance> findByScheduleId(Long scheduleId);
    Optional<QmsMeetingUserAttendance> findByScheduleIdAndEmployeeId(Long scheduleId, Long employeeId);
}
