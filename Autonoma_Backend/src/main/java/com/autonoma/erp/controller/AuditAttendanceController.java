package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditAttendance;
import com.autonoma.erp.repository.AuditAttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qms/audit/attendance")
@CrossOrigin(origins = "*")
public class AuditAttendanceController {

    @Autowired
    private AuditAttendanceRepository auditAttendanceRepository;

    @GetMapping
    public List<AuditAttendance> getAll() {
        return auditAttendanceRepository.findAll();
    }

    @PostMapping
    public AuditAttendance create(@RequestBody AuditAttendance attendance) {
        if (attendance.getCreatedBy() == null) attendance.setCreatedBy("Admin");
        return auditAttendanceRepository.save(attendance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditAttendance> update(@PathVariable Long id, @RequestBody AuditAttendance details) {
        return auditAttendanceRepository.findById(id)
                .map(attendance -> {
                    attendance.setAuditScheduleNo(details.getAuditScheduleNo());
                    attendance.setName(details.getName());
                    attendance.setInTime(details.getInTime());
                    attendance.setOutTime(details.getOutTime());
                    attendance.setAttendanceStatus(details.getAttendanceStatus());
                    attendance.setUpdatedBy("Admin");
                    return ResponseEntity.ok(auditAttendanceRepository.save(attendance));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return auditAttendanceRepository.findById(id)
                .map(attendance -> {
                    auditAttendanceRepository.delete(attendance);
                    return ResponseEntity.ok().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/by-schedule/{scheduleNo}")
    public List<AuditAttendance> getBySchedule(@PathVariable String scheduleNo) {
        return auditAttendanceRepository.findByAuditScheduleNo(scheduleNo);
    }

    @Autowired
    private com.autonoma.erp.repository.AuditScheduleRepository scheduleRepo;

    @GetMapping("/participants/{scheduleNo}")
    public ResponseEntity<java.util.Set<String>> getParticipants(@PathVariable String scheduleNo) {
        return scheduleRepo.findByScheduleNo(scheduleNo)
                .map(s -> {
                    java.util.Set<String> names = new java.util.TreeSet<>();
                    if (s.getAuditor() != null) {
                        java.util.Arrays.stream(s.getAuditor().split(","))
                                .map(String::trim)
                                .filter(n -> !n.isEmpty())
                                .forEach(names::add);
                    }
                    if (s.getAuditee() != null) {
                        java.util.Arrays.stream(s.getAuditee().split(","))
                                .map(String::trim)
                                .filter(n -> !n.isEmpty())
                                .forEach(names::add);
                    }
                    return ResponseEntity.ok(names);
                }).orElse(ResponseEntity.notFound().build());
    }
}
