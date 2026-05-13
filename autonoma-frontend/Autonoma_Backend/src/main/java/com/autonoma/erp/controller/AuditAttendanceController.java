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

    @Autowired
    private com.autonoma.erp.service.AuditAttendanceService auditAttendanceService;

    @GetMapping
    public List<AuditAttendance> getAll() {
        return auditAttendanceRepository.findAll();
    }

    @PostMapping
    public AuditAttendance create(@RequestBody AuditAttendance attendance) {
        return auditAttendanceService.saveAttendance(attendance);
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
    public ResponseEntity<java.util.List<java.util.Map<String, String>>> getParticipants(@PathVariable String scheduleNo) {
        return scheduleRepo.findByScheduleNo(scheduleNo)
                .map(s -> {
                    java.util.List<java.util.Map<String, String>> participants = new java.util.ArrayList<>();
                    
                    autoAdd(participants, s.getAuditor());
                    autoAdd(participants, s.getAuditee());
                    
                    return ResponseEntity.ok(participants);
                }).orElse(ResponseEntity.notFound().build());
    }

    private void autoAdd(java.util.List<java.util.Map<String, String>> list, String field) {
        if (field == null) return;
        java.util.Arrays.stream(field.split(","))
                .map(String::trim)
                .filter(n -> !n.isEmpty())
                .forEach(n -> {
                    java.util.Map<String, String> m = new java.util.HashMap<>();
                    if (n.contains(" - ")) {
                        String[] parts = n.split(" - ");
                        m.put("name", parts[0].trim());
                        m.put("code", parts[1].trim());
                    } else {
                        m.put("name", n);
                        m.put("code", "-");
                    }
                    // Avoid exact duplicates
                    if (list.stream().noneMatch(p -> p.get("name").equals(m.get("name")) && p.get("code").equals(m.get("code")))) {
                        list.add(m);
                    }
                });
    }
}
