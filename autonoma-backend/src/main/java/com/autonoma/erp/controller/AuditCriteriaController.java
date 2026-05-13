package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditCriteria;
import com.autonoma.erp.repository.AuditCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/api/master/qms/audit-criteria")
@CrossOrigin(origins = "*")
@Tag(name = "QMS - Audit Criteria Master", description = "Endpoints for managing audit criteria, clauses, and sequences")
public class AuditCriteriaController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditCriteriaController.class);

    @Autowired
    private AuditCriteriaRepository auditCriteriaRepository;

    @GetMapping
    @Operation(summary = "Get All Audit Criteria", description = "Fetches a complete list of audit criteria")
    public List<AuditCriteria> getAllAuditCriteria() {
        log.info("Fetching all audit criteria");
        return auditCriteriaRepository.findAll();
    }

    @PostMapping
    @Operation(summary = "Create/Update Audit Criteria", description = "Creates a new audit criteria or updates an existing one")
    public AuditCriteria createAuditCriteria(@RequestBody AuditCriteria auditCriteria) {
        log.info("Saving audit criteria: {}", auditCriteria);
        return auditCriteriaRepository.save(auditCriteria);
    }

    @GetMapping("/by-type/{auditType}")
    public List<AuditCriteria> getByAuditType(@PathVariable String auditType) {
        log.info("Fetching audit criteria for type: {}", auditType);
        return auditCriteriaRepository.findByAuditTypeContaining(auditType);
    }

    @GetMapping("/next-seq")
    @Operation(summary = "Get Next Sequence Number", description = "Generates the next available sequence number for audit criteria")
    public String getNextSeqNo() {
        return auditCriteriaRepository.findFirstByOrderBySeqNoDesc()
                .map(latest -> incrementSequence(latest.getSeqNo(), "AC-"))
                .orElse("AC-001");
    }

    private String incrementSequence(String latest, String prefix) {
        if (latest == null || latest.isEmpty()) return prefix + "001";
        try {
            // Find the last numeric part in the string
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+$");
            java.util.regex.Matcher matcher = pattern.matcher(latest);
            if (matcher.find()) {
                String numericPart = matcher.group();
                int num = Integer.parseInt(numericPart);
                int length = numericPart.length();
                String nextNum = String.format("%0" + length + "d", num + 1);
                return latest.substring(0, matcher.start()) + nextNum;
            }
            return prefix + "001";
        } catch (Exception e) {
            return prefix + "001";
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditCriteria(@PathVariable Long id) {
        auditCriteriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
