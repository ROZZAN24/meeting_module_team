package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditArea;
import com.autonoma.erp.repository.AuditAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/api/master/qms/audit-area")
@CrossOrigin(origins = "*")
@Tag(name = "QMS - Audit Area Master", description = "Endpoints for managing QMS audit areas and zones")
public class AuditAreaController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditAreaController.class);

    @Autowired
    private AuditAreaRepository auditAreaRepository;

    @GetMapping
    @Operation(summary = "Get All Audit Areas", description = "Fetches a complete list of audit areas and zones")
    public List<AuditArea> getAllAuditAreas() {
        log.info("Fetching all audit areas");
        return auditAreaRepository.findAll();
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M1120", action = "write")
    @Operation(summary = "Create Audit Area", description = "Creates a new audit area")
    public ResponseEntity<?> createAuditArea(@RequestBody AuditArea auditArea) {
        log.info("Saving audit area: {}", auditArea);
        if (auditArea.getDescription() != null && auditAreaRepository.existsByDescriptionIgnoreCase(auditArea.getDescription().trim())) {
            return ResponseEntity.badRequest().body("Duplicate value on field description");
        }
        auditArea.setUpdatedBy(null);
        auditArea.setUpdatedDate(null);
        AuditArea saved = auditAreaRepository.save(auditArea);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M1120", action = "write")
    @Operation(summary = "Update Audit Area", description = "Updates an existing audit area")
    public ResponseEntity<?> updateAuditArea(@PathVariable Long id, @RequestBody AuditArea auditArea) {
        log.info("Updating audit area with id: {}, data: {}", id, auditArea);
        AuditArea existing = auditAreaRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (auditArea.getDescription() != null && auditAreaRepository.existsByDescriptionIgnoreCaseAndIdNot(auditArea.getDescription().trim(), id)) {
            return ResponseEntity.badRequest().body("Duplicate value on field description");
        }
        
        // Preserve created info
        auditArea.setId(id);
        auditArea.setCreatedBy(existing.getCreatedBy());
        auditArea.setCreatedDate(existing.getCreatedDate());
        
        AuditArea saved = auditAreaRepository.save(auditArea);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M1120", action = "delete")
    @Operation(summary = "Delete Audit Area", description = "Deletes an audit area by its ID")
    public ResponseEntity<Void> deleteAuditArea(@PathVariable Long id) {
        auditAreaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
