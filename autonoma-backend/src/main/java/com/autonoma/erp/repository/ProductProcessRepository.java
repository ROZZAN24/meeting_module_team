package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductProcessRepository extends JpaRepository<ProductProcess, Long> {

    List<ProductProcess> findByStatus(String status);

    boolean existsByProcessNameIgnoreCase(String processName);
    boolean existsByProcessNameIgnoreCaseAndIdNot(String processName, Long id);
}
