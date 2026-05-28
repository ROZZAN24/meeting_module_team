package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeKyc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeeKycRepository extends JpaRepository<EmployeeKyc, Long> {
    Optional<EmployeeKyc> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
