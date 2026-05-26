package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductCapacityRepository extends JpaRepository<ProductCapacity, Long> {

    boolean existsByModelIdAndUomIgnoreCaseAndCapacityVal(Long modelId, String uom, Double capacityVal);

    boolean existsByModelIdAndUomIgnoreCaseAndCapacityValAndIdNot(Long modelId, String uom, Double capacityVal, Long id);
}
