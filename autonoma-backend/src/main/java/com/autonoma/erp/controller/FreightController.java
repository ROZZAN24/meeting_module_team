package com.autonoma.erp.controller;

import com.autonoma.erp.model.Freight;
import com.autonoma.erp.service.FreightService;
import com.autonoma.erp.security.RequirePagePermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sm/freight")
@CrossOrigin(origins = "*")
public class FreightController {

    @Autowired
    private FreightService service;

    @GetMapping
    public List<Freight> getAll() {
        return service.getAll();
    }

    @GetMapping("/active")
    public List<Freight> getActive() {
        return service.getActive();
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M5300", action = "write")
    public Freight create(@RequestBody Freight item) {
        return service.save(item);
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M5300", action = "write")
    public ResponseEntity<Freight> update(@PathVariable Long id, @RequestBody Freight item) {
        return service.getById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(service.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M5300", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.getById(id)
                .map(existing -> {
                    service.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
