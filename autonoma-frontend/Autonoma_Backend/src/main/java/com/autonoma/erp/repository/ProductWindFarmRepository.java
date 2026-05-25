package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductWindFarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductWindFarmRepository extends JpaRepository<ProductWindFarm, Long> {

    boolean existsByWindFarmNameIgnoreCase(String windFarmName);

    boolean existsByWindFarmNameIgnoreCaseAndIdNot(String windFarmName, Long id);
}
