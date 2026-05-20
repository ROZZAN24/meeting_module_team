package com.autonoma.erp.repository;

import com.autonoma.erp.model.VerificationCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificationCriteriaRepository extends JpaRepository<VerificationCriteria, Long> {
    @Query("SELECT MAX(v.id) FROM VerificationCriteria v")
    Long findMaxId();
}
