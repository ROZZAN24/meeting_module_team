package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeTypeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeTypeMasterRepository extends JpaRepository<EmployeeTypeMaster, Long> {
}
