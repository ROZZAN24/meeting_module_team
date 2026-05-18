package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditArea;
import com.autonoma.erp.repository.AuditAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    @Operation(summary = "Create/Update Audit Area", description = "Creates a new audit area or updates an existing one")
    public AuditArea createAuditArea(@RequestBody AuditArea auditArea) {
        log.info("Saving audit area: {}", auditArea);
        if (auditArea.getId() == null) {
            auditArea.setUpdatedBy(null);
            auditArea.setUpdatedDate(null);
        }
        return auditAreaRepository.save(auditArea);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Audit Area", description = "Deletes an audit area by its ID")
    public ResponseEntity<Void> deleteAuditArea(@PathVariable Long id) {
        auditAreaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
