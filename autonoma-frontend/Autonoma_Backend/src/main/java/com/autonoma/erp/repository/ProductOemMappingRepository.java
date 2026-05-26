package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductOemMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductOemMappingRepository extends JpaRepository<ProductOemMapping, Long> {

    List<ProductOemMapping> findByStatus(String status);

    boolean existsByPartNoIgnoreCase(String partNo);

    boolean existsByPartNoIgnoreCaseAndIdNot(String partNo, Long id);
}
