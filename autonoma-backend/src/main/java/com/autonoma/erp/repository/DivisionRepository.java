package com.autonoma.erp.repository;

import com.autonoma.erp.model.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {

    /** All divisions for a specific company */
    List<Division> findByCompanyId(Long companyId);

    /** Active divisions for a specific company (status = true/1) */
    List<Division> findByCompanyIdAndStatus(Long companyId, Boolean status);

    /** Next sequence number (global) */
    @Query("SELECT MAX(d.sequenceNo) FROM Division d")
    java.util.Optional<Integer> findMaxSequenceNo();
}
