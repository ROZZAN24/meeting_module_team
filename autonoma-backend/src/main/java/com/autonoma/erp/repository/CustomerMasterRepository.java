package com.autonoma.erp.repository;

import com.autonoma.erp.model.CustomerMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerMasterRepository extends JpaRepository<CustomerMaster, Long> {
    Optional<CustomerMaster> findByCustomerCode(String customerCode);
    
    Optional<CustomerMaster> findTopByCustomerCodeStartingWithOrderByCustomerCodeDesc(String prefix);
}
