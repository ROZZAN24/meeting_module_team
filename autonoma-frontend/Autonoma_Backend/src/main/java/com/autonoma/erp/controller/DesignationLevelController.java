package com.autonoma.erp.controller;

import com.autonoma.erp.model.DesignationLevel;
import com.autonoma.erp.repository.DesignationLevelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;

import java.util.List;

@RestController
@RequestMapping("/api/master/hr/designationlevel")
@CrossOrigin(origins = "*")
public class DesignationLevelController {

    @Autowired
    private DesignationLevelRepository designationLevelRepository;

    @GetMapping("/next-screening-level")
    public ResponseEntity<Integer> getNextScreeningLevel() {
        try {
            return ResponseEntity.ok(designationLevelRepository.findMaxScreeningLevel().orElse(0) + 1);
        } catch (Exception e) {
            return ResponseEntity.ok(1);
        }
    }

    @GetMapping
    public List<DesignationLevel> getAll() {
        return designationLevelRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesignationLevel> getById(@PathVariable Long id) {
        return designationLevelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @RequirePagePermission(pageCode = "M2250", action = "write")
    public ResponseEntity<?> create(@RequestBody DesignationLevel level) {
        if (designationLevelRepository.existsByLevel(level.getLevel())) {
            return ResponseEntity.badRequest().body("Designation level already exists");
        }
        if (level.getCreatedBy() == null)
            level.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(designationLevelRepository.save(level));
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "M2250", action = "write")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody DesignationLevel levelDetails) {
        return designationLevelRepository.findById(id)
                .map(level -> {
                    if (!level.getLevel().equals(levelDetails.getLevel()) && designationLevelRepository.existsByLevel(levelDetails.getLevel())) {
                        return ResponseEntity.badRequest().body("Designation level already exists");
                    }
                    level.setLevel(levelDetails.getLevel());
                    level.setBasic(levelDetails.getBasic());
                    level.setDa(levelDetails.getDa());
                    level.setHra(levelDetails.getHra());
                    level.setScreeningLevel(levelDetails.getScreeningLevel());
                    level.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                    return ResponseEntity.ok(designationLevelRepository.save(level));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "M2250", action = "delete")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return designationLevelRepository.findById(id)
                .map(level -> {
                    designationLevelRepository.delete(level);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}

