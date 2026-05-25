package com.autonoma.erp.repository;

import com.autonoma.erp.model.SmQuotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmQuotationRepository extends JpaRepository<SmQuotation, Long> {

    List<SmQuotation> findByStatus(String status);

    List<SmQuotation> findByCustomerNameContainingIgnoreCase(String customerName);

    @Query("SELECT MAX(q.id) FROM SmQuotation q")
    Optional<Long> findMaxId();

    boolean existsByQuotationNo(String quotationNo);
    boolean existsByQuotationNoAndIdNot(String quotationNo, Long id);
}
