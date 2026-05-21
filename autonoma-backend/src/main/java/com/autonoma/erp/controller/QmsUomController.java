package com.autonoma.erp.controller;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.QmsUom;
import com.autonoma.erp.repository.QmsUomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/qms/uom")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class QmsUomController {

    private final QmsUomRepository repository;

    public QmsUomController(QmsUomRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<QmsUom>> getAllUoms() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<QmsUom> getUomById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping


    @RequirePagePermission(pageCode = "M5240", action = "write")
    public ResponseEntity<?> createUom(@RequestBody QmsUom uom) {
        try {
            if (uom.getUomCode() == null || uom.getUomCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("UOM Code is required.");
            }

            String cleanVal = uom.getUomCode().trim().toUpperCase();
            if (repository.existsByUomCodeIgnoreCase(cleanVal)) {
                return ResponseEntity.badRequest().body("UOM Code '" + cleanVal + "' already exists.");
            }

            uom.setUomCode(cleanVal);
            QmsUom saved = repository.save(uom);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create UOM: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")


    @RequirePagePermission(pageCode = "M5240", action = "write")
    public ResponseEntity<?> updateUom(@PathVariable Long id, @RequestBody QmsUom uom) {
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (uom.getUomCode() == null || uom.getUomCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("UOM Code is required.");
            }

            String cleanVal = uom.getUomCode().trim().toUpperCase();
            if (repository.existsByUomCodeIgnoreCaseAndIdNot(cleanVal, id)) {
                return ResponseEntity.badRequest().body("UOM Code '" + cleanVal + "' already exists.");
            }

            uom.setId(id);
            uom.setUomCode(cleanVal);
            QmsUom updated = repository.save(uom);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update UOM: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "M5240", action = "delete")
    public ResponseEntity<?> deleteUom(@PathVariable Long id) {
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete UOM: " + e.getMessage());
        }
    }
}
