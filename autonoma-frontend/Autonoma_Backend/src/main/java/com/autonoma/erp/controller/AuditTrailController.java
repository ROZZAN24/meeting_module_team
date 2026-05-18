package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditTrail;
import com.autonoma.erp.repository.AuditTrailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-trail")
@CrossOrigin(origins = "*")
public class AuditTrailController {

    @Autowired
    private AuditTrailRepository auditTrailRepository;

    @GetMapping
    public List<AuditTrail> getAllLogs() {
        return auditTrailRepository.findAllByOrderByCreatedAtDesc();
    }

    @Autowired
    private com.autonoma.erp.service.AuditTrailService auditTrailService;

    @PostMapping("/restore/{id}")
    public org.springframework.http.ResponseEntity<?> restoreRecord(@PathVariable Long id) {
        try {
            auditTrailService.restoreRecord(id);
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Record restored successfully"));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
