package com.autonoma.erp.controller;


import com.autonoma.erp.security.RequirePagePermission;
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


    @RequirePagePermission(pageCode = "M5210", action = "write")
    public PaymentTerm create(@RequestBody PaymentTerm item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")


    @RequirePagePermission(pageCode = "M5210", action = "write")
    public ResponseEntity<PaymentTerm> update(@PathVariable Long id, @RequestBody PaymentTerm item) {
        return repository.findById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(repository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "M5210", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
