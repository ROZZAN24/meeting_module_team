package com.autonoma.erp.controller;

import com.autonoma.erp.model.ModeOfDespatch;
import com.autonoma.erp.service.ModeOfDespatchService;
import com.autonoma.erp.security.RequirePagePermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sm/despatch-mode")
@CrossOrigin(origins = "*")
public class ModeOfDespatchController {

    @Autowired
    private ModeOfDespatchService service;

    @GetMapping
    public List<ModeOfDespatch> getAll() {
        return service.getAll();
    }

    @GetMapping("/active")
    public List<ModeOfDespatch> getActive() {
        return service.getActive();
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M5290", action = "write")
    public ModeOfDespatch create(@RequestBody ModeOfDespatch item) {
        return service.save(item);
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M5290", action = "write")
    public ResponseEntity<ModeOfDespatch> update(@PathVariable Long id, @RequestBody ModeOfDespatch item) {
        return service.getById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(service.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M5290", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.getById(id)
                .map(existing -> {
                    service.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
