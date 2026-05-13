package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditObservationDetail;
import com.autonoma.erp.repository.AuditObservationDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/qms/audit/ncr")
@CrossOrigin(origins = "*")
public class AuditNcrController {

    @Autowired
    private AuditObservationDetailRepository detailRepository;

    @GetMapping("/findings")
    public List<AuditObservationDetail> getAllFindings() {
        return detailRepository.findAllNcrAndOfi();
    }

    @PutMapping("/close/{id}")
    public ResponseEntity<AuditObservationDetail> closeNcr(@PathVariable Long id, @RequestBody AuditObservationDetail update) {
        return detailRepository.findById(id).map(detail -> {
            detail.setRootCause(update.getRootCause());
            detail.setCorrectiveAction(update.getCorrectiveAction());
            detail.setPreventiveAction(update.getPreventiveAction());
            detail.setClosedDate(new Date());
            detail.setClosedBy("Admin");
            detail.setNcrStatus("WAITING_APPROVAL");
            return ResponseEntity.ok(detailRepository.save(detail));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<AuditObservationDetail> approveNcr(@PathVariable Long id) {
        return detailRepository.findById(id).map(detail -> {
            detail.setNcrStatus("CLOSED");
            detail.setApprovalStatus("APPROVED");
            return ResponseEntity.ok(detailRepository.save(detail));
        }).orElse(ResponseEntity.notFound().build());
    }
}
