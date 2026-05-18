package com.autonoma.erp.repository;

import com.autonoma.erp.model.CustomerMaster;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
=======
import org.springframework.data.jpa.repository.Query;
>>>>>>> origin/chore/repo-cleanup
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerMasterRepository extends JpaRepository<CustomerMaster, Long> {
    Optional<CustomerMaster> findByCustomerCode(String customerCode);
<<<<<<< HEAD

    Optional<CustomerMaster> findTopByCustomerCodeStartingWithOrderByCustomerCodeDesc(String prefix);

    boolean existsByCustomerNameIgnoreCase(String name);

    boolean existsByCustomerNameIgnoreCaseAndIdNot(String name, Long id);
=======
    
    @Query("SELECT MAX(c.customerCode) FROM CustomerMaster c")
    String findMaxCustomerCode();
>>>>>>> origin/chore/repo-cleanup
}
