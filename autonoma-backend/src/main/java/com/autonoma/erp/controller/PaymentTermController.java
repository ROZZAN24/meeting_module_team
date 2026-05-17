package com.autonoma.erp.controller;

import com.autonoma.erp.model.PaymentTerm;
import com.autonoma.erp.repository.PaymentTermRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payment-terms")
@CrossOrigin(origins = "*")
public class PaymentTermController {

    @Autowired
    private PaymentTermRepository repository;

    @GetMapping
    public List<PaymentTerm> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PaymentTerm item) {
        if (repository.existsByTermNameIgnoreCase(item.getTermName())) {
            return ResponseEntity.badRequest().body("Payment Term Name already exists");
        }
        return ResponseEntity.ok(repository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody PaymentTerm item) {
        return repository.findById(id)
                .map(existing -> {
                    if (!existing.getTermName().equalsIgnoreCase(item.getTermName()) && repository.existsByTermNameIgnoreCase(item.getTermName())) {
                        return ResponseEntity.badRequest().body("Payment Term Name already exists");
                    }
                    existing.setTermName(item.getTermName());
                    existing.setDescription(item.getDescription());
                    existing.setStatus(item.getStatus());
                    existing.setUpdatedBy(item.getUpdatedBy());
                    return ResponseEntity.ok(repository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
