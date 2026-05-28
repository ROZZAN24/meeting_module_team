package com.autonoma.erp.controller;

import com.autonoma.erp.model.ProductProcess;
import com.autonoma.erp.repository.ProductProcessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;

import java.util.List;

@RestController
@RequestMapping("/api/master/npd/process")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductProcessController {

    private final ProductProcessRepository processRepository;

    public ProductProcessController(ProductProcessRepository processRepository) {
        this.processRepository = processRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductProcess>> getAllProcesses() {
        try {
            return ResponseEntity.ok(processRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductProcess> getProcessById(@PathVariable Long id) {
        return processRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M3180", action = "write")
    public ResponseEntity<?> createProcess(@RequestBody ProductProcess process) {
        try {
            if (process.getProcessName() == null || process.getProcessName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Process Name is required.");
            }

            if (processRepository.existsByProcessNameIgnoreCase(process.getProcessName().trim())) {
                return ResponseEntity.badRequest().body("Process Name '" + process.getProcessName() + "' already exists.");
            }

            process.setProcessName(process.getProcessName().trim());
            if (process.getDescription() != null) {
                process.setDescription(process.getDescription().trim());
            }

            ProductProcess saved = processRepository.save(process);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create process: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M3180", action = "write")
    public ResponseEntity<?> updateProcess(@PathVariable Long id, @RequestBody ProductProcess process) {
        try {
            if (!processRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (process.getProcessName() == null || process.getProcessName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Process Name is required.");
            }

            if (processRepository.existsByProcessNameIgnoreCaseAndIdNot(process.getProcessName().trim(), id)) {
                return ResponseEntity.badRequest().body("Process Name '" + process.getProcessName() + "' already exists.");
            }

            process.setId(id);
            process.setProcessName(process.getProcessName().trim());
            if (process.getDescription() != null) {
                process.setDescription(process.getDescription().trim());
            }

            ProductProcess updated = processRepository.save(process);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update process: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M3180", action = "delete")
    public ResponseEntity<?> deleteProcess(@PathVariable Long id) {
        try {
            if (!processRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            processRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete process: " + e.getMessage());
        }
    }
}
