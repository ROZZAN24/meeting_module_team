package com.autonoma.erp.controller;

import com.autonoma.erp.model.CountryMaster;
import com.autonoma.erp.repository.CountryMasterRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/countries")
@Tag(name = "Country Master", description = "Country Master Management APIs")
public class CountryMasterController {

    @Autowired
    private CountryMasterRepository repository;

    @GetMapping
    public List<CountryMaster> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CountryMaster> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CountryMaster create(@RequestBody CountryMaster item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CountryMaster> update(@PathVariable Long id, @RequestBody CountryMaster item) {
        return repository.findById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(repository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
