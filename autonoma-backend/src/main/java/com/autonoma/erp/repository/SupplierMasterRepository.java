package com.autonoma.erp.repository;

import com.autonoma.erp.model.SupplierMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupplierMasterRepository extends JpaRepository<SupplierMaster, Long> {
    Optional<SupplierMaster> findBySupplierCode(String supplierCode);
    
    Optional<SupplierMaster> findTopBySupplierCodeStartingWithOrderBySupplierCodeDesc(String prefix);
    
    boolean existsBySupplierName(String supplierName);
    boolean existsBySupplierNameAndIdNot(String supplierName, Long id);
    boolean existsBySupplierCode(String supplierCode);
    boolean existsBySupplierCodeAndIdNot(String supplierCode, Long id);
}
