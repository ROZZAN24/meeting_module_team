package com.autonoma.erp.service;

import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class EmployeeMasterService {

    @Autowired
    private EmployeeMasterRepository repository;

    public List<EmployeeMaster> getAllEmployees() {
        return repository.findAll();
    }

    public EmployeeMaster getEmployeeById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public EmployeeMaster createEmployee(EmployeeMaster employee) {
        if (employee.getCreatedDate() == null) {
            employee.setCreatedDate(new Date());
        }
        return repository.save(employee);
    }

    public EmployeeMaster updateEmployee(Long id, EmployeeMaster employeeDetails) {
        EmployeeMaster employee = repository.findById(id).orElse(null);
        if (employee != null) {
            employee.setCategoryId(employeeDetails.getCategoryId());
            employee.setEmpLevelId(employeeDetails.getEmpLevelId());
            employee.setEmployeeTypeId(employeeDetails.getEmployeeTypeId());
            employee.setTitle(employeeDetails.getTitle());
            employee.setEmployeeName(employeeDetails.getEmployeeName());
            employee.setFatherHusbandName(employeeDetails.getFatherHusbandName());
            employee.setEmpCode(employeeDetails.getEmpCode());
            
            employee.setDepartmentId(employeeDetails.getDepartmentId());
            employee.setDesignationId(employeeDetails.getDesignationId());
            employee.setDateOfJoining(employeeDetails.getDateOfJoining());
            employee.setConfirmationDate(employeeDetails.getConfirmationDate());
            employee.setUnitId(employeeDetails.getUnitId());
            employee.setReferMode(employeeDetails.getReferMode());
            employee.setProfileUpload(employeeDetails.getProfileUpload());
            employee.setSignature(employeeDetails.getSignature());
            
            employee.setStatus(employeeDetails.getStatus());
            employee.setUpdatedBy(employeeDetails.getUpdatedBy());
            
            return repository.save(employee);
        }
        return null;
    }

    public void deleteEmployee(Long id) {
        repository.deleteById(id);
    }
}
