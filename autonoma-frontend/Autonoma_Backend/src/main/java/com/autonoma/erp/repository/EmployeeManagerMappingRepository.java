package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeManagerMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeeManagerMappingRepository extends JpaRepository<EmployeeManagerMapping, Long> {
    Optional<EmployeeManagerMapping> findByEmpId(Long empId);
    Optional<EmployeeManagerMapping> findByEmpIdAndStatus(Long empId, String status);
}
