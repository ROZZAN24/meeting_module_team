package com.autonoma.erp.repository;

import com.autonoma.erp.model.ProductItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemTypeRepository extends JpaRepository<ProductItemType, Long> {
    List<ProductItemType> findByGroupId(Long groupId);
    Optional<ProductItemType> findByGroupIdAndItemType(Long groupId, String itemType);
}
