package com.autonoma.erp.repository;

import com.autonoma.erp.model.ModeOfDespatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModeOfDespatchRepository extends JpaRepository<ModeOfDespatch, Long> {
    List<ModeOfDespatch> findByStatus(String status);
}
