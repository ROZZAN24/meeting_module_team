package com.autonoma.erp.controller;

import com.autonoma.erp.model.InterviewMaster;
import com.autonoma.erp.service.InterviewMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/hr/interview-master")
@CrossOrigin(origins = "*")
public class InterviewMasterController {

    @Autowired
    private InterviewMasterService service;

    @GetMapping
    public ResponseEntity<List<InterviewMaster>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/next-sequence")
    public ResponseEntity<Long> getNextSequence() {
        return ResponseEntity.ok(service.getNextSequence());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewMaster> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M2110", action = "write")
    public ResponseEntity<?> save(@RequestBody InterviewMaster entity, Principal principal) {
        try {
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            return ResponseEntity.ok(service.save(entity, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M2110", action = "write")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InterviewMaster entity, Principal principal) {
        try {
            entity.setId(id);
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            return ResponseEntity.ok(service.save(entity, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M2110", action = "delete")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
