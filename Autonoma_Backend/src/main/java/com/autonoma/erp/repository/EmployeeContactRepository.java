package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeeContactRepository extends JpaRepository<EmployeeContact, Long> {
    Optional<EmployeeContact> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
