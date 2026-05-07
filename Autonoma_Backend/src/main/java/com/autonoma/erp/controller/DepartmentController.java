package com.autonoma.erp.controller;

import com.autonoma.erp.model.Department;
import com.autonoma.erp.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hrm/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private com.autonoma.erp.repository.DepartmentRepository departmentRepository;

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @PostMapping
    public ResponseEntity<Department> saveDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.saveDepartment(department));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails) {
        return departmentRepository.findById(id)
                .map(department -> {
                    department.setDepartmentName(departmentDetails.getDepartmentName());
                    department.setDepartmentNo(departmentDetails.getDepartmentNo());
                    department.setNdaCertificate(departmentDetails.getNdaCertificate());
                    department.setSequenceNo(departmentDetails.getSequenceNo());
                    department.setStatus(departmentDetails.getStatus());
                    department.setUpdatedBy("admin");
                    return ResponseEntity.ok(departmentRepository.save(department));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/next-code")
    public Integer getNextCode() {
        return departmentRepository.findMaxDepartmentNo().orElse(0) + 1;
    }

    @GetMapping("/next-seq")
    public Integer getNextSeq() {
        return departmentRepository.findMaxSequenceNo().orElse(0) + 1;
    }
}
