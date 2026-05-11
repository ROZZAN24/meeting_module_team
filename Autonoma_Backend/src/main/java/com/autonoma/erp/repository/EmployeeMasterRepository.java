package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeMasterRepository extends JpaRepository<EmployeeMaster, Long> {
    boolean existsByEmpCode(String empCode);
    java.util.Optional<EmployeeMaster> findFirstByOrderByEmpCodeDesc();
}
