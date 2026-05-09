package com.autonoma.erp.controller;

import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.service.EmployeeMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/api/master/employee")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "HRM - Employee Master", description = "Endpoints for managing employee records")
public class EmployeeMasterController {

    @Autowired
    private EmployeeMasterService service;

    @GetMapping
    @Operation(summary = "Get All Employees", description = "Fetches a complete list of employees")
    public List<EmployeeMaster> getAllEmployees() {
        return service.getAllEmployees();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeMaster> getEmployeeById(@PathVariable Long id) {
        EmployeeMaster employee = service.getEmployeeById(id);
        if (employee != null) {
            return ResponseEntity.ok(employee);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public EmployeeMaster createEmployee(@RequestBody EmployeeMaster employee) {
        return service.createEmployee(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeMaster> updateEmployee(@PathVariable Long id, @RequestBody EmployeeMaster employeeDetails) {
        EmployeeMaster updatedEmployee = service.updateEmployee(id, employeeDetails);
        if (updatedEmployee != null) {
            return ResponseEntity.ok(updatedEmployee);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        service.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }
}
