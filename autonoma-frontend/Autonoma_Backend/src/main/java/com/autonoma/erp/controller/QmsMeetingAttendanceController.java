package com.autonoma.erp.controller;

import com.autonoma.erp.model.QmsMeetingUserAttendance;
import com.autonoma.erp.service.QmsMeetingAttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import com.autonoma.erp.security.RequirePagePermission;

@RestController
@RequestMapping("/api/qms/meeting-attendance")
@RequiredArgsConstructor
public class QmsMeetingAttendanceController {
    private final QmsMeetingAttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<QmsMeetingUserAttendance>> getAll() {
        return ResponseEntity.ok(attendanceService.getAll());
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<QmsMeetingUserAttendance>> getBySchedule(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(attendanceService.getByScheduleId(scheduleId));
    }

    @PostMapping
    @RequirePagePermission(pageCode = "QM1330", action = "write")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> data) {
        try {
            QmsMeetingUserAttendance attendance = attendanceService.markAttendance(data);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/out")
    @RequirePagePermission(pageCode = "QM1330", action = "write")
    public ResponseEntity<?> markOutTime(@PathVariable Long id) {
        try {
            QmsMeetingUserAttendance attendance = attendanceService.markOutTime(id);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
