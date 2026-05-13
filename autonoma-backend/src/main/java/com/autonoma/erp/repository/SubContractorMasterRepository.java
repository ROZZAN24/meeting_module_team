package com.autonoma.erp.repository;

import com.autonoma.erp.model.SubContractorMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SubContractorMasterRepository extends JpaRepository<SubContractorMaster, Long> {
    Optional<SubContractorMaster> findBySubcontractorCode(String subcontractorCode);
    
    @Query("SELECT MAX(s.subcontractorCode) FROM SubContractorMaster s")
    String findMaxSubcontractorCode();
}
