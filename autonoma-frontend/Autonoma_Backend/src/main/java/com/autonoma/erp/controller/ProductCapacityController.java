package com.autonoma.erp.controller;

import com.autonoma.erp.model.ProductCapacity;
import com.autonoma.erp.model.ProductModel;
import com.autonoma.erp.repository.ProductCapacityRepository;
import com.autonoma.erp.repository.ProductModelRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/master/npd/capacity")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductCapacityController {

    private final ProductCapacityRepository capacityRepository;
    private final ProductModelRepository modelRepository;

    public ProductCapacityController(ProductCapacityRepository capacityRepository, ProductModelRepository modelRepository) {
        this.capacityRepository = capacityRepository;
        this.modelRepository = modelRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductCapacity>> getAllCapacities() {
        try {
            return ResponseEntity.ok(capacityRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductCapacity> getCapacityById(@PathVariable Long id) {
        return capacityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M3170", action = "write")
    public ResponseEntity<?> createCapacity(@RequestBody ProductCapacity capacity) {
        try {
            if (capacity.getUom() == null || capacity.getUom().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("UOM is required.");
            }
            if (capacity.getCapacityVal() == null) {
                return ResponseEntity.badRequest().body("Capacity value is required.");
            }
            if (capacity.getModel() == null || capacity.getModel().getId() == null) {
                return ResponseEntity.badRequest().body("Model Name selection is required.");
            }

            Optional<ProductModel> modelOpt = modelRepository.findById(capacity.getModel().getId());
            if (modelOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Selected Model Name does not exist.");
            }

            String cleanUom = capacity.getUom().trim().toUpperCase();
            if (!List.of("KW", "MW").contains(cleanUom)) {
                return ResponseEntity.badRequest().body("Invalid UOM. Supported units are KW and MW.");
            }

            if (capacityRepository.existsByModelIdAndUomIgnoreCaseAndCapacityVal(
                    modelOpt.get().getId(), cleanUom, capacity.getCapacityVal())) {
                return ResponseEntity.badRequest().body("Capacity entry with this Model, UOM, and Value already exists.");
            }

            capacity.setModel(modelOpt.get());
            capacity.setUom(cleanUom);

            ProductCapacity saved = capacityRepository.save(capacity);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create capacity: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M3170", action = "write")
    public ResponseEntity<?> updateCapacity(@PathVariable Long id, @RequestBody ProductCapacity capacity) {
        try {
            if (!capacityRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (capacity.getUom() == null || capacity.getUom().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("UOM is required.");
            }
            if (capacity.getCapacityVal() == null) {
                return ResponseEntity.badRequest().body("Capacity value is required.");
            }
            if (capacity.getModel() == null || capacity.getModel().getId() == null) {
                return ResponseEntity.badRequest().body("Model Name selection is required.");
            }

            Optional<ProductModel> modelOpt = modelRepository.findById(capacity.getModel().getId());
            if (modelOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Selected Model Name does not exist.");
            }

            String cleanUom = capacity.getUom().trim().toUpperCase();
            if (!List.of("KW", "MW").contains(cleanUom)) {
                return ResponseEntity.badRequest().body("Invalid UOM. Supported units are KW and MW.");
            }

            if (capacityRepository.existsByModelIdAndUomIgnoreCaseAndCapacityValAndIdNot(
                    modelOpt.get().getId(), cleanUom, capacity.getCapacityVal(), id)) {
                return ResponseEntity.badRequest().body("Capacity entry with this Model, UOM, and Value already exists.");
            }

            capacity.setId(id);
            capacity.setModel(modelOpt.get());
            capacity.setUom(cleanUom);

            ProductCapacity updated = capacityRepository.save(capacity);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update capacity: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M3170", action = "delete")
    public ResponseEntity<?> deleteCapacity(@PathVariable Long id) {
        try {
            if (!capacityRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            capacityRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete capacity: " + e.getMessage());
        }
    }
}
