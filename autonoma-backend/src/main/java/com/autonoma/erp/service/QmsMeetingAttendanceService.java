package com.autonoma.erp.service;

import com.autonoma.erp.model.QmsMeetingUserAttendance;
import com.autonoma.erp.model.QmsMeetingSchedule;
import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.repository.QmsMeetingUserAttendanceRepository;
import com.autonoma.erp.repository.QmsMeetingScheduleRepository;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QmsMeetingAttendanceService {
    private final QmsMeetingUserAttendanceRepository attendanceRepo;
    private final QmsMeetingScheduleRepository scheduleRepo;
    private final EmployeeMasterRepository employeeRepo;

    public List<QmsMeetingUserAttendance> getAll() {
        return attendanceRepo.findAll();
    }

    public List<QmsMeetingUserAttendance> getByScheduleId(Long scheduleId) {
        return attendanceRepo.findByScheduleId(scheduleId);
    }

    @Transactional
    public QmsMeetingUserAttendance markAttendance(Map<String, Object> data) {
        Long scheduleId = Long.parseLong(data.get("scheduleId").toString());
        String inTimeStr = data.get("inTime") != null ? data.get("inTime").toString() : null;
        String status = data.get("status") != null ? data.get("status").toString() : "PRESENT";

        QmsMeetingSchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        Long empIdStr = data.get("employeeId") != null ? Long.parseLong(data.get("employeeId").toString()) : null;

        EmployeeMaster employee;
        if (empIdStr != null) {
            employee = employeeRepo.findById(empIdStr)
                    .orElseThrow(() -> new RuntimeException("Selected employee not found"));
        } else {
            // For now, use a default employee. In production, use UserSession.
            // This is a placeholder for the logged-in user's employee record.
            employee = employeeRepo.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No employee found"));
        }

        // Check if already marked
        Optional<QmsMeetingUserAttendance> existing = attendanceRepo
                .findByScheduleIdAndEmployeeId(scheduleId, employee.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("Attendance already marked for this schedule");
        }

        QmsMeetingUserAttendance attendance = new QmsMeetingUserAttendance();
        attendance.setSchedule(schedule);
        attendance.setEmployee(employee);
        attendance.setStatus(status);
        if (inTimeStr != null && !inTimeStr.isEmpty()) {
            attendance.setInTime(LocalTime.parse(inTimeStr));
        } else {
            attendance.setInTime(LocalTime.now());
        }
        return attendanceRepo.save(attendance);
    }

    @Transactional
    public QmsMeetingUserAttendance markOutTime(Long attendanceId) {
        QmsMeetingUserAttendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setOutTime(LocalTime.now());
        return attendanceRepo.save(attendance);
    }
}
