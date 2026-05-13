package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditObservationDetail;
import com.autonoma.erp.repository.AuditObservationDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Calendar;

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
            
            // Generate NCR No if not present (only for NCR status)
            if (detail.getNcrNo() == null && "NCR".equals(detail.getObservationStatus())) {
                detail.setNcrNo(generateNcrNo());
            }
            
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

    @GetMapping("/next-ncr-no")
    public String getNextNcrNo() {
        return generateNcrNo();
    }

    private String generateNcrNo() {
        AuditObservationDetail latest = detailRepository.findFirstByNcrNoIsNotNullOrderByNcrNoDesc();
        String prefix = "NCR-" + (Calendar.getInstance().get(Calendar.YEAR) % 100) + "-";
        
        if (latest == null || !latest.getNcrNo().startsWith(prefix)) {
            return prefix + "0001";
        }
        
        try {
            String lastNo = latest.getNcrNo().substring(prefix.length());
            int nextVal = Integer.parseInt(lastNo) + 1;
            return prefix + String.format("%04d", nextVal);
        } catch (Exception e) {
            return prefix + "0001";
        }
    }
}
