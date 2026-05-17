package com.autonoma.erp.controller;

import com.autonoma.erp.model.DeliveryTerm;
import com.autonoma.erp.repository.DeliveryTermRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/delivery-terms")
@CrossOrigin(origins = "*")
public class DeliveryTermController {

    @Autowired
    private DeliveryTermRepository repository;

    @GetMapping
    public List<DeliveryTerm> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody DeliveryTerm item) {
        if (repository.existsByTermNameIgnoreCase(item.getTermName())) {
            return ResponseEntity.badRequest().body("Delivery Term Name already exists");
        }
        return ResponseEntity.ok(repository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody DeliveryTerm item) {
        return repository.findById(id)
                .map(existing -> {
                    if (!existing.getTermName().equalsIgnoreCase(item.getTermName()) && repository.existsByTermNameIgnoreCase(item.getTermName())) {
                        return ResponseEntity.badRequest().body("Delivery Term Name already exists");
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
