package com.autonoma.erp.repository;

import com.autonoma.erp.model.SmEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmEnquiryRepository extends JpaRepository<SmEnquiry, Long> {

    List<SmEnquiry> findByStatus(String status);

    List<SmEnquiry> findByCustomerNameContainingIgnoreCase(String customerName);

    @Query("SELECT MAX(e.id) FROM SmEnquiry e")
    Optional<Long> findMaxId();
}
