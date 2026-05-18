package com.autonoma.erp.repository;

import com.autonoma.erp.model.AuditObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AuditObservationRepository extends JpaRepository<AuditObservation, Long> {
    @Query("SELECT MAX(CAST(o.observationNo AS int)) FROM AuditObservation o WHERE o.observationNo LIKE '[0-9]%'")
    Optional<Integer> findMaxObservationNo();

    java.util.Optional<AuditObservation> findFirstByOrderByObservationNoDesc();
}
