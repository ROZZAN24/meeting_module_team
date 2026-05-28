package com.autonoma.erp.repository;

import com.autonoma.erp.model.PaymentTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTermRepository extends JpaRepository<PaymentTerm, Long> {
    boolean existsByTermNameIgnoreCase(String termName);
}
