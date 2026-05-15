package com.autonoma.erp.controller;

import com.autonoma.erp.model.Department;
import com.autonoma.erp.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/hrm/departments")
@CrossOrigin(origins = "*")
@Tag(name = "HRM - Departments", description = "Endpoints for managing organization departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private com.autonoma.erp.repository.DepartmentRepository departmentRepository;

    @Operation(summary = "Get next available Department Number")
    @GetMapping("/next-code")
    public ResponseEntity<Integer> getNextCode() {
        return ResponseEntity.ok(departmentRepository.findMaxDepartmentNo().orElse(0) + 1);
    }

    @GetMapping("/next-seq")
    public ResponseEntity<Integer> getNextSeq() {
        return ResponseEntity.ok(departmentRepository.findMaxSequenceNo().orElse(0) + 1);
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @Operation(summary = "Get all active departments")
    @GetMapping("/active")
    public List<Department> getActiveDepartments() {
        return departmentService.getActiveDepartments();
    }

    @PostMapping
    public ResponseEntity<?> saveDepartment(@RequestBody Department department) {
        String name = department.getDepartmentName() != null ? department.getDepartmentName() : "";
        // Deep Sanitize: Replace non-breaking spaces and all types of whitespace with standard space
        String sanitizedName = name.replaceAll("\\s+", " ").trim();
        
        if (departmentRepository.existsByNameNative(sanitizedName) > 0) {
            return ResponseEntity.badRequest().body("Department Name already exists!");
        }
        department.setDepartmentName(sanitizedName);
        return ResponseEntity.ok(departmentService.saveDepartment(department));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails) {
        String name = departmentDetails.getDepartmentName() != null ? departmentDetails.getDepartmentName() : "";
        String sanitizedName = name.replaceAll("\\s+", " ").trim();

        if (departmentRepository.existsByNameNativeWithId(sanitizedName, id) > 0) {
            return ResponseEntity.badRequest().body("Department Name already exists!");
        }
        return departmentRepository.findById(id)
                .map(department -> {
                    department.setDepartmentName(sanitizedName);
                    department.setDepartmentNo(departmentDetails.getDepartmentNo());
                    department.setNdaCertificate(departmentDetails.getNdaCertificate());
                    department.setSequenceNo(departmentDetails.getSequenceNo());
                    department.setStatus(departmentDetails.getStatus());
                    return ResponseEntity.ok(departmentRepository.save(department));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok().build();
    }
}
