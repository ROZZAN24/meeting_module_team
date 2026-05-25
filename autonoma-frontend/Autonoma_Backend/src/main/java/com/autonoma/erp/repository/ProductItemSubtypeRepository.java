package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductItemSubtype;
import com.autonoma.erp.model.ProductItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductItemSubtypeRepository extends JpaRepository<ProductItemSubtype, Long> {

    List<ProductItemSubtype> findByStatus(String status);

    boolean existsByTypeAndSubTypeIgnoreCase(ProductItemType type, String subType);

    boolean existsByTypeAndSubTypeIgnoreCaseAndIdNot(ProductItemType type, String subType, Long id);
}
