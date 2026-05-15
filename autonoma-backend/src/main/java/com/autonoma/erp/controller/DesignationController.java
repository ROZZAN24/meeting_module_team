package com.autonoma.erp.controller;

import com.autonoma.erp.model.Designation;
import com.autonoma.erp.repository.DesignationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/hrm/designations")
@CrossOrigin(origins = "*")
@Tag(name = "HRM - Designations", description = "Endpoints for managing job designations")
public class DesignationController {

    @Autowired
    private DesignationRepository designationRepository;

    @Operation(summary = "Get next available Designation Code")
    @GetMapping("/next-code")
    public ResponseEntity<String> getNextCode() {
        try {
            Integer maxCode = designationRepository.findMaxDesignationCode().orElse(0);
            return ResponseEntity.ok(String.valueOf(maxCode + 1));
        } catch (Exception e) {
            return ResponseEntity.ok("1");
        }
    }

    @GetMapping("/next-sl-no")
    public ResponseEntity<Integer> getNextSlNo() {
        try {
            return ResponseEntity.ok(designationRepository.findMaxDisplaySlNo().orElse(0) + 1);
        } catch (Exception e) {
            return ResponseEntity.ok(1);
        }
    }

    @GetMapping
    public List<Designation> getAll() {
        return designationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Designation> getById(@PathVariable Long id) {
        return designationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Designation designation) {
        if (designationRepository.existsByDesignationName(designation.getDesignationName())) {
            return ResponseEntity.badRequest().body("Designation Name already exists!");
        }
        if (designation.getCreatedBy() == null) {
            designation.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }
        return ResponseEntity.ok(designationRepository.save(designation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Designation designationDetails) {
        if (designationRepository.existsByDesignationNameAndIdNot(designationDetails.getDesignationName(), id)) {
            return ResponseEntity.badRequest().body("Designation Name already exists!");
        }
        return designationRepository.findById(id)
                .map(designation -> {
                    designation.setDesignationName(designationDetails.getDesignationName());
                    designation.setSubCategoryLevel(designationDetails.getSubCategoryLevel());
                    designation.setExperience(designationDetails.getExperience());
                    designation.setAppearInCompetency(designationDetails.getAppearInCompetency());
                    designation.setDisplaySlNo(designationDetails.getDisplaySlNo());
                    designation.setQualification(designationDetails.getQualification());
                    designation.setJobDescription(designationDetails.getJobDescription());
                    designation.setOrgSeqNo(designationDetails.getOrgSeqNo());
                    designation.setBudgetedPositions(designationDetails.getBudgetedPositions());
                    designation.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                    designation.setUpdatedDate(java.time.LocalDateTime.now());
                    return ResponseEntity.ok(designationRepository.save(designation));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return designationRepository.findById(id)
                .map(designation -> {
                    designationRepository.delete(designation);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
