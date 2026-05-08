package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditArea;
import com.autonoma.erp.repository.AuditAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/qms/audit-area")
@CrossOrigin(origins = "*")
public class AuditAreaController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditAreaController.class);

    @Autowired
    private AuditAreaRepository auditAreaRepository;

    @GetMapping
    public List<AuditArea> getAllAuditAreas() {
        log.info("Fetching all audit areas");
        return auditAreaRepository.findAll();
    }

    @PostMapping
    public AuditArea createAuditArea(@RequestBody AuditArea auditArea) {
        log.info("Saving audit area: {}", auditArea);
        return auditAreaRepository.save(auditArea);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditArea(@PathVariable Long id) {
        auditAreaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
