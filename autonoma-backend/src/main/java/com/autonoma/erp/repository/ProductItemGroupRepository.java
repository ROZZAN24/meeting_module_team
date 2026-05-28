package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductItemGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductItemGroupRepository extends JpaRepository<ProductItemGroup, Long> {
    Optional<ProductItemGroup> findByGroupName(String groupName);
}
