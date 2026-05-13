package com.autonoma.erp.controller;

import com.autonoma.erp.model.QmsMomMaster;
import com.autonoma.erp.service.QmsMomMasterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qms/moms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QmsMomMasterController {
    private final QmsMomMasterService service;

    @GetMapping
    public List<QmsMomMaster> getAll() {
        return service.getAllMoms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QmsMomMaster> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getMomById(id));
    }

    @GetMapping("/actions")
    public ResponseEntity<List<com.autonoma.erp.dto.MomActionSummaryDTO>> getAllActions() {
        return ResponseEntity.ok(service.getAllActions());
    }

    @PostMapping
    public ResponseEntity<QmsMomMaster> create(@RequestBody QmsMomMaster mom) {
        return ResponseEntity.ok(service.saveMom(mom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QmsMomMaster> update(@PathVariable Long id, @RequestBody QmsMomMaster mom) {
        mom.setId(id);
        return ResponseEntity.ok(service.saveMom(mom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteMom(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Reassign endpoint =====
    @PutMapping("/reassign")
    public ResponseEntity<?> reassign(@RequestBody Map<String, Object> data) {
        try {
            service.reassignDetails(data);
            return ResponseEntity.ok(Map.of("message", "Reassigned successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ===== Close MOM detail (submit for approval) =====
    @PutMapping("/{momId}/details/{detailId}/close")
    public ResponseEntity<?> closeDetail(@PathVariable Long momId, @PathVariable Long detailId,
                                          @RequestBody Map<String, Object> data) {
        try {
            service.closeDetail(momId, detailId, data);
            return ResponseEntity.ok(Map.of("message", "Submitted for approval"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ===== Approve MOM detail =====
    @PutMapping("/{momId}/details/{detailId}/approve")
    public ResponseEntity<?> approveDetail(@PathVariable Long momId, @PathVariable Long detailId,
                                            @RequestBody Map<String, Object> data) {
        try {
            service.approveDetail(momId, detailId);
            return ResponseEntity.ok(Map.of("message", "Approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ===== Reject MOM detail =====
    @PutMapping("/{momId}/details/{detailId}/reject")
    public ResponseEntity<?> rejectDetail(@PathVariable Long momId, @PathVariable Long detailId,
                                           @RequestBody Map<String, Object> data) {
        try {
            String comments = data.get("comments") != null ? data.get("comments").toString() : "";
            service.rejectDetail(momId, detailId, comments);
            return ResponseEntity.ok(Map.of("message", "Rejected"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
