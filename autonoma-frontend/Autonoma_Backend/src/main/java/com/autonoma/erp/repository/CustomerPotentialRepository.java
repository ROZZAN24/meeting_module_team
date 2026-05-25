package com.autonoma.erp.repository;

import com.autonoma.erp.model.CustomerPotential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerPotentialRepository extends JpaRepository<CustomerPotential, Long> {
}
