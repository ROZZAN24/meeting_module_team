package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductModelRepository extends JpaRepository<ProductModel, Long> {

    List<ProductModel> findByStatus(String status);

    boolean existsByModelNoIgnoreCase(String modelNo);

    boolean existsByModelNoIgnoreCaseAndIdNot(String modelNo, Long id);
}
