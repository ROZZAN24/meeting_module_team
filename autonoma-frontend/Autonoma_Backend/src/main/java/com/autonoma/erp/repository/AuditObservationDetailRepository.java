package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditObservationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditObservationDetailRepository extends JpaRepository<AuditObservationDetail, Long> {
    @Query("SELECT ad FROM AuditObservationDetail ad " +
           "JOIN FETCH ad.auditObservation ao " +
           "WHERE ad.approvalStatus != 'CLOSED' " +
           "AND (:observationStatus IS NULL OR :observationStatus = 'All' OR ad.observationStatus = :observationStatus) " +
           "AND (:ncrStatus IS NULL OR :ncrStatus = 'All' OR ad.ncrStatus = :ncrStatus) " +
           "AND (:ncrApprovedBy IS NULL OR :ncrApprovedBy = 'All' OR ao.ncrApprovedBy = :ncrApprovedBy) " +
           "AND (:query IS NULL OR ao.observationNo LIKE %:query% OR ao.auditScheduleNo LIKE %:query% OR ao.auditType LIKE %:query%) " +
           "AND (:considerDate = 'No' OR (ao.observationDate >= :fromDate AND ao.observationDate <= :toDate))")
    List<AuditObservationDetail> findPendingNcrFindingsFiltered(
            @org.springframework.data.repository.query.Param("fromDate") String fromDate,
            @org.springframework.data.repository.query.Param("toDate") String toDate,
            @org.springframework.data.repository.query.Param("considerDate") String considerDate,
            @org.springframework.data.repository.query.Param("observationStatus") String observationStatus,
            @org.springframework.data.repository.query.Param("ncrStatus") String ncrStatus,
            @org.springframework.data.repository.query.Param("ncrApprovedBy") String ncrApprovedBy,
            @org.springframework.data.repository.query.Param("query") String query);

    @Query("SELECT ad FROM AuditObservationDetail ad JOIN ad.auditObservation ao WHERE ad.observationStatus IN ('NCR', 'OFI') AND ad.approvalStatus != 'CLOSED'")
    List<AuditObservationDetail> findPendingNcrFindings();

    @Query("SELECT d FROM AuditObservationDetail d WHERE d.observationStatus IN ('NCR', 'OFI')")
    List<AuditObservationDetail> findAllNcrAndOfi();

    List<AuditObservationDetail> findByObservationStatus(String status);

    AuditObservationDetail findFirstByNcrNoIsNotNullOrderByNcrNoDesc();
}
