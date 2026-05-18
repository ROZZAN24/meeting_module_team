package com.autonoma.erp.controller;

import com.autonoma.erp.model.CustomerPotential;
import com.autonoma.erp.repository.CustomerPotentialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/sales/crm/potential")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CustomerPotentialController {

    private final CustomerPotentialRepository repository;

    public CustomerPotentialController(CustomerPotentialRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<CustomerPotential>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerPotential> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CustomerPotential item) {
        try {
            if (item.getCustomerCode() == null || item.getCustomerCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Customer Code is required.");
            }
            CustomerPotential saved = repository.save(item);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CustomerPotential item) {
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (item.getCustomerCode() == null || item.getCustomerCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Customer Code is required.");
            }
            item.setId(id);
            CustomerPotential updated = repository.save(item);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete: " + e.getMessage());
        }
    }
}
