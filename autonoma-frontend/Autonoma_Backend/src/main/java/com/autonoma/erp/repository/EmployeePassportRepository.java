package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeePassport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeePassportRepository extends JpaRepository<EmployeePassport, Long> {
    Optional<EmployeePassport> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
