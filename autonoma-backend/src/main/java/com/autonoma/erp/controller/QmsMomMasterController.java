package com.autonoma.erp.controller;

import com.autonoma.erp.model.QmsMomMaster;
import com.autonoma.erp.service.QmsMomMasterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.autonoma.erp.security.RequirePagePermission;

import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.model.admin.UserCompanyMapping;
import com.autonoma.erp.model.admin.UserDivisionMapping;
import com.autonoma.erp.model.admin.CompanyCredential;
import com.autonoma.erp.model.Division;
import com.autonoma.erp.repository.admin.UserRepository;
import com.autonoma.erp.repository.admin.UserCompanyMappingRepository;
import com.autonoma.erp.repository.admin.UserDivisionMappingRepository;
import com.autonoma.erp.repository.admin.CompanyCredentialRepository;
import com.autonoma.erp.service.DivisionService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/qms/moms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QmsMomMasterController {
    private final QmsMomMasterService service;

    @Autowired private UserRepository userRepo;
    @Autowired private UserCompanyMappingRepository compMapRepo;
    @Autowired private UserDivisionMappingRepository divMapRepo;
    @Autowired private CompanyCredentialRepository compRepo;
    @Autowired private DivisionService divService;

    @GetMapping("/fix-users")
    public String fixUsers() {
        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
        List<UserCredential> users = userRepo.findAll();
        List<CompanyCredential> comps = compRepo.findAll();
        if (comps.isEmpty()) return "No companies found";
        
        for (UserCredential u : users) {
            for (CompanyCredential c : comps) {
                if (compMapRepo.findByUserId(u.getUserId()).stream().noneMatch(m -> m.getCompanyId().equals(c.getId()))) {
                    UserCompanyMapping m = new UserCompanyMapping();
                    m.setUserId(u.getUserId());
                    m.setCompanyId(c.getId());
                    compMapRepo.save(m);
                }
                
                List<Division> divs = divService.getActiveDivisionsByCompany(c.getId());
                for (Division d : divs) {
                    if (divMapRepo.findByUserId(u.getUserId()).stream().noneMatch(m -> m.getDivisionId().equals(d.getId()))) {
                        UserDivisionMapping m = new UserDivisionMapping();
                        m.setUserId(u.getUserId());
                        m.setDivisionId(d.getId());
                        divMapRepo.save(m);
                    }
                }
            }
        }
        return "Done mapping all users to all companies and divisions";
    }

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
    @RequirePagePermission(pageCode = "QM1320", action = "write")
    public ResponseEntity<QmsMomMaster> create(@RequestBody QmsMomMaster mom) {
        return ResponseEntity.ok(service.saveMom(mom));
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "QM1320", action = "write")
    public ResponseEntity<QmsMomMaster> update(@PathVariable Long id, @RequestBody QmsMomMaster mom) {
        mom.setId(id);
        return ResponseEntity.ok(service.saveMom(mom));
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "QM1320", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteMom(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Reassign endpoint =====
    @PutMapping("/reassign")
    @RequirePagePermission(pageCode = "QM1320", action = "write")
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
    @RequirePagePermission(pageCode = "QM1340", action = "write")
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
    @RequirePagePermission(pageCode = "QM1350", action = "approval")
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
    @RequirePagePermission(pageCode = "QM1350", action = "approval")
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
