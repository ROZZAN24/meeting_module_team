package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductOem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductOemRepository extends JpaRepository<ProductOem, Long> {

    List<ProductOem> findByStatus(String status);

    boolean existsByOemShortNameIgnoreCase(String oemShortName);

    boolean existsByOemShortNameIgnoreCaseAndIdNot(String oemShortName, Long id);
}
