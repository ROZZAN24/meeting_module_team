package com.autonoma.erp.service;

import com.autonoma.erp.model.DepartmentMaster;
import com.autonoma.erp.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public Page<DepartmentMaster> getAllDepartments(String status, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            if (status != null && !status.isEmpty() && !"All".equalsIgnoreCase(status)) {
                return departmentRepository.searchByKeywordAndStatus(search, status, pageable);
            }
            return departmentRepository.searchByKeyword(search, pageable);
        }
        
        if (status != null && !status.isEmpty() && !"All".equalsIgnoreCase(status)) {
            return departmentRepository.findByStatus(status, pageable);
        }
        
        return departmentRepository.findAll(pageable);
    }

    public Optional<DepartmentMaster> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Optional<DepartmentMaster> getDepartmentByDeptNo(Integer deptNo) {
        return departmentRepository.findByDeptNo(deptNo);
    }

    @Transactional
    public DepartmentMaster saveDepartment(DepartmentMaster department) {
        if (department.getId() == null) {
            // New department - generate deptNo if not provided
            if (department.getDeptNo() == null) {
                department.setDeptNo(getNextDeptNo());
            }
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public DepartmentMaster updateDepartment(Long id, DepartmentMaster department) {
        Optional<DepartmentMaster> existing = departmentRepository.findById(id);
        if (existing.isPresent()) {
            DepartmentMaster updated = existing.get();
            updated.setDeptName(department.getDeptName());
            updated.setNdaCertificate(department.getNdaCertificate());
            updated.setSeqNo(department.getSeqNo());
            updated.setStatus(department.getStatus());
            return departmentRepository.save(updated);
        }
        throw new RuntimeException("Department not found with id: " + id);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public Integer getNextDeptNo() {
        Integer maxDeptNo = departmentRepository.findMaxDeptNo();
        return (maxDeptNo != null) ? maxDeptNo + 10 : 10;
    }

    public boolean existsByDeptNo(Integer deptNo) {
        return departmentRepository.existsByDeptNo(deptNo);
    }
}
