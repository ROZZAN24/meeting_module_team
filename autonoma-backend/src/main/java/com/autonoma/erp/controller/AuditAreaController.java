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
    private com.autonoma.erp.repository.AuditTypeRepository auditTypeRepository;

    @Autowired
    private com.autonoma.erp.repository.AuditScheduleRepository auditScheduleRepository;

    @Autowired
    private com.autonoma.erp.repository.AuditCriteriaRepository auditCriteriaRepository;

    @Autowired
    private AuditAreaRepository auditAreaRepository;

    @GetMapping
    @Operation(summary = "Get All Audit Areas", description = "Fetches a complete list of audit areas and zones")
    public List<AuditArea> getAllAuditAreas() {
        log.info("Fetching all audit areas");
        return auditAreaRepository.findAll();
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M1110", action = "write")
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
    @RequirePagePermission(pageCode = "M1110", action = "write")
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
    @RequirePagePermission(pageCode = "M1110", action = "delete")
    @Operation(summary = "Delete Audit Area", description = "Deletes an audit area by its ID")
    public ResponseEntity<?> deleteAuditArea(@PathVariable Long id) {
        AuditArea existing = auditAreaRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        
        String areaName = existing.getDescription();
        if (areaName == null || areaName.trim().isEmpty()) {
            auditAreaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        
        areaName = areaName.trim();
        final String searchName = areaName.toLowerCase();

        // 1. Check if referenced in Audit Type
        List<com.autonoma.erp.model.AuditType> matchingTypes = auditTypeRepository.findAll().stream()
            .filter(t -> t.getAuditArea() != null &&
                java.util.Arrays.stream(t.getAuditArea().split(","))
                    .map(String::trim)
                    .anyMatch(a -> a.equalsIgnoreCase(searchName)))
            .toList();

        // 2. Check if referenced in Audit Schedule
        boolean inSchedule = auditScheduleRepository.findAll().stream()
            .filter(s -> !s.isDeleted())
            .anyMatch(s -> {
                if (s.getAuditArea() != null &&
                    java.util.Arrays.stream(s.getAuditArea().split(","))
                        .map(String::trim)
                        .anyMatch(a -> a.equalsIgnoreCase(searchName))) {
                    return true;
                }
                if (s.getAuditeeDetails() != null &&
                    java.util.Arrays.stream(s.getAuditeeDetails().split(","))
                        .map(String::trim)
                        .anyMatch(a -> a.equalsIgnoreCase(searchName))) {
                    return true;
                }
                return false;
            });

        // 3. Check if any matching Audit Type is referenced in Audit Criteria
        boolean inCriteria = false;
        if (!matchingTypes.isEmpty()) {
            List<String> typeNames = matchingTypes.stream().map(t -> t.getAuditType().toLowerCase()).toList();
            inCriteria = auditCriteriaRepository.findAll().stream()
                .anyMatch(c -> c.getAuditType() != null &&
                    java.util.Arrays.stream(c.getAuditType().split(","))
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .anyMatch(typeNames::contains));
        }

        if (!matchingTypes.isEmpty() || inSchedule || inCriteria) {
            return ResponseEntity.badRequest().body("Deletion not allowed. Audit Area is in use. Delete related Audit Schedule, Audit Criteria, and Audit Type records first.");
        }

        auditAreaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
