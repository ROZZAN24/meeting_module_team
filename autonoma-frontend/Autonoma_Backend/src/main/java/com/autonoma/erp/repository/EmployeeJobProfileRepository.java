package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeJobProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeeJobProfileRepository extends JpaRepository<EmployeeJobProfile, Long> {
    Optional<EmployeeJobProfile> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
