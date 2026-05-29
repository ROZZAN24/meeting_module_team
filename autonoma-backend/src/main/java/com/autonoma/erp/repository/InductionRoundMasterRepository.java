package com.autonoma.erp.repository;

import com.autonoma.erp.model.InductionRoundMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InductionRoundMasterRepository extends JpaRepository<InductionRoundMaster, Long> {

    @Query("SELECT r FROM InductionRoundMaster r WHERE r.status = 'ACTIVE' ORDER BY r.displayOrder ASC, r.roundName ASC")
    List<InductionRoundMaster> findAllActive();

    Optional<InductionRoundMaster> findByRoundName(String roundName);

    @Query("SELECT r FROM InductionRoundMaster r ORDER BY r.displayOrder ASC, r.roundName ASC")
    List<InductionRoundMaster> findAllOrdered();
}
