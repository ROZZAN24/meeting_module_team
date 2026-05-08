package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditObservation;
import com.autonoma.erp.model.AuditObservationDetail;
import com.autonoma.erp.repository.AuditObservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qms/audit/observation")
@CrossOrigin(origins = "*")
public class AuditObservationController {

    @Autowired
    private AuditObservationRepository auditObservationRepository;

    @GetMapping
    public List<AuditObservation> getAll() {
        return auditObservationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditObservation> getById(@PathVariable Long id) {
        return auditObservationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AuditObservation create(@RequestBody AuditObservation observation) {
        if (observation.getCreatedBy() == null) observation.setCreatedBy("Admin");
        
        // Sync bi-directional relationship
        if (observation.getDetails() != null) {
            for (AuditObservationDetail detail : observation.getDetails()) {
                detail.setAuditObservation(observation);
            }
        }
        
        return auditObservationRepository.save(observation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditObservation> update(@PathVariable Long id, @RequestBody AuditObservation details) {
        return auditObservationRepository.findById(id)
                .map(observation -> {
                    observation.setObservationNo(details.getObservationNo());
                    observation.setObservationDate(details.getObservationDate());
                    observation.setAuditScheduleNo(details.getAuditScheduleNo());
                    observation.setAuditType(details.getAuditType());
                    observation.setDepartmentName(details.getDepartmentName());
                    observation.setAuditee(details.getAuditee());
                    observation.setAuditor(details.getAuditor());
                    observation.setNcrApprovedBy(details.getNcrApprovedBy());
                    observation.setStatus(details.getStatus());
                    observation.setAuditScore(details.getAuditScore());
                    observation.setOfiCount(details.getOfiCount());
                    observation.setComplianceCount(details.getComplianceCount());
                    observation.setNcrCount(details.getNcrCount());
                    observation.setUpdatedBy("Admin");

                    // Handle details update (clear and re-add for simplicity in this standard)
                    observation.getDetails().clear();
                    if (details.getDetails() != null) {
                        for (AuditObservationDetail d : details.getDetails()) {
                            d.setAuditObservation(observation);
                            observation.getDetails().add(d);
                        }
                    }

                    return ResponseEntity.ok(auditObservationRepository.save(observation));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return auditObservationRepository.findById(id)
                .map(observation -> {
                    auditObservationRepository.delete(observation);
                    return ResponseEntity.ok().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/next-no")
    public String getNextNo() {
        return auditObservationRepository.findFirstByOrderByObservationNoDesc()
                .map(latest -> incrementSequence(latest.getObservationNo(), "OB-"))
                .orElse("OB-001");
    }

    private String incrementSequence(String latest, String prefix) {
        if (latest == null || latest.isEmpty()) return prefix + "001";
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+$");
            java.util.regex.Matcher matcher = pattern.matcher(latest.trim());
            if (matcher.find()) {
                String numericPart = matcher.group();
                int num = Integer.parseInt(numericPart);
                int length = Math.max(numericPart.length(), 3);
                String nextNum = String.format("%0" + length + "d", num + 1);
                return latest.substring(0, matcher.start()).trim() + nextNum;
            }
            return prefix + "001";
        } catch (Exception e) {
            return prefix + "001";
        }
    }
}
