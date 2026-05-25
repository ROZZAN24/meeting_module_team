package com.autonoma.erp.controller;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.TypeOfService;
import com.autonoma.erp.repository.TypeOfServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/type-of-service")
@CrossOrigin(origins = "*")
public class TypeOfServiceController {

    @Autowired
    private TypeOfServiceRepository repository;

    @GetMapping
    public List<TypeOfService> getAll() {
        return repository.findAll();
    }

    @PostMapping


    @RequirePagePermission(pageCode = "SM1150", action = "write")
    public TypeOfService create(@RequestBody TypeOfService item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")


    @RequirePagePermission(pageCode = "SM1150", action = "write")
    public ResponseEntity<TypeOfService> update(@PathVariable Long id, @RequestBody TypeOfService item) {
        return repository.findById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(repository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "SM1150", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
