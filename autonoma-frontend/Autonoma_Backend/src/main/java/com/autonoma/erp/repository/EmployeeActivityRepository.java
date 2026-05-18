package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeActivityRepository extends JpaRepository<EmployeeActivity, Long> {
    List<EmployeeActivity> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
