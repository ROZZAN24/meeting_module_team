package com.autonoma.erp.controller;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.Currency;
import com.autonoma.erp.repository.CurrencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/currency")
@CrossOrigin(origins = "*")
public class CurrencyController {

    @Autowired
    private CurrencyRepository repository;

    @GetMapping
    public List<Currency> getAll() {
        return repository.findAll();
    }

    @PostMapping


    @RequirePagePermission(pageCode = "M5230", action = "write")
    public Currency create(@RequestBody Currency item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")


    @RequirePagePermission(pageCode = "M5230", action = "write")
    public ResponseEntity<Currency> update(@PathVariable Long id, @RequestBody Currency item) {
        return repository.findById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(repository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "M5230", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
