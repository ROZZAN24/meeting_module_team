package com.autonoma.erp.repository;

import com.autonoma.erp.model.TicketTraceabilityCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketTraceabilityCenterRepository extends JpaRepository<TicketTraceabilityCenter, Integer> {
    
    List<TicketTraceabilityCenter> findAllByOrderByCreatedAtDesc();
    
    Optional<TicketTraceabilityCenter> findByTicketId(String ticketId);
    
    @Query("SELECT t FROM TicketTraceabilityCenter t WHERE t.ticketId LIKE :pattern ORDER BY t.ticketId DESC")
    List<TicketTraceabilityCenter> findLatestByTicketIdPattern(@Param("pattern") String pattern);
}
