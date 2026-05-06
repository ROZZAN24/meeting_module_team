package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditCriteria;
import com.autonoma.erp.repository.AuditCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/qms/audit-criteria")
@CrossOrigin(origins = "*")
public class AuditCriteriaController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditCriteriaController.class);

    @Autowired
    private AuditCriteriaRepository auditCriteriaRepository;

    @GetMapping
    public List<AuditCriteria> getAllAuditCriteria() {
        log.info("Fetching all audit criteria");
        return auditCriteriaRepository.findAll();
    }

    @PostMapping
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
    public String getNextSeqNo() {
        return auditCriteriaRepository.findFirstByOrderBySeqNoDesc()
                .map(latest -> {
                    try {
                        int num = Integer.parseInt(latest.getSeqNo());
                        return String.valueOf(num + 1);
                    } catch (Exception e) {
                        return "1";
                    }
                })
                .orElse("1");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditCriteria(@PathVariable Long id) {
        auditCriteriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
