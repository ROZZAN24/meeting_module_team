package com.autonoma.erp.controller;

import com.autonoma.erp.model.DepartmentMaster;
import com.autonoma.erp.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/master/hr/department")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<Page<DepartmentMaster>> getAllDepartments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "deptNo") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(departmentService.getAllDepartments(status, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentMaster> getDepartmentById(@PathVariable Long id) {
        Optional<DepartmentMaster> department = departmentService.getDepartmentById(id);
        return department.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-dept-no/{deptNo}")
    public ResponseEntity<DepartmentMaster> getDepartmentByDeptNo(@PathVariable Integer deptNo) {
        Optional<DepartmentMaster> department = departmentService.getDepartmentByDeptNo(deptNo);
        return department.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DepartmentMaster> createDepartment(@RequestBody DepartmentMaster department) {
        return ResponseEntity.ok(departmentService.saveDepartment(department));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentMaster> updateDepartment(
            @PathVariable Long id,
            @RequestBody DepartmentMaster department) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, department));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/next-dept-no")
    public ResponseEntity<Map<String, Integer>> getNextDeptNo() {
        return ResponseEntity.ok(Map.of("nextDeptNo", departmentService.getNextDeptNo()));
    }
}
