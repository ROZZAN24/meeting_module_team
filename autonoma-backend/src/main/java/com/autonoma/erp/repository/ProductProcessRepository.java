package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductProcessRepository extends JpaRepository<ProductProcess, Long> {
    boolean existsByProcessNameIgnoreCase(String processName);
    boolean existsByProcessNameIgnoreCaseAndIdNot(String processName, Long id);
}
