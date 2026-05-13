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
    @Operation(summary = "Create/Update Audit Criteria", description = "Creates a new audit criteria or updates an existing one")
    public AuditCriteria createAuditCriteria(@RequestBody AuditCriteria auditCriteria) {
        log.info("Saving audit criteria: {}", auditCriteria);
        return auditCriteriaService.save(auditCriteria);
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
    public ResponseEntity<Void> deleteAuditCriteria(@PathVariable Long id) {
        auditCriteriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
