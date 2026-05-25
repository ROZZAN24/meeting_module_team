package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeMasterRepository extends JpaRepository<EmployeeMaster, Long> {
    boolean existsByEmpCode(String empCode);
    boolean existsByEmpCodeAndIdNot(String empCode, Long id);
    java.util.Optional<EmployeeMaster> findFirstByOrderByEmpCodeDesc();
    java.util.List<EmployeeMaster> findByStatus(String status);
    java.util.Optional<EmployeeMaster> findByEmpCode(String empCode);
    java.util.List<EmployeeMaster> findByIsInductionEligibleAndStatus(String isInductionEligible, String status);
}
