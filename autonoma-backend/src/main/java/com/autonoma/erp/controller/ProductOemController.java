package com.autonoma.erp.controller;

import com.autonoma.erp.model.ProductOem;
import com.autonoma.erp.repository.ProductOemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/npd/oem")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductOemController {

    private final ProductOemRepository oemRepository;

    public ProductOemController(ProductOemRepository oemRepository) {
        this.oemRepository = oemRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductOem>> getAllOems() {
        try {
            return ResponseEntity.ok(oemRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductOem> getOemById(@PathVariable Long id) {
        return oemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOem(@RequestBody ProductOem oem) {
        try {
            if (oem.getOemShortName() == null || oem.getOemShortName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("OEM Short Name is required.");
            }

            if (oemRepository.existsByOemShortNameIgnoreCase(oem.getOemShortName().trim())) {
                return ResponseEntity.badRequest().body("OEM Short Name '" + oem.getOemShortName() + "' already exists.");
            }

            oem.setOemShortName(oem.getOemShortName().trim());
            if (oem.getOemPrefix() != null) {
                oem.setOemPrefix(oem.getOemPrefix().trim().toUpperCase());
            }
            if (oem.getOemDescription() != null) {
                oem.setOemDescription(oem.getOemDescription().trim());
            }
            if (oem.getOriginCountry() != null) {
                oem.setOriginCountry(oem.getOriginCountry().trim());
            }
            if (oem.getStatusYear() != null) {
                oem.setStatusYear(oem.getStatusYear().trim());
            }

            ProductOem saved = oemRepository.save(oem);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create OEM: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOem(@PathVariable Long id, @RequestBody ProductOem oem) {
        try {
            if (!oemRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (oem.getOemShortName() == null || oem.getOemShortName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("OEM Short Name is required.");
            }

            if (oemRepository.existsByOemShortNameIgnoreCaseAndIdNot(oem.getOemShortName().trim(), id)) {
                return ResponseEntity.badRequest().body("OEM Short Name '" + oem.getOemShortName() + "' already exists.");
            }

            oem.setId(id);
            oem.setOemShortName(oem.getOemShortName().trim());
            if (oem.getOemPrefix() != null) {
                oem.setOemPrefix(oem.getOemPrefix().trim().toUpperCase());
            }
            if (oem.getOemDescription() != null) {
                oem.setOemDescription(oem.getOemDescription().trim());
            }
            if (oem.getOriginCountry() != null) {
                oem.setOriginCountry(oem.getOriginCountry().trim());
            }
            if (oem.getStatusYear() != null) {
                oem.setStatusYear(oem.getStatusYear().trim());
            }

            ProductOem updated = oemRepository.save(oem);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update OEM: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOem(@PathVariable Long id) {
        try {
            if (!oemRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            oemRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete OEM: " + e.getMessage());
        }
    }
}
