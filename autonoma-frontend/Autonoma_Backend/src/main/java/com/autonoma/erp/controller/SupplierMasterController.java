package com.autonoma.erp.controller;

import com.autonoma.erp.model.SupplierMaster;
import com.autonoma.erp.service.SupplierMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sm/suppliers")
@CrossOrigin(origins = "*")
public class SupplierMasterController {

    @Autowired
    private SupplierMasterService service;

    @GetMapping
    public List<SupplierMaster> getAllSuppliers() {
        return service.getAllSuppliers();
    }

    @GetMapping("/next-code")
    public String getNextCode() {
        return service.getNextCode();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierMaster> getSupplierById(@PathVariable Long id) {
        return service.getSupplierById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SupplierMaster createSupplier(@RequestBody SupplierMaster supplier) {
        return service.saveSupplier(supplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierMaster> updateSupplier(@PathVariable Long id, @RequestBody SupplierMaster supplier) {
        return service.getSupplierById(id)
                .map(existing -> {
                    supplier.setId(id);
                    return ResponseEntity.ok(service.saveSupplier(supplier));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        service.deleteSupplier(id);
        return ResponseEntity.ok().build();
    }
}
