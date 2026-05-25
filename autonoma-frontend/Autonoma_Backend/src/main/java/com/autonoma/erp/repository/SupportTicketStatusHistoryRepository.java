package com.autonoma.erp.repository;

import com.autonoma.erp.model.SupportTicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketStatusHistoryRepository extends JpaRepository<SupportTicketStatusHistory, Integer> {
    List<SupportTicketStatusHistory> findByTicketRowIdOrderByUpdatedAtAsc(Integer ticketRowId);
}
