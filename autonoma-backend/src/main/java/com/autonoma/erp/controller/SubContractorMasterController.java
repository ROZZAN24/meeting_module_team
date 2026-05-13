package com.autonoma.erp.controller;

import com.autonoma.erp.model.SubContractorMaster;
import com.autonoma.erp.service.SubContractorMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sm/sub-contractors")
@CrossOrigin(origins = "*")
public class SubContractorMasterController {

    @Autowired
    private SubContractorMasterService service;

    @GetMapping
    public List<SubContractorMaster> getAllSubContractors() {
        return service.getAllSubContractors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubContractorMaster> getSubContractorById(@PathVariable Long id) {
        return service.getSubContractorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SubContractorMaster createSubContractor(@RequestBody SubContractorMaster subcontractor) {
        return service.saveSubContractor(subcontractor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubContractorMaster> updateSubContractor(@PathVariable Long id, @RequestBody SubContractorMaster subcontractor) {
        return service.getSubContractorById(id)
                .map(existing -> {
                    subcontractor.setId(id);
                    return ResponseEntity.ok(service.saveSubContractor(subcontractor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubContractor(@PathVariable Long id) {
        service.deleteSubContractor(id);
        return ResponseEntity.ok().build();
    }
}
