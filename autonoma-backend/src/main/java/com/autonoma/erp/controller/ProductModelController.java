package com.autonoma.erp.controller;

import com.autonoma.erp.model.ProductModel;
import com.autonoma.erp.model.ProductOem;
import com.autonoma.erp.repository.ProductModelRepository;
import com.autonoma.erp.repository.ProductOemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/master/npd/model")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductModelController {

    private final ProductModelRepository modelRepository;
    private final ProductOemRepository oemRepository;

    public ProductModelController(ProductModelRepository modelRepository, ProductOemRepository oemRepository) {
        this.modelRepository = modelRepository;
        this.oemRepository = oemRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductModel>> getAllModels() {
        try {
            return ResponseEntity.ok(modelRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductModel> getModelById(@PathVariable Long id) {
        return modelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createModel(@RequestBody ProductModel model) {
        try {
            if (model.getModelNo() == null || model.getModelNo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Model No is required.");
            }
            if (model.getOem() == null || model.getOem().getId() == null) {
                return ResponseEntity.badRequest().body("OEM selection is required.");
            }

            Optional<ProductOem> oemOpt = oemRepository.findById(model.getOem().getId());
            if (oemOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Selected OEM does not exist.");
            }

            if (modelRepository.existsByModelNoIgnoreCase(model.getModelNo().trim())) {
                return ResponseEntity.badRequest().body("Model No '" + model.getModelNo() + "' already exists.");
            }

            model.setOem(oemOpt.get());
            model.setModelNo(model.getModelNo().trim());
            if (model.getRotorDiameter() == null) {
                model.setRotorDiameter(0.0);
            }

            ProductModel saved = modelRepository.save(model);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create model: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateModel(@PathVariable Long id, @RequestBody ProductModel model) {
        try {
            if (!modelRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (model.getModelNo() == null || model.getModelNo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Model No is required.");
            }
            if (model.getOem() == null || model.getOem().getId() == null) {
                return ResponseEntity.badRequest().body("OEM selection is required.");
            }

            Optional<ProductOem> oemOpt = oemRepository.findById(model.getOem().getId());
            if (oemOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Selected OEM does not exist.");
            }

            if (modelRepository.existsByModelNoIgnoreCaseAndIdNot(model.getModelNo().trim(), id)) {
                return ResponseEntity.badRequest().body("Model No '" + model.getModelNo() + "' already exists.");
            }

            model.setId(id);
            model.setOem(oemOpt.get());
            model.setModelNo(model.getModelNo().trim());
            if (model.getRotorDiameter() == null) {
                model.setRotorDiameter(0.0);
            }

            ProductModel updated = modelRepository.save(model);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update model: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModel(@PathVariable Long id) {
        try {
            if (!modelRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            modelRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete model: " + e.getMessage());
        }
    }
}
