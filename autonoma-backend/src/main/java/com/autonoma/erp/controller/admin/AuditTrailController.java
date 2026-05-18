package com.autonoma.erp.controller.admin;

import com.autonoma.erp.model.admin.AuditTrail;
import com.autonoma.erp.repository.admin.AuditTrailRepository;

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
    private com.autonoma.erp.service.admin.AuditTrailService auditTrailService;

    @PostMapping("/log")
    public org.springframework.http.ResponseEntity<?> logAction(@RequestBody java.util.Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId");
            String pageName = (String) payload.get("pageName");
            String actionType = (String) payload.get("actionType");
            String tableName = (String) payload.get("tableName");
            String recordId = (String) payload.get("recordId");
            String prevVal = (String) payload.get("previousValue");
            String currVal = (String) payload.get("currentValue");
            String comments = (String) payload.get("comments");

            auditTrailService.saveAuditTrailAsync(actionType, tableName, recordId, prevVal, currVal, comments, userId, pageName);
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Logged successfully"));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/restore/{id}")
    public org.springframework.http.ResponseEntity<?> restoreRecord(@PathVariable Long id) {
        try {
            auditTrailService.restoreRecord(id);

            return org.springframework.http.ResponseEntity
                    .ok(java.util.Map.of("message", "Record restored successfully"));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
