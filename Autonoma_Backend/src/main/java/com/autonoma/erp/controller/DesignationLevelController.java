package com.autonoma.erp.controller;

import com.autonoma.erp.model.DesignationLevel;
import com.autonoma.erp.repository.DesignationLevelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public DesignationLevel create(@RequestBody DesignationLevel level) {
        if (level.getCreatedBy() == null)
            level.setCreatedBy("Admin");
        return designationLevelRepository.save(level);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DesignationLevel> update(@PathVariable Long id, @RequestBody DesignationLevel levelDetails) {
        return designationLevelRepository.findById(id)
                .map(level -> {
                    level.setLevel(levelDetails.getLevel());
                    level.setBasic(levelDetails.getBasic());
                    level.setDa(levelDetails.getDa());
                    level.setHra(levelDetails.getHra());
                    level.setScreeningLevel(levelDetails.getScreeningLevel());
                    level.setUpdatedBy("Admin");
                    return ResponseEntity.ok(designationLevelRepository.save(level));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return designationLevelRepository.findById(id)
                .map(level -> {
                    designationLevelRepository.delete(level);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
