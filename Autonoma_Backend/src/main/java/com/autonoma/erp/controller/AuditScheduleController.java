package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditSchedule;
import com.autonoma.erp.service.AuditScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qms/audit-schedules")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditScheduleController {

    @Autowired
    private AuditScheduleService service;

    @GetMapping
    public List<AuditSchedule> getAllAuditSchedules() {
        return service.getAllAuditSchedules();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditSchedule> getAuditScheduleById(@PathVariable Long id) {
        return service.getAuditScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AuditSchedule createAuditSchedule(@RequestBody AuditSchedule auditSchedule) {
        return service.createAuditSchedule(auditSchedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditSchedule> updateAuditSchedule(
            @PathVariable Long id, @RequestBody AuditSchedule auditSchedule) {
        try {
            AuditSchedule updated = service.updateAuditSchedule(id, auditSchedule);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditSchedule(@PathVariable Long id) {
        service.deleteAuditSchedule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/next-no")
    public String getNextNo() {
        return service.getNextScheduleNo();
    }
}
