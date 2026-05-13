package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeAssetRepository extends JpaRepository<EmployeeAsset, Long> {
    List<EmployeeAsset> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
