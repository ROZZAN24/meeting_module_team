package com.autonoma.erp.controller;

import com.autonoma.erp.model.EmailContent;
import com.autonoma.erp.service.EmailContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/hr/email-content")
@CrossOrigin(origins = "*")
public class EmailContentController {

    @Autowired
    private EmailContentService service;

    @GetMapping
    public ResponseEntity<List<EmailContent>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/next-sequence")
    public ResponseEntity<Long> getNextSequence() {
        return ResponseEntity.ok(service.getNextSequence());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailContent> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M2120", action = "write")
    public ResponseEntity<?> save(@RequestBody EmailContent entity, Principal principal) {
        try {
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            return ResponseEntity.ok(service.save(entity, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M2120", action = "write")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EmailContent entity, Principal principal) {
        try {
            entity.setId(id);
            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            return ResponseEntity.ok(service.save(entity, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M2120", action = "delete")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
