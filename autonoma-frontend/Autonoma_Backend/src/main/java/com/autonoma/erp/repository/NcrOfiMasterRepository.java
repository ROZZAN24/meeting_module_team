package com.autonoma.erp.repository;

import com.autonoma.erp.model.NcrOfiMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NcrOfiMasterRepository extends JpaRepository<NcrOfiMaster, Integer> {
    Optional<NcrOfiMaster> findByNcrOfiNo(String ncrOfiNo);
    
    @Query("SELECT MAX(n.ncrOfiNo) FROM NcrOfiMaster n WHERE n.type = :type AND n.ncrOfiNo LIKE :prefix")
    String findMaxNoByTypeAndPrefix(String type, String prefix);
    
    Optional<NcrOfiMaster> findByObservationDetailId(Integer observationDetailId);
}
