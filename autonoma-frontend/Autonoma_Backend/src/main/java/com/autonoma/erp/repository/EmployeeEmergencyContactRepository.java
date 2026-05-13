package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeEmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeEmergencyContactRepository extends JpaRepository<EmployeeEmergencyContact, Long> {
    List<EmployeeEmergencyContact> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
