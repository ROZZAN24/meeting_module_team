package com.autonoma.erp.repository;

import com.autonoma.erp.model.SmPriceMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmPriceMasterRepository extends JpaRepository<SmPriceMaster, Long> {

    List<SmPriceMaster> findByStatus(String status);

    List<SmPriceMaster> findByCustomerNameContainingIgnoreCase(String customerName);

    @Query("SELECT MAX(p.id) FROM SmPriceMaster p")
    Optional<Long> findMaxId();
}
