package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditObservation;
import com.autonoma.erp.model.AuditObservationDetail;
import com.autonoma.erp.repository.AuditObservationRepository;
import com.autonoma.erp.dto.NcrOfiDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/qms/audit/observation")
@CrossOrigin(origins = "*")
@Tag(name = "QMS - Audit Observation", description = "Endpoints for recording audit findings and scoring")
public class AuditObservationController {

    @Autowired
    private AuditObservationRepository auditObservationRepository;

    @Autowired
    private com.autonoma.erp.repository.AuditObservationDetailRepository auditObservationDetailRepository;

    @Autowired
    private com.autonoma.erp.service.NcrOfiService ncrOfiService;

    @PostMapping("/ncr/submit")
    @Operation(summary = "Submit NCR Closure", description = "Saves corrective actions and updates finding status")
    public ResponseEntity<?> submitNcrClosure(@RequestBody java.util.Map<String, Object> payload) {
        try {
            ncrOfiService.processNcrClosure(payload);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/ncr/findings")
    @Operation(summary = "Get Pending NCR Findings", description = "Fetches all NCR/OFI observations that are not yet closed")
    public List<NcrOfiDto> getPendingNcrFindings(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false, defaultValue = "No") String considerDate,
            @RequestParam(required = false) String taskType,
            @RequestParam(required = false) String observationStatus,
            @RequestParam(required = false) String ncrStatus,
            @RequestParam(required = false) String ncrApprovedBy,
            @RequestParam(required = false) String query) {
        
        List<AuditObservationDetail> details = auditObservationDetailRepository.findPendingNcrFindingsFiltered(
                fromDate, toDate, considerDate, observationStatus, ncrStatus, ncrApprovedBy, query);
                
        return details.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private NcrOfiDto convertToDto(AuditObservationDetail detail) {
        NcrOfiDto dto = new NcrOfiDto();
        dto.setId(detail.getId());
        dto.setObservationId(detail.getAuditObservation() != null ? detail.getAuditObservation().getId().intValue() : null);
        dto.setObservationNo(detail.getAuditObservation() != null ? detail.getAuditObservation().getObservationNo() : null);
        dto.setObservationDate(detail.getAuditObservation() != null ? detail.getAuditObservation().getObservationDate() : null);
        dto.setCreatedDate(detail.getAuditObservation() != null ? detail.getAuditObservation().getCreatedAt() : null);
        dto.setAuditScheduleNo(detail.getAuditObservation() != null ? detail.getAuditObservation().getAuditScheduleNo() : null);
        dto.setAuditType(detail.getAuditObservation() != null ? detail.getAuditObservation().getAuditType() : null);
        dto.setDepartmentName(detail.getAuditObservation() != null ? detail.getAuditObservation().getDepartmentName() : null);
        dto.setAuditee(detail.getAuditObservation() != null ? detail.getAuditObservation().getAuditee() : null);
        dto.setAuditor(detail.getAuditObservation() != null ? detail.getAuditObservation().getAuditor() : null);
        dto.setNcrApprovedBy(detail.getAuditObservation() != null ? detail.getAuditObservation().getNcrApprovedBy() : null);
        
        dto.setSeqNo(detail.getSeqNo());
        dto.setClause(detail.getClause());
        dto.setCriteriaDetails(detail.getCriteriaDetails());
        dto.setAttachmentReq(detail.getAttachmentReq());
        dto.setObservationStatus(detail.getObservationStatus());
        dto.setNcrStatus(detail.getNcrStatus());
        dto.setRootCause(detail.getRootCause());
        dto.setCorrectiveAction(detail.getCorrectiveAction());
        dto.setPreventiveAction(detail.getPreventiveAction());
        dto.setTargetDate(detail.getTargetDate());
        dto.setRemarks(detail.getComments());
        
        return dto;
    }

    @GetMapping
    @Operation(summary = "Get All Observations", description = "Fetches a list of all audit observations")
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
    @Operation(summary = "Create Observation", description = "Saves a new audit observation with findings details")
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
    
    @PutMapping("/ncr/approve/{detailId}")
    @Operation(summary = "Approve NCR Closure", description = "Approves the corrective action and closes the finding")
    public ResponseEntity<?> approveNcr(@PathVariable Integer detailId) {
        try {
            ncrOfiService.approveNcr(detailId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/ncr/reject/{detailId}")
    @Operation(summary = "Reject NCR Closure", description = "Rejects the closure and sends back to owner")
    public ResponseEntity<?> rejectNcr(@PathVariable Integer detailId, @RequestParam(required = false) String remarks) {
        try {
            ncrOfiService.rejectNcr(detailId, remarks);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/ncr/rework/{detailId}")
    @Operation(summary = "Request Rework", description = "Sends finding back for corrective action rework")
    public ResponseEntity<?> reworkNcr(@PathVariable Integer detailId, @RequestParam(required = false) String remarks) {
        try {
            ncrOfiService.reworkNcr(detailId, remarks);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
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
    @Operation(summary = "Get Next Observation Number", description = "Generates the next available OB-XXXX sequence")
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
