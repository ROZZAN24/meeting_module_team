package com.autonoma.erp.service;

import com.autonoma.erp.model.Department;
import com.autonoma.erp.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getActiveDepartments() {
        return departmentRepository.findByStatus("Active");
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Department saveDepartment(Department department) {
        if (department.getCreatedBy() == null) {
            department.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public Optional<Department> getDepartmentByNo(String no) {
        return departmentRepository.findByDepartmentNo(no);
    }
}

