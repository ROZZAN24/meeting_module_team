package com.autonoma.erp.repository;

import com.autonoma.erp.model.DeliveryTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryTermRepository extends JpaRepository<DeliveryTerm, Long> {
}
