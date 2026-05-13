package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeePersonalDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeePersonalDetailRepository extends JpaRepository<EmployeePersonalDetail, Long> {
    Optional<EmployeePersonalDetail> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
