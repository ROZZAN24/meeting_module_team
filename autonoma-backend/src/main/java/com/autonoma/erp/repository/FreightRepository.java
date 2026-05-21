package com.autonoma.erp.repository;

import com.autonoma.erp.model.Freight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FreightRepository extends JpaRepository<Freight, Long> {
    List<Freight> findByStatus(String status);
}
