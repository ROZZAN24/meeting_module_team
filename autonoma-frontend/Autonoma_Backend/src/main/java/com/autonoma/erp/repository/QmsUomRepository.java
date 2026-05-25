package com.autonoma.erp.repository;

import com.autonoma.erp.model.QmsUom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QmsUomRepository extends JpaRepository<QmsUom, Long> {

    List<QmsUom> findByStatus(String status);

    boolean existsByUomCodeIgnoreCase(String uomCode);

    boolean existsByUomCodeIgnoreCaseAndIdNot(String uomCode, Long id);
}
