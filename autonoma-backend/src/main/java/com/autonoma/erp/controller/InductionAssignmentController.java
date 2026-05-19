package com.autonoma.erp.controller;

import com.autonoma.erp.model.InductionAssignment;
import com.autonoma.erp.service.InductionAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/induction-assignment")
@CrossOrigin(origins = "*")
public class InductionAssignmentController {

    @Autowired
    private InductionAssignmentService service;

    @GetMapping
    public ResponseEntity<List<InductionAssignment>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<InductionAssignment>> getActiveOnly() {
        return ResponseEntity.ok(service.getActiveOnly());
    }

    @GetMapping("/employee/{empCode}")
    public ResponseEntity<List<InductionAssignment>> getByEmployee(@PathVariable String empCode) {
        return ResponseEntity.ok(service.getByEmpCode(empCode));
    }

    @PostMapping
    @RequirePagePermission(pageCode = "HRA_IND_01", action = "write")
    public ResponseEntity<?> save(@RequestBody InductionAssignment entity, Principal principal) {
        try {
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            return ResponseEntity.ok(service.save(entity, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "HRA_IND_01", action = "write")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InductionAssignment entity, Principal principal) {
        try {
            entity.setId(id);
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            return ResponseEntity.ok(service.save(entity, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    @RequirePagePermission(pageCode = "HRA_IND_01", action = "write")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap, Principal principal) {
        try {
            String newStatus = statusMap.get("status");
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            service.updateStatus(id, newStatus, currentUser);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
