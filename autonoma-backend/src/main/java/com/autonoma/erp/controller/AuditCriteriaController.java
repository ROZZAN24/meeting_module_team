package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditCriteria;
import com.autonoma.erp.repository.AuditCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;
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
    private com.autonoma.erp.service.AuditCriteriaService auditCriteriaService;

    @Autowired
    private AuditCriteriaRepository auditCriteriaRepository;

    @GetMapping
    @Operation(summary = "Get All Audit Criteria", description = "Fetches a complete list of audit criteria")
    public List<AuditCriteria> getAllAuditCriteria() {
        log.info("Fetching all audit criteria");
        return auditCriteriaService.getAll();
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M1130", action = "write")
    @Operation(summary = "Create/Update Audit Criteria", description = "Creates a new audit criteria or updates an existing one")
    public ResponseEntity<?> createAuditCriteria(@RequestBody AuditCriteria auditCriteria) {
        log.info("Saving audit criteria: {}", auditCriteria);
    if (auditCriteria.getSeqNo() != null && auditCriteriaRepository.existsBySeqNoIgnoreCase(auditCriteria.getSeqNo().trim())) {
            return ResponseEntity.badRequest().body("Duplicate Seq No: A record with this sequence number already exists.");
        }
        if (auditCriteria.getClause() != null && !auditCriteria.getClause().trim().isEmpty() &&
            auditCriteria.getAuditType() != null &&
            auditCriteriaRepository.existsByClauseIgnoreCaseAndAuditTypeIgnoreCase(auditCriteria.getClause().trim(), auditCriteria.getAuditType().trim())) {
            return ResponseEntity.badRequest().body("Duplicate: A record with the same Clause and Audit Type already exists.");
        }
        auditCriteria.setUpdatedBy(null);
        auditCriteria.setUpdatedDate(null);
        AuditCriteria saved = auditCriteriaService.save(auditCriteria);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M1130", action = "write")
    @Operation(summary = "Update Audit Criteria", description = "Updates an existing audit criteria")
    public ResponseEntity<?> updateAuditCriteria(@PathVariable Long id, @RequestBody AuditCriteria auditCriteria) {
        log.info("Updating audit criteria with ID {}: {}", id, auditCriteria);
        AuditCriteria existing = auditCriteriaRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (auditCriteria.getSeqNo() != null && auditCriteriaRepository.existsBySeqNoIgnoreCaseAndIdNot(auditCriteria.getSeqNo().trim(), id)) {
            return ResponseEntity.badRequest().body("Duplicate Seq No: A record with this sequence number already exists.");
        }
        if (auditCriteria.getClause() != null && !auditCriteria.getClause().trim().isEmpty() &&
            auditCriteria.getAuditType() != null &&
            auditCriteriaRepository.existsByClauseIgnoreCaseAndAuditTypeIgnoreCaseAndIdNot(auditCriteria.getClause().trim(), auditCriteria.getAuditType().trim(), id)) {
            return ResponseEntity.badRequest().body("Duplicate: A record with the same Clause and Audit Type already exists.");
        }
        
        // Preserve created info
        auditCriteria.setId(id);
        auditCriteria.setCreatedBy(existing.getCreatedBy());
        auditCriteria.setCreatedDate(existing.getCreatedDate());
        
        AuditCriteria saved = auditCriteriaService.save(auditCriteria);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/by-type/{auditType}")
    public List<AuditCriteria> getByAuditType(@PathVariable String auditType) {
        log.info("Fetching audit criteria for type: {}", auditType);
        // This one stays repository for simplicity or move to service
        return auditCriteriaRepository.findByAuditTypeContaining(auditType);
    }

    @GetMapping("/next-seq")
    @Operation(summary = "Get Next Sequence Number", description = "Generates the next available sequence number for audit criteria")
    public String getNextSeqNo() {
        return auditCriteriaService.generateNextSeqNo();
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M1130", action = "delete")
    public ResponseEntity<Void> deleteAuditCriteria(@PathVariable Long id) {
        auditCriteriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
