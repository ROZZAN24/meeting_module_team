package com.autonoma.erp.service;

import com.autonoma.erp.model.AuditAttendance;
import com.autonoma.erp.model.AuditSchedule;
import com.autonoma.erp.repository.AuditAttendanceRepository;
import com.autonoma.erp.repository.AuditScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuditAttendanceService {

    @Autowired
    private AuditAttendanceRepository attendanceRepository;

    @Autowired
    private AuditScheduleRepository scheduleRepository;

    public AuditAttendance saveAttendance(AuditAttendance attendance) {
        Optional<AuditSchedule> scheduleOpt = scheduleRepository.findByScheduleNo(attendance.getAuditScheduleNo());
        
        if (scheduleOpt.isPresent()) {
            AuditSchedule schedule = scheduleOpt.get();
            
            /* 
            // SOP: 10 minutes before audit start time restriction
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime auditStartDateTime = convertToDateTime(schedule.getAuditDate(), schedule.getStartTime());
            
            long minutesUntilStart = ChronoUnit.MINUTES.between(now, auditStartDateTime);
            
            if (minutesUntilStart > 10) {
                throw new RuntimeException("Too early! Attendance for " + schedule.getScheduleNo() + 
                    " can only be marked 10 minutes before start time (" + schedule.getStartTime() + ").");
            }
            */
        }

        // Duplicate Check: Prevent multiple records for same employee in same audit
        Optional<AuditAttendance> existing = attendanceRepository.findByAuditScheduleNoAndEmployeeCode(
            attendance.getAuditScheduleNo(), 
            attendance.getEmployeeCode()
        );

        if (existing.isPresent() && (attendance.getId() == null || !existing.get().getId().equals(attendance.getId()))) {
            throw new RuntimeException("Duplicate Entry! Attendance for " + attendance.getName() + 
                " (" + attendance.getEmployeeCode() + ") has already been marked for schedule " + 
                attendance.getAuditScheduleNo() + ".");
        }

        if (attendance.getCreatedBy() == null) attendance.setCreatedBy("Admin");
        org.slf4j.LoggerFactory.getLogger(AuditAttendanceService.class).info("[AttendanceSave] Attempting save for {}: {}", attendance.getName(), attendance.getAuditScheduleNo());
        try {
            return attendanceRepository.save(attendance);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            org.slf4j.LoggerFactory.getLogger(AuditAttendanceService.class).error("[AttendanceSave] Duplicate entry detected via DB constraint: {}", e.getMessage());
            throw new RuntimeException("Duplicate Entry! This person is already marked for this audit schedule.");
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AuditAttendanceService.class).error("[AttendanceSave] Database error: {}", e.getMessage());
            throw e;
        }
    }

    private LocalDateTime convertToDateTime(java.util.Date date, String timeStr) {
        if (date == null || timeStr == null || timeStr.isEmpty()) {
            return LocalDateTime.now().plusDays(1);
        }
        
        try {
            // Support both 24h (HH:mm) and 12h (hh:mm a) formats
            java.time.format.DateTimeFormatter formatter;
            if (timeStr.contains("AM") || timeStr.contains("PM")) {
                formatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.ENGLISH);
            } else {
                formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            }
            
            LocalTime time = LocalTime.parse(timeStr.toUpperCase(), formatter);
            return LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault())
                    .withHour(time.getHour())
                    .withMinute(time.getMinute())
                    .withSecond(0)
                    .withNano(0);
        } catch (Exception e) {
            System.err.println("Failed to parse time: " + timeStr + ". Error: " + e.getMessage());
            return LocalDateTime.now().plusDays(1);
        }
    }
}
