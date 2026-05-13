package com.autonoma.erp.repository;

import com.autonoma.erp.model.QmsMomMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QmsMomMasterRepository extends JpaRepository<QmsMomMaster, Long> {
    @Query("SELECT MAX(m.id) FROM QmsMomMaster m")
    Optional<Long> findMaxId();
    
    Optional<QmsMomMaster> findByMomNo(String momNo);
}
