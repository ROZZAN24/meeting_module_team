package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditObservationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditObservationDetailRepository extends JpaRepository<AuditObservationDetail, Long> {
    @Query("SELECT d FROM AuditObservationDetail d WHERE d.observationStatus IN ('NCR', 'OFI')")
    List<AuditObservationDetail> findAllNcrAndOfi();

    List<AuditObservationDetail> findByObservationStatus(String status);
}
